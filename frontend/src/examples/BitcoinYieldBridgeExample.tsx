// Complete Integration Example - How to use the Bitcoin Yield Bridge services
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { bitcoinYieldBridgeService } from '../services/BitcoinYieldBridgeService';
import { 
  XverseWallet, 
  StarknetProvider, 
  Portfolio, 
  BridgeTransaction,
  YieldStrategy 
} from '../types';

export const BitcoinYieldBridgeExample: React.FC = () => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [xverseWallet, setXverseWallet] = useState<XverseWallet | null>(null);
  const [starknetAccount, setStarknetAccount] = useState<StarknetProvider | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Available yield strategies
  const yieldStrategies: YieldStrategy[] = [
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

  // 1. CONNECT WALLETS (Xverse + Starknet)
  const handleConnectWallets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔗 Connecting wallets...');
      
      // This connects both Xverse wallet and creates Starknet account via AVNU paymaster
      const { xverse, starknet } = await bitcoinYieldBridgeService.connectWallet();
      
      setXverseWallet(xverse);
      setStarknetAccount(starknet);
      setIsConnected(true);

      console.log('✅ Wallets connected successfully!');
      console.log('Bitcoin Address:', xverse.address);
      console.log('Starknet Account:', starknet.account);

      // Load portfolio data after connection
      await loadPortfolioData();

    } catch (err) {
      const errorMessage = `Connection failed: ${(err as Error).message}`;
      setError(errorMessage);
      Alert.alert('Connection Error', errorMessage);
      console.error('❌ Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. LOAD PORTFOLIO DATA
  const loadPortfolioData = async () => {
    try {
      console.log('📊 Loading portfolio data...');
      
      const portfolioData = await bitcoinYieldBridgeService.getPortfolioData();
      setPortfolio(portfolioData);

      console.log('✅ Portfolio loaded:', {
        totalBalance: portfolioData.totalBalance,
        totalYield: portfolioData.totalYield,
        roi: portfolioData.roi,
        positions: portfolioData.positions.length
      });

    } catch (err) {
      console.error('❌ Failed to load portfolio:', err);
    }
  };

  // 3. DEPOSIT BITCOIN → LIGHTNING → STARKNET → YIELD
  const handleDeposit = async (amount: number, strategyId: number) => {
    try {
      setIsLoading(true);
      console.log(`💰 Starting Bitcoin deposit: ${amount} BTC to Strategy ${strategyId}`);

      // This handles the complete flow:
      // 1. Bitcoin → Lightning Network (via Atomiq)
      // 2. Lightning → Starknet bridge
      // 3. Starknet → Yield Strategy (Vesu/Troves)
      // 4. Gasless execution via AVNU paymaster
      const bridgeTransaction: BridgeTransaction = await bitcoinYieldBridgeService.depositBitcoin(
        amount, 
        strategyId
      );

      console.log('🌉 Bridge transaction initiated:', bridgeTransaction.id);
      console.log('Expected output:', bridgeTransaction.expectedOutput);
      console.log('Exchange rate:', bridgeTransaction.exchangeRate);
      console.log('Total fees:', bridgeTransaction.fees.total);

      // Monitor bridge progress
      monitorBridgeTransaction(bridgeTransaction.id);

      Alert.alert(
        'Deposit Initiated', 
        `Bridge transaction started! ID: ${bridgeTransaction.id.slice(0, 8)}...`
      );

    } catch (err) {
      const errorMessage = `Deposit failed: ${(err as Error).message}`;
      setError(errorMessage);
      Alert.alert('Deposit Error', errorMessage);
      console.error('❌ Deposit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. WITHDRAW YIELD → BITCOIN
  const handleWithdraw = async (amount: number, bitcoinAddress: string) => {
    try {
      setIsLoading(true);
      console.log(`💸 Withdrawing yield: ${amount} USDC to ${bitcoinAddress}`);

      // This handles:
      // 1. Withdraw from yield strategy
      // 2. Starknet → Lightning bridge
      // 3. Lightning → Bitcoin
      const bridgeTransaction: BridgeTransaction = await bitcoinYieldBridgeService.withdrawYield(
        amount,
        bitcoinAddress
      );

      console.log('🌉 Withdrawal bridge initiated:', bridgeTransaction.id);
      
      Alert.alert(
        'Withdrawal Initiated',
        `Funds will arrive at ${bitcoinAddress}`
      );

    } catch (err) {
      const errorMessage = `Withdrawal failed: ${(err as Error).message}`;
      setError(errorMessage);
      Alert.alert('Withdrawal Error', errorMessage);
      console.error('❌ Withdrawal error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. MONITOR BRIDGE TRANSACTION PROGRESS
  const monitorBridgeTransaction = (bridgeId: string) => {
    const interval = setInterval(async () => {
      try {
        // Get bridge status from Atomiq
        const status = await (bitcoinYieldBridgeService as any).atomiqService.getBridgeStatus(bridgeId);
        
        console.log(`🔄 Bridge ${bridgeId}: ${status.status} (${status.progress.percentage}%)`);
        console.log(`Stage: ${status.progress.stage} - ${status.progress.message}`);

        if (status.status === 'completed') {
          clearInterval(interval);
          console.log('✅ Bridge completed successfully!');
          
          // Refresh portfolio data
          await loadPortfolioData();
          
          Alert.alert('Success!', 'Your Bitcoin has been successfully deposited and is now earning yield!');
        } else if (status.status === 'failed') {
          clearInterval(interval);
          console.error('❌ Bridge failed:', status.failureReason);
          
          Alert.alert('Bridge Failed', status.failureReason || 'Bridge transaction failed');
        }

      } catch (err) {
        console.error('❌ Error monitoring bridge:', err);
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds
  };

  // 6. SELECT YIELD STRATEGY
  const handleSelectStrategy = async (strategyId: number) => {
    try {
      const strategy = await bitcoinYieldBridgeService.selectYieldStrategy(strategyId);
      console.log('📈 Selected strategy:', strategy.name, `APY: ${strategy.apy}%`);
      
      Alert.alert(
        'Strategy Selected',
        `${strategy.name}\nAPY: ${strategy.apy}%\nRisk Level: ${strategy.riskLevel}/5`
      );

    } catch (err) {
      console.error('❌ Strategy selection error:', err);
    }
  };

  // 7. DISCONNECT WALLETS
  const handleDisconnect = async () => {
    try {
      await bitcoinYieldBridgeService.disconnect();
      
      setIsConnected(false);
      setXverseWallet(null);
      setStarknetAccount(null);
      setPortfolio(null);
      setError(null);

      console.log('🔌 Wallets disconnected');
      
    } catch (err) {
      console.error('❌ Disconnect error:', err);
    }
  };

  // 8. REAL-TIME UPDATES (WebSocket)
  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to real-time balance updates
    const handleBalanceUpdate = (data: any) => {
      console.log('💰 Balance updated:', data);
      loadPortfolioData(); // Refresh portfolio when balance changes
    };

    const handleTransactionUpdate = (data: any) => {
      console.log('📝 Transaction updated:', data);
    };

    // Setup WebSocket listeners (these would be implemented in the service)
    // bitcoinYieldBridgeService.wsService.onBalanceUpdate(handleBalanceUpdate);
    // bitcoinYieldBridgeService.wsService.onTransactionUpdate(handleTransactionUpdate);

    return () => {
      // Cleanup listeners
      // bitcoinYieldBridgeService.wsService.removeListener('balance_update', handleBalanceUpdate);
    };
  }, [isConnected]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bitcoin Yield Bridge Integration Example</Text>
      
      {error && (
        <Text style={styles.error}>Error: {error}</Text>
      )}

      {!isConnected ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Connect Wallets</Text>
          <Button 
            title={isLoading ? "Connecting..." : "Connect Xverse + Starknet"}
            onPress={handleConnectWallets}
            disabled={isLoading}
          />
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connected Wallets</Text>
            <Text>Bitcoin: {xverseWallet?.address.slice(0, 20)}...</Text>
            <Text>Starknet: {starknetAccount?.account.slice(0, 20)}...</Text>
            <Text>Balance: {xverseWallet?.balance.btc} BTC (${xverseWallet?.balance.usd})</Text>
          </View>

          {portfolio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Portfolio</Text>
              <Text>Total Balance: ${portfolio.totalBalance.toFixed(2)}</Text>
              <Text>Total Yield: ${portfolio.totalYield.toFixed(2)}</Text>
              <Text>ROI: {portfolio.roi.toFixed(2)}%</Text>
              <Text>Positions: {portfolio.positions.length}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Available Yield Strategies</Text>
            {yieldStrategies.map(strategy => (
              <View key={strategy.id} style={styles.strategy}>
                <Text>{strategy.name} ({strategy.protocol})</Text>
                <Text>APY: {strategy.apy}% | Risk: {strategy.riskLevel}/5</Text>
                <Button
                  title="Select Strategy"
                  onPress={() => handleSelectStrategy(strategy.id)}
                />
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Deposit Bitcoin</Text>
            <Button
              title={isLoading ? "Processing..." : "Deposit 0.001 BTC → Vesu"}
              onPress={() => handleDeposit(0.001, 1)}
              disabled={isLoading}
            />
            <Button
              title={isLoading ? "Processing..." : "Deposit 0.002 BTC → Troves"}
              onPress={() => handleDeposit(0.002, 2)}
              disabled={isLoading}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Withdraw Yield</Text>
            <Button
              title="Withdraw $100 to Bitcoin"
              onPress={() => handleWithdraw(100, xverseWallet?.address || '')}
              disabled={isLoading}
            />
          </View>

          <View style={styles.section}>
            <Button
              title="Disconnect Wallets"
              onPress={handleDisconnect}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  strategy: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ffe6e6',
    borderRadius: 5,
  },
});

export default BitcoinYieldBridgeExample;