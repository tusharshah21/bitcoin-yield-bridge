// React Native Integration Hook for Bitcoin Yield Bridge
import { useState, useEffect, useCallback } from 'react';
import { bitcoinYieldBridgeService } from '../services/BitcoinYieldBridgeService';
import { 
  XverseWallet, 
  StarknetProvider, 
  Portfolio, 
  Transaction, 
  YieldStrategy,
  BridgeTransaction 
} from '../types';

export interface UseBitcoinYieldBridgeReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  xverseWallet: XverseWallet | null;
  starknetAccount: StarknetProvider | null;
  
  // Portfolio data
  portfolio: Portfolio | null;
  transactions: Transaction[];
  isLoadingPortfolio: boolean;
  
  // Available strategies
  yieldStrategies: YieldStrategy[];
  
  // Connection methods
  connectWallets: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Trading methods
  depositBitcoin: (amount: number, strategyId: number) => Promise<BridgeTransaction>;
  withdrawYield: (amount: number, bitcoinAddress: string) => Promise<BridgeTransaction>;
  
  // Data refresh
  refreshPortfolio: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useBitcoinYieldBridge(): UseBitcoinYieldBridgeReturn {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [xverseWallet, setXverseWallet] = useState<XverseWallet | null>(null);
  const [starknetAccount, setStarknetAccount] = useState<StarknetProvider | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock yield strategies - in production these would come from the blockchain
  const [yieldStrategies] = useState<YieldStrategy[]>([
    {
      id: 1,
      name: 'Vesu Lending Pool',
      protocol: 'Vesu',
      apy: 8.5,
      tvl: 1250000,
      riskLevel: 2,
      icon: 'vesu-icon.png',
      description: 'Earn yield by lending USDC on Vesu protocol',
      isActive: true,
      minDeposit: 0.001,
      maxDeposit: 10
    },
    {
      id: 2,
      name: 'Troves Yield Aggregator',
      protocol: 'Troves',
      apy: 12.3,
      tvl: 850000,
      riskLevel: 3,
      icon: 'troves-icon.png',
      description: 'Automated yield farming across multiple DeFi protocols',
      isActive: true,
      minDeposit: 0.001,
      maxDeposit: 5
    }
  ]);

  // Connection methods
  const connectWallets = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const { xverse, starknet } = await bitcoinYieldBridgeService.connectWallet();
      
      setXverseWallet(xverse);
      setStarknetAccount(starknet);
      setIsConnected(true);
      
      // Load initial data
      await refreshPortfolio();
      await refreshTransactions();
      
    } catch (err) {
      setError(`Connection failed: ${(err as Error).message}`);
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await bitcoinYieldBridgeService.disconnect();
      
      setIsConnected(false);
      setXverseWallet(null);
      setStarknetAccount(null);
      setPortfolio(null);
      setTransactions([]);
      setError(null);
      
    } catch (err) {
      setError(`Disconnect failed: ${(err as Error).message}`);
      console.error('Disconnect error:', err);
    }
  }, []);

  // Trading methods
  const depositBitcoin = useCallback(async (
    amount: number, 
    strategyId: number
  ): Promise<BridgeTransaction> => {
    try {
      setError(null);
      
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      const bridgeTransaction = await bitcoinYieldBridgeService.depositBitcoin(amount, strategyId);
      
      // Refresh data after deposit
      setTimeout(() => {
        refreshPortfolio();
        refreshTransactions();
      }, 2000);
      
      return bridgeTransaction;
      
    } catch (err) {
      const errorMessage = `Deposit failed: ${(err as Error).message}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isConnected]);

  const withdrawYield = useCallback(async (
    amount: number, 
    bitcoinAddress: string
  ): Promise<BridgeTransaction> => {
    try {
      setError(null);
      
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      const bridgeTransaction = await bitcoinYieldBridgeService.withdrawYield(amount, bitcoinAddress);
      
      // Refresh data after withdrawal
      setTimeout(() => {
        refreshPortfolio();
        refreshTransactions();
      }, 2000);
      
      return bridgeTransaction;
      
    } catch (err) {
      const errorMessage = `Withdrawal failed: ${(err as Error).message}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isConnected]);

  // Data refresh methods
  const refreshPortfolio = useCallback(async () => {
    if (!isConnected) return;
    
    try {
      setIsLoadingPortfolio(true);
      const portfolioData = await bitcoinYieldBridgeService.getPortfolioData();
      setPortfolio(portfolioData);
    } catch (err) {
      console.error('Failed to refresh portfolio:', err);
      setError(`Failed to load portfolio: ${(err as Error).message}`);
    } finally {
      setIsLoadingPortfolio(false);
    }
  }, [isConnected]);

  const refreshTransactions = useCallback(async () => {
    if (!isConnected) return;
    
    try {
      const transactionHistory = await bitcoinYieldBridgeService.getTransactionHistory(50);
      setTransactions(transactionHistory);
    } catch (err) {
      console.error('Failed to refresh transactions:', err);
    }
  }, [isConnected]);

  // Error handling
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;

    const handlePortfolioUpdate = (data: any) => {
      setPortfolio(prevPortfolio => ({
        ...prevPortfolio,
        ...data
      }));
    };

    const handleTransactionUpdate = (transaction: Transaction) => {
      setTransactions(prev => {
        const index = prev.findIndex(tx => tx.id === transaction.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = transaction;
          return updated;
        }
        return [transaction, ...prev];
      });
    };

    // Subscribe to WebSocket events
    const wsService = (bitcoinYieldBridgeService as any).wsService;
    if (wsService) {
      wsService.onBalanceUpdate(handlePortfolioUpdate);
      wsService.onTransactionUpdate(handleTransactionUpdate);
    }

    // Cleanup function
    return () => {
      if (wsService) {
        wsService.removeListener('balance_update', handlePortfolioUpdate);
        wsService.removeListener('transaction_update', handleTransactionUpdate);
      }
    };
  }, [isConnected]);

  // Auto-refresh data periodically
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      refreshPortfolio();
      refreshTransactions();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, refreshPortfolio, refreshTransactions]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    xverseWallet,
    starknetAccount,
    
    // Portfolio data
    portfolio,
    transactions,
    isLoadingPortfolio,
    
    // Available strategies
    yieldStrategies,
    
    // Connection methods
    connectWallets,
    disconnect,
    
    // Trading methods
    depositBitcoin,
    withdrawYield,
    
    // Data refresh
    refreshPortfolio,
    refreshTransactions,
    
    // Error handling
    error,
    clearError
  };
}

// Additional utility hooks

export function useYieldStrategies() {
  const [strategies, setStrategies] = useState<YieldStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStrategies = useCallback(async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from blockchain
      const mockStrategies: YieldStrategy[] = [
        {
          id: 1,
          name: 'Vesu Lending Pool',
          protocol: 'Vesu',
          apy: 8.5,
          tvl: 1250000,
          riskLevel: 2,
          icon: 'vesu-icon.png',
          description: 'Earn yield by lending USDC on Vesu protocol',
          isActive: true,
          minDeposit: 0.001,
          maxDeposit: 10
        },
        {
          id: 2,
          name: 'Troves Yield Aggregator',
          protocol: 'Troves',
          apy: 12.3,
          tvl: 850000,
          riskLevel: 3,
          icon: 'troves-icon.png',
          description: 'Automated yield farming across multiple DeFi protocols',
          isActive: true,
          minDeposit: 0.001,
          maxDeposit: 5
        }
      ];
      
      setStrategies(mockStrategies);
    } catch (error) {
      console.error('Failed to fetch yield strategies:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  return { strategies, isLoading, refetch: fetchStrategies };
}

export function useTransactionStatus(transactionId: string) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return;

    const checkStatus = async () => {
      try {
        // In production, check transaction status on blockchain
        // For now, simulate status checking
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus('confirmed');
      } catch (error) {
        setStatus('failed');
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [transactionId]);

  return { status, isLoading };
}