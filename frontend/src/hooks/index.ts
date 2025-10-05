// Custom hooks for wallet and blockchain interactions
import { useState, useEffect, useCallback } from 'react';
import { 
  UseWalletReturn, 
  UseStarknetReturn, 
  UseContractReturn, 
  XverseWallet, 
  StarknetProvider,
  ContractCallResult,
  YieldStrategy,
  Transaction
} from '../types';
import XverseWalletService from '../services/XverseWalletService';
import StarknetService from '../services/StarknetService';

// Hook for Xverse Wallet management
export function useXverseWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<XverseWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletService] = useState(() => new XverseWalletService());

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const connectedWallet = await walletService.connectMobile();
      setWallet(connectedWallet);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [walletService]);

  const disconnect = useCallback(async () => {
    try {
      await walletService.disconnect();
      setWallet(null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect wallet';
      setError(errorMessage);
    }
  }, [walletService]);

  // Check for existing connection on mount
  useEffect(() => {
    const existingWallet = walletService.getWalletInfo();
    if (existingWallet?.isConnected) {
      setWallet(existingWallet);
    }
  }, [walletService]);

  return {
    wallet,
    connect,
    disconnect,
    isConnecting,
    error,
  };
}

// Hook for Starknet provider management
export function useStarknet(): UseStarknetReturn {
  const [provider, setProvider] = useState<StarknetProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starknetService] = useState(() => new StarknetService());

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const connectedProvider = await starknetService.connect();
      setProvider(connectedProvider);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Starknet';
      setError(errorMessage);
      console.error('Starknet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [starknetService]);

  const disconnect = useCallback(async () => {
    try {
      await starknetService.disconnect();
      setProvider(null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect from Starknet';
      setError(errorMessage);
    }
  }, [starknetService]);

  return {
    provider,
    connect,
    disconnect,
    isConnecting,
    error,
  };
}

// Hook for smart contract interactions
export function useContract(starknetService: StarknetService | null): UseContractReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deposit = useCallback(async (amount: number, strategyId: number): Promise<ContractCallResult> => {
    if (!starknetService) {
      throw new Error('Starknet service not available');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await starknetService.depositAndYield(amount, strategyId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deposit failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [starknetService]);

  const withdraw = useCallback(async (amount: number): Promise<ContractCallResult> => {
    if (!starknetService) {
      throw new Error('Starknet service not available');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await starknetService.withdrawYield(amount);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [starknetService]);

  const getUserBalance = useCallback(async (address: string): Promise<number> => {
    if (!starknetService) {
      return 0;
    }

    try {
      return await starknetService.getUserBalance(address);
    } catch (err) {
      console.error('Error getting user balance:', err);
      return 0;
    }
  }, [starknetService]);

  const getStrategies = useCallback(async (): Promise<YieldStrategy[]> => {
    if (!starknetService) {
      return [];
    }

    try {
      return await starknetService.getYieldStrategies();
    } catch (err) {
      console.error('Error getting strategies:', err);
      return [];
    }
  }, [starknetService]);

  return {
    deposit,
    withdraw,
    getUserBalance,
    getStrategies,
    isLoading,
    error,
  };
}

// Hook for portfolio management
export function usePortfolio(walletAddress: string | null, starknetService: StarknetService | null) {
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalYield, setTotalYield] = useState(0);
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPortfolio = useCallback(async () => {
    if (!walletAddress || !starknetService) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [balance, yield_, userPositions] = await Promise.all([
        starknetService.getUserBalance(walletAddress),
        starknetService.getTotalYield(),
        starknetService.getUserPositions(walletAddress),
      ]);

      setTotalBalance(balance);
      setTotalYield(yield_);
      setPositions(userPositions as any);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolio';
      setError(errorMessage);
      console.error('Portfolio fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, starknetService]);

  // Auto-refresh portfolio data
  useEffect(() => {
    refreshPortfolio();
    
    const interval = setInterval(refreshPortfolio, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [refreshPortfolio]);

  return {
    totalBalance,
    totalYield,
    positions,
    isLoading,
    error,
    refresh: refreshPortfolio,
  };
}

// Hook for transaction history
export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTransaction = useCallback((transaction: any) => {
    setTransactions(prev => [transaction, ...prev]);
  }, []);

  const updateTransaction = useCallback((txHash: string, updates: any) => {
    setTransactions(prev => 
      prev.map((tx: any) => 
        tx.txHash === txHash ? { ...tx, ...updates } : tx
      )
    );
  }, []);

  const refreshTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In production, this would fetch from API or blockchain
      // For now, return mock data
      const mockTransactions = [
        {
          id: '1',
          type: 'deposit',
          amount: 1000,
          token: 'USDC',
          strategy: { name: 'Vesu Lending', id: 1 },
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
          status: 'confirmed',
          txHash: '0x123...abc',
        },
        {
          id: '2', 
          type: 'yield',
          amount: 52,
          token: 'USDC',
          timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
          status: 'confirmed',
          yieldEarned: 52,
        },
      ];
      
      setTransactions(mockTransactions as any);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  return {
    transactions,
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    refresh: refreshTransactions,
  };
}

// Hook for real-time price data
export function usePrices() {
  const [prices, setPrices] = useState({
    btc: 65000,
    eth: 3500,
    usdc: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshPrices = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Mock price data - in production, fetch from CoinGecko or other API
      const mockPrices = {
        btc: 65000 + (Math.random() - 0.5) * 1000, // ±$500 variation
        eth: 3500 + (Math.random() - 0.5) * 100,   // ±$50 variation
        usdc: 1.00,
      };
      
      setPrices(mockPrices);
    } catch (err) {
      console.error('Price fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPrices();
    
    const interval = setInterval(refreshPrices, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [refreshPrices]);

  return {
    prices,
    isLoading,
    refresh: refreshPrices,
  };
}

// Hook for notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = useCallback((notification: any) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
}

export default {
  useXverseWallet,
  useStarknet,
  useContract,
  usePortfolio,
  useTransactionHistory,
  usePrices,
  useNotifications,
};