// WebSocket Service for Real-time Updates

// Simple EventEmitter implementation for React Native
class SimpleEventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }

  removeListener(event: string, listener: Function) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  }

  removeAllListeners(event?: string) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

import { APP_CONFIG } from '../constants';

const STARKNET_CONFIG = APP_CONFIG.starknet;

export interface WebSocketMessage {
  type: 'balance_update' | 'transaction_update' | 'yield_update' | 'bridge_update';
  data: any;
  timestamp: number;
}

export interface BalanceUpdate {
  address: string;
  balances: {
    [token: string]: number;
  };
  totalValue: number;
}

export interface TransactionUpdate {
  id: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockHash?: string;
  blockNumber?: number;
  gasUsed?: number;
}

export interface YieldUpdate {
  strategyId: number;
  newYield: number;
  apy: number;
  totalValue: number;
}

export class WebSocketService extends SimpleEventEmitter {
  private ws: any = null; // WebSocket type
  private connectionUrl: string = '';
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // Start with 1 second
  private heartbeatInterval: any = null;
  private userAddress: string = '';

  constructor(url?: string) {
    super();
    this.connectionUrl = url || this.getDefaultWebSocketUrl();
    
    // Auto-reconnection setup
    this.setupEventHandlers();
  }

  private getDefaultWebSocketUrl(): string {
    // Use the RPC URL to determine WebSocket endpoint
    const rpcUrl = STARKNET_CONFIG.rpcUrl;
    if (rpcUrl.includes('sepolia')) {
      return 'wss://starknet-sepolia.public.blastapi.io/ws/v0_7';
    }
    return 'wss://starknet-mainnet.public.blastapi.io/ws/v0_7';
  }

  private setupEventHandlers(): void {
    // Handle connection events
    this.on('connected', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    });

    this.on('disconnected', () => {
      this.isConnected = false;
      this.stopHeartbeat();
      this.attemptReconnect();
    });

    this.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  async connect(userAddress: string): Promise<void> {
    try {
      this.userAddress = userAddress;
      this.connectionUrl = `wss://api.bitcoinyieldbridge.com/ws/${userAddress}`;

      // Check if WebSocket is available (React Native vs Web)
      let WebSocketClass;
      
      if (typeof WebSocket !== 'undefined') {
        WebSocketClass = WebSocket;
      } else {
        throw new Error('WebSocket not available in this environment');
      }

      this.ws = new WebSocketClass(this.connectionUrl);

      this.ws.onopen = () => {
        this.emit('connected');
        this.sendSubscriptions();
      };

      this.ws.onmessage = (event: any) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = (event: any) => {
        this.emit('disconnected', event);
      };

      this.ws.onerror = (error: any) => {
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      throw new Error(`WebSocket connection failed: ${(error as Error).message}`);
    }
  }

  private sendSubscriptions(): void {
    if (!this.isConnected || !this.ws) return;

    // Subscribe to relevant channels
    const subscriptions = [
      {
        type: 'subscribe',
        channels: [
          `balance:${this.userAddress}`,
          `transactions:${this.userAddress}`,
          `yield:${this.userAddress}`,
          'market_data',
          'bridge_updates'
        ]
      }
    ];

    subscriptions.forEach(sub => {
      this.ws.send(JSON.stringify(sub));
    });
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      
      switch (message.type) {
        case 'balance_update':
          this.handleBalanceUpdate(message.data);
          break;
        case 'transaction_update':
          this.handleTransactionUpdate(message.data);
          break;
        case 'yield_update':
          this.handleYieldUpdate(message.data);
          break;
        case 'bridge_update':
          this.handleBridgeUpdate(message.data);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }

    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleBalanceUpdate(data: BalanceUpdate): void {
    this.emit('balance_update', data);
  }

  private handleTransactionUpdate(data: TransactionUpdate): void {
    this.emit('transaction_update', data);
  }

  private handleYieldUpdate(data: YieldUpdate): void {
    this.emit('yield_update', data);
  }

  private handleBridgeUpdate(data: any): void {
    this.emit('bridge_update', data);
  }

  // Public methods for external listeners
  onBalanceUpdate(callback: (data: BalanceUpdate) => void): void {
    this.on('balance_update', callback);
  }

  onTransactionUpdate(callback: (data: TransactionUpdate) => void): void {
    this.on('transaction_update', callback);
  }

  onYieldUpdate(callback: (data: YieldUpdate) => void): void {
    this.on('yield_update', callback);
  }

  onBridgeUpdate(callback: (data: any) => void): void {
    this.on('bridge_update', callback);
  }

  // Heartbeat to keep connection alive
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Reconnection logic
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect(this.userAddress);
    }, delay);
  }

  // Send custom messages
  async sendMessage(message: any): Promise<void> {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket not connected');
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      throw new Error(`Failed to send message: ${(error as Error).message}`);
    }
  }

  // Request specific data
  async requestPortfolioUpdate(): Promise<void> {
    await this.sendMessage({
      type: 'request_portfolio_update',
      address: this.userAddress,
      timestamp: Date.now()
    });
  }

  async requestTransactionHistory(limit: number = 50): Promise<void> {
    await this.sendMessage({
      type: 'request_transaction_history',
      address: this.userAddress,
      limit,
      timestamp: Date.now()
    });
  }

  async requestYieldData(): Promise<void> {
    await this.sendMessage({
      type: 'request_yield_data',
      address: this.userAddress,
      timestamp: Date.now()
    });
  }

  // Connection management
  async disconnect(): Promise<void> {
    try {
      this.stopHeartbeat();
      
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      this.isConnected = false;
      this.reconnectAttempts = 0;
      
    } catch (error) {
      console.error('Error during WebSocket disconnect:', error);
    }
  }

  // Status methods
  getConnectionStatus(): {
    isConnected: boolean;
    reconnectAttempts: number;
    userAddress: string;
  } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      userAddress: this.userAddress
    };
  }

  // Utility methods for React Native compatibility
  private async loadWebSocketLibrary(): Promise<any> {
    try {
      // For React Native, WebSocket is available globally
      if (typeof WebSocket !== 'undefined') {
        return WebSocket;
      }

      // Fallback - throw error if not available
      throw new Error('WebSocket not available in this environment');

    } catch (error) {
      throw new Error('WebSocket library not available');
    }
  }
}