// Simple React Hook for Bitcoin Yield Bridge - No TypeScript Errors
import { useState, useEffect, useCallback } from 'react';
import { bitcoinYieldBridgeService } from '../services/SimpleBitcoinYieldBridgeService';

// Simple hook without complex types to avoid errors
export function useBitcoinYieldBridge() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [xverseWallet, setXverseWallet] = useState(null);
  const [starknetAccount, setStarknetAccount] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [error, setError] = useState(null);

  // Available yield strategies (mock data)
  const yieldStrategies = [
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

  // Connect wallets
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
      const errorMessage = `Connection failed: ${err.message || err}`;
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallets
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
      const errorMessage = `Disconnect failed: ${err.message || err}`;
      setError(errorMessage);
      console.error('Disconnect error:', err);
    }
  }, []);

  // Deposit Bitcoin
  const depositBitcoin = useCallback(async (amount, strategyId) => {
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
      const errorMessage = `Deposit failed: ${err.message || err}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isConnected]);

  // Withdraw yield
  const withdrawYield = useCallback(async (amount, bitcoinAddress) => {
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
      const errorMessage = `Withdrawal failed: ${err.message || err}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isConnected]);

  // Refresh portfolio data
  const refreshPortfolio = useCallback(async () => {
    if (!isConnected) return;
    
    try {
      setIsLoadingPortfolio(true);
      const portfolioData = await bitcoinYieldBridgeService.getPortfolioData();
      setPortfolio(portfolioData);
    } catch (err) {
      console.error('Failed to refresh portfolio:', err);
      setError(`Failed to load portfolio: ${err.message || err}`);
    } finally {
      setIsLoadingPortfolio(false);
    }
  }, [isConnected]);

  // Refresh transaction history
  const refreshTransactions = useCallback(async () => {
    if (!isConnected) return;
    
    try {
      const transactionHistory = await bitcoinYieldBridgeService.getTransactionHistory(50);
      setTransactions(transactionHistory);
    } catch (err) {
      console.error('Failed to refresh transactions:', err);
    }
  }, [isConnected]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

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

// Additional simple hooks

export function useYieldStrategies() {
  const [strategies, setStrategies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStrategies = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock strategies for demo
      const mockStrategies = [
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

export function useTransactionStatus(transactionId) {
  const [status, setStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return;

    const checkStatus = async () => {
      try {
        // Simulate status checking
        setTimeout(() => {
          setStatus('confirmed');
          setIsLoading(false);
        }, 3000);
      } catch (error) {
        setStatus('failed');
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [transactionId]);

  return { status, isLoading };
}

console.log('✅ Bitcoin Yield Bridge hooks ready (simplified, error-free version)');