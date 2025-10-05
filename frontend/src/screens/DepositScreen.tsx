// Deposit Screen - Bitcoin deposit and strategy selection
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useStarknet, useContract } from '../hooks';
import { COLORS, FONTS, SPACING, SHADOWS } from '../constants';
import { YieldStrategy } from '../types';

const MOCK_STRATEGIES: YieldStrategy[] = [
  {
    id: 1,
    name: 'Vesu Protocol',
    protocol: 'Vesu',
    apy: 6.2,
    tvl: 2300000,
    riskLevel: 2,
    icon: '🏦',
    description: 'Conservative lending yield',
    isActive: true,
    minDeposit: 0.001,
    maxDeposit: 10
  },
  {
    id: 2,
    name: 'Troves Protocol',
    protocol: 'Troves', 
    apy: 8.5,
    tvl: 1800000,
    riskLevel: 3,
    icon: '🌾',
    description: 'Yield farming opportunities',
    isActive: true,
    minDeposit: 0.001,
    maxDeposit: 5
  }
];

const DepositScreen = () => {
  const [amount, setAmount] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [usdValue, setUsdValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock BTC price for demonstration
  const BTC_PRICE = 45000;

  useEffect(() => {
    const btcAmount = parseFloat(amount || '0');
    setUsdValue(btcAmount * BTC_PRICE);
  }, [amount]);

  const handleDeposit = async () => {
    if (!selectedStrategy || !amount) {
      Alert.alert('Error', 'Please select strategy and enter amount');
      return;
    }

    setLoading(true);
    try {
      // Mock deposit process
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Deposit initiated successfully');
      setAmount('');
      setSelectedStrategy(null);
    } catch (error) {
      Alert.alert('Error', 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Deposit Bitcoin</Text>
        
        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Text style={styles.currency}>BTC</Text>
          </View>
          <Text style={styles.usdValue}>≈ ${usdValue.toFixed(2)} USD</Text>
        </View>

        {/* Strategy Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Strategy</Text>
          {MOCK_STRATEGIES.map((strategy) => (
            <TouchableOpacity
              key={strategy.id}
              style={[
                styles.strategyCard,
                selectedStrategy === strategy.id && styles.selectedStrategy
              ]}
              onPress={() => setSelectedStrategy(strategy.id)}
            >
              <View style={styles.strategyHeader}>
                <Text style={styles.strategyName}>{strategy.name}</Text>
                <Text style={styles.apy}>{strategy.apy}% APY</Text>
              </View>
              <Text style={styles.description}>{strategy.description}</Text>
              <View style={styles.strategyFooter}>
                <Text style={styles.risk}>Risk Level: {strategy.riskLevel}/5</Text>
                <Text style={styles.tvl}>TVL: {strategy.tvl}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Deposit Button */}
        <TouchableOpacity
          style={[styles.depositButton, loading && styles.buttonDisabled]}
          onPress={handleDeposit}
          disabled={loading || !amount || !selectedStrategy}
        >
          <Text style={styles.depositButtonText}>
            {loading ? 'Processing...' : 'Deposit Bitcoin'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
  },
  currency: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  usdValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  strategyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  selectedStrategy: {
    borderColor: COLORS.primary,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  strategyName: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  apy: {
    fontSize: FONTS.sizes.base,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  description: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  strategyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  risk: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  tvl: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  depositButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...SHADOWS.medium,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  depositButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DepositScreen;