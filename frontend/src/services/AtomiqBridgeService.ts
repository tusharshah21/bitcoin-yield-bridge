// Atomiq SDK Integration for Lightning Network Bridge
import { Transaction } from '../types';
import { APP_CONFIG } from '../constants';

const ATOMIQ_CONFIG = APP_CONFIG.atomiq;

export interface AtomiqBridgeParams {
  fromToken: 'BTC' | 'USDC' | 'ETH';
  toToken: 'BTC' | 'USDC' | 'ETH';
  amount: number;
  fromAddress: string;
  toAddress: string;
  slippage?: number; // Percentage (e.g., 0.5 for 0.5%)
}

export interface AtomiqBridgeResult {
  id: string;
  expectedOutput: number;
  exchangeRate: number;
  fees: {
    bitcoin: number;
    lightning: number;
    starknet: number;
    total: number;
  };
  estimatedTime: number; // Seconds
  lightningInvoice?: string;
  bitcoinAddress?: string;
}

export interface AtomiqBridgeStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  actualOutput?: number;
  bitcoinTxId?: string;
  starknetTxHash?: string;
  failureReason?: string;
  progress: {
    stage: 'initiated' | 'bitcoin_confirmed' | 'lightning_routing' | 'starknet_processing' | 'completed';
    percentage: number;
    message: string;
  };
}

export interface AtomiqQuote {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  fees: {
    bitcoin: number;
    lightning: number;
    starknet: number;
    total: number;
  };
  priceImpact: number;
  validUntil: number; // Timestamp
}

export class AtomiqBridgeService {
  private apiKey: string;
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;

  constructor() {
    this.apiKey = APP_CONFIG.atomiq.apiKey;
    this.baseUrl = APP_CONFIG.atomiq.baseUrl;
  }

  // BRIDGE OPERATIONS

  async getQuote(params: Omit<AtomiqBridgeParams, 'fromAddress' | 'toAddress'>): Promise<AtomiqQuote> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/quote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from_token: params.fromToken,
          to_token: params.toToken,
          amount: params.amount,
          slippage: params.slippage || 0.5
        })
      });

      if (!response.ok) {
        throw new Error(`Quote request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        fromToken: data.from_token,
        toToken: data.to_token,
        fromAmount: data.from_amount,
        toAmount: data.to_amount,
        exchangeRate: data.exchange_rate,
        fees: {
          bitcoin: data.fees.bitcoin || 0,
          lightning: data.fees.lightning || 0,
          starknet: data.fees.starknet || 0,
          total: data.fees.total
        },
        priceImpact: data.price_impact || 0,
        validUntil: data.valid_until
      };

    } catch (error) {
      throw new Error(`Failed to get quote: ${(error as Error).message}`);
    }
  }

  async initiateBridge(params: AtomiqBridgeParams): Promise<AtomiqBridgeResult> {
    try {
      // First get a fresh quote
      const quote = await this.getQuote({
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount
      });
      
      // Verify quote is still valid
      if (Date.now() > quote.validUntil) {
        throw new Error('Quote expired, please get a new quote');
      }

      const requestParams = new URLSearchParams({
        amount: params.amount.toString(),
        fromChain: 'bitcoin',
        toChain: 'starknet',
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
      });
      
      const response = await fetch(`${ATOMIQ_CONFIG.baseUrl}/api/v1/bridge/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-API-Key': ATOMIQ_CONFIG.apiKey,
        },
        body: requestParams
      });

      if (!response.ok) {
        throw new Error(`Bridge initiation failed: ${response.statusText}`);
      }

      const data = await response.json();

      const result: AtomiqBridgeResult = {
        id: data.bridge_id,
        expectedOutput: data.expected_output,
        exchangeRate: data.exchange_rate,
        fees: {
          bitcoin: data.fees.bitcoin || 0,
          lightning: data.fees.lightning || 0,
          starknet: data.fees.starknet || 0,
          total: data.fees.total
        },
        estimatedTime: data.estimated_time || 300, // 5 minutes default
        lightningInvoice: data.lightning_invoice,
        bitcoinAddress: data.bitcoin_address
      };

      // Start monitoring this bridge transaction
      this.startBridgeMonitoring(result.id);

      return result;

    } catch (error) {
      throw new Error(`Failed to initiate bridge: ${(error as Error).message}`);
    }
  }

  async getBridgeStatus(bridgeId: string): Promise<AtomiqBridgeStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/bridge/status/${bridgeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Status request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.bridge_id,
        status: data.status,
        actualOutput: data.actual_output,
        bitcoinTxId: data.bitcoin_tx_id,
        starknetTxHash: data.starknet_tx_hash,
        failureReason: data.failure_reason,
        progress: {
          stage: data.progress.stage,
          percentage: data.progress.percentage,
          message: data.progress.message
        }
      };

    } catch (error) {
      throw new Error(`Failed to get bridge status: ${(error as Error).message}`);
    }
  }

  // TRANSACTION HISTORY

  async getTransactionHistory(userAddress: string, limit: number = 50): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams({
        user_address: userAddress,
        limit: limit.toString()
      });

      const response = await fetch(`${this.baseUrl}/v1/transactions?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`History request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return data.transactions.map((tx: any): Transaction => ({
        id: tx.id,
        type: 'bridge' as const,
        amount: tx.amount,
        token: tx.from_token,
        timestamp: tx.timestamp,
        status: tx.status as 'pending' | 'completed' | 'failed',
        hash: tx.starknet_tx_hash,
        from: tx.from_address || '',
        to: tx.to_address || '',
        fee: tx.fees?.total || 0,
        gasUsed: tx.gas_used
      }));

    } catch (error) {
      throw new Error(`Failed to get transaction history: ${(error as Error).message}`);
    }
  }

  // FEE ESTIMATION

  async estimateFees(params: Omit<AtomiqBridgeParams, 'fromAddress' | 'toAddress'>): Promise<{
    bitcoin: number;
    lightning: number;
    starknet: number;
    total: number;
  }> {
    try {
      const quote = await this.getQuote(params);
      return quote.fees;
    } catch (error) {
      throw new Error(`Failed to estimate fees: ${(error as Error).message}`);
    }
  }

  // SLIPPAGE PROTECTION

  async calculateOptimalSlippage(params: Omit<AtomiqBridgeParams, 'fromAddress' | 'toAddress'>): Promise<number> {
    try {
      // Get multiple quotes with different slippage values
      const slippageValues = [0.1, 0.5, 1.0, 2.0];
      const quotes = await Promise.all(
        slippageValues.map(slippage => 
          this.getQuote({ ...params, slippage }).catch(() => null)
        )
      );

      // Find optimal slippage (best output with reasonable protection)
      let bestSlippage = 0.5; // Default
      let bestScore = 0;

      quotes.forEach((quote, index) => {
        if (!quote) return;
        
        // Score based on output amount and slippage protection
        const outputScore = quote.toAmount / params.amount;
        const protectionScore = 1 - (slippageValues[index] / 10); // Lower slippage = higher score
        const totalScore = (outputScore * 0.7) + (protectionScore * 0.3);

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestSlippage = slippageValues[index];
        }
      });

      return bestSlippage;

    } catch (error) {
      // Return conservative default if calculation fails
      return 0.5;
    }
  }

  // REAL-TIME MONITORING

  private async startBridgeMonitoring(bridgeId: string): Promise<void> {
    try {
      // Connect to WebSocket for real-time updates
      const wsUrl = `${this.baseUrl.replace('http', 'ws')}/v1/bridge/ws/${bridgeId}`;
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleBridgeUpdate(data);
        } catch (error) {
          // Handle parsing error
        }
      };

      this.wsConnection.onerror = (error) => {
        // Handle WebSocket error
      };

      this.wsConnection.onclose = () => {
        // Cleanup on close
        this.wsConnection = null;
      };

    } catch (error) {
      // Fallback to polling if WebSocket fails
      this.startBridgePolling(bridgeId);
    }
  }

  private startBridgePolling(bridgeId: string): void {
    const pollInterval = setInterval(async () => {
      try {
        const status = await this.getBridgeStatus(bridgeId);
        this.handleBridgeUpdate(status);

        // Stop polling when complete or failed
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        // Handle polling error
      }
    }, 5000); // Poll every 5 seconds
  }

  private handleBridgeUpdate(data: any): void {
    // Emit events that can be listened to by the main service
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent('atomiq_bridge_update', {
        detail: data
      });
      window.dispatchEvent(event);
    }
  }

  // ERROR HANDLING

  async retryFailedBridge(bridgeId: string): Promise<AtomiqBridgeResult> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/bridge/retry/${bridgeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Retry request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        id: data.bridge_id,
        expectedOutput: data.expected_output,
        exchangeRate: data.exchange_rate,
        fees: data.fees,
        estimatedTime: data.estimated_time,
        lightningInvoice: data.lightning_invoice,
        bitcoinAddress: data.bitcoin_address
      };

    } catch (error) {
      throw new Error(`Failed to retry bridge: ${(error as Error).message}`);
    }
  }

  async cancelBridge(bridgeId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/bridge/cancel/${bridgeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;

    } catch (error) {
      return false;
    }
  }

  // UTILITY METHODS

  getSupportedNetworks(): string[] {
    return APP_CONFIG.atomiq.supportedNetworks;
  }

  async getNetworkStatus(): Promise<{
    bitcoin: boolean;
    lightning: boolean;
    starknet: boolean;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return { bitcoin: false, lightning: false, starknet: false };
      }

      const data = await response.json();
      return data.networks || { bitcoin: false, lightning: false, starknet: false };

    } catch (error) {
      return { bitcoin: false, lightning: false, starknet: false };
    }
  }

  async getExchangeRates(): Promise<{
    BTC_USD: number;
    BTC_USDC: number;
    ETH_USD: number;
    ETH_USDC: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/rates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get exchange rates');
      }

      const data = await response.json();
      return data.rates;

    } catch (error) {
      // Return fallback rates
      return {
        BTC_USD: 65000,
        BTC_USDC: 65000,
        ETH_USD: 3500,
        ETH_USDC: 3500
      };
    }
  }

  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}