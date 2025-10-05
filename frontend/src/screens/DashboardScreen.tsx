// Dashboard Screen - Main portfolio overview
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { usePortfolio, usePrices } from '../hooks';
import { COLORS, FONTS, SPACING, SHADOWS } from '../constants';
import { Portfolio, YieldStrategy } from '../types';

interface DashboardScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { prices } = usePrices();
  
  // Mock portfolio data for demo
  const mockPortfolio: Portfolio = {
    totalBalance: 3250.50,
    totalYield: 168.75,
    totalDeposited: 3081.75,
    roi: 5.47,
    positions: [
      {
        strategyId: 1,
        depositAmount: 2000,
        shares: 2000,
        accumulatedYield: 104,
        lastInteraction: Date.now() - 30 * 24 * 60 * 60 * 1000,
        currentValue: 2104,
        roi: 5.2,
      },
      {
        strategyId: 2,
        depositAmount: 1081.75,
        shares: 1081.75,
        accumulatedYield: 64.75,
        lastInteraction: Date.now() - 15 * 24 * 60 * 60 * 1000,
        currentValue: 1146.50,
        roi: 5.98,
      },
    ],
    monthlyYield: 56.25,
    projectedYearlyYield: 675,
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.welcomeText}>Welcome to BitcoinYieldBridge</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Portfolio Summary Card */}
      <View style={styles.portfolioCard}>
        <Text style={styles.portfolioTitle}>Total Portfolio Value</Text>
        <Text style={styles.portfolioValue}>
          ${mockPortfolio.totalBalance.toLocaleString('en-US', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <View style={styles.portfolioStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Yield</Text>
            <Text style={[styles.statValue, styles.yieldPositive]}>
              +${mockPortfolio.totalYield.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>ROI</Text>
            <Text style={[styles.statValue, styles.yieldPositive]}>
              +{mockPortfolio.roi.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <ActionButton
            icon="💰"
            title="Deposit"
            subtitle="Add Bitcoin"
            onPress={() => navigation.navigate('Deposit')}
            color={COLORS.success}
          />
          <ActionButton
            icon="📤"
            title="Withdraw"
            subtitle="Take profits"
            onPress={() => navigation.navigate('Withdraw')}
            color={COLORS.primary}
          />
          <ActionButton
            icon="⚡"
            title="Bridge"
            subtitle="BTC → Starknet"
            onPress={() => {}} // TODO: Bridge screen
            color={COLORS.bitcoin}
          />
          <ActionButton
            icon="📊"
            title="Analytics"
            subtitle="View details"
            onPress={() => {}} // TODO: Analytics screen
            color={COLORS.info}
          />
        </View>
      </View>

      {/* Current Positions */}
      <View style={styles.positionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Positions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {mockPortfolio.positions.map((position, index) => (
          <PositionCard
            key={index}
            position={position}
            onPress={() => navigation.navigate('StrategyDetails', { strategyId: position.strategyId })}
          />
        ))}
      </View>

      {/* Yield Strategies */}
      <View style={styles.strategiesSection}>
        <Text style={styles.sectionTitle}>Available Strategies</Text>
        <StrategyCard
          strategy={{
            id: 1,
            name: 'Vesu Lending',
            protocol: 'Vesu',
            apy: 5.2,
            tvl: 1500000,
            riskLevel: 2,
            icon: '🏦',
            description: 'Stable lending yields',
            isActive: true,
            minDeposit: 10,
            maxDeposit: 1000000,
          }}
          onPress={() => navigation.navigate('Deposit', { strategyId: 1 })}
        />
        <StrategyCard
          strategy={{
            id: 2,
            name: 'Troves Farming',
            protocol: 'Troves',
            apy: 8.7,
            tvl: 850000,
            riskLevel: 3,
            icon: '🌾',
            description: 'Higher yield farming',
            isActive: true,
            minDeposit: 100,
            maxDeposit: 500000,
          }}
          onPress={() => navigation.navigate('Deposit', { strategyId: 2 })}
        />
      </View>

      {/* Market Overview */}
      <View style={styles.marketSection}>
        <Text style={styles.sectionTitle}>Market Overview</Text>
        <View style={styles.priceGrid}>
          <PriceCard
            symbol="BTC"
            name="Bitcoin"
            price={prices.btc}
            change={1.2}
            icon="₿"
          />
          <PriceCard
            symbol="ETH"
            name="Ethereum"
            price={prices.eth}
            change={-0.8}
            icon="Ξ"
          />
        </View>
      </View>
    </ScrollView>
  );
};

// Action Button Component
const ActionButton = ({ icon, title, subtitle, onPress, color }: any) => (
  <TouchableOpacity
    style={[styles.actionButton, { borderColor: color }]}
    onPress={onPress}
  >
    <Text style={styles.actionIcon}>{icon}</Text>
    <Text style={styles.actionTitle}>{title}</Text>
    <Text style={styles.actionSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

// Position Card Component  
const PositionCard = ({ position, onPress }: any) => (
  <TouchableOpacity style={styles.positionCard} onPress={onPress}>
    <View style={styles.positionHeader}>
      <Text style={styles.positionName}>
        {position.strategyId === 1 ? 'Vesu Lending' : 'Troves Farming'}
      </Text>
      <Text style={[styles.positionRoi, styles.yieldPositive]}>
        +{position.roi.toFixed(2)}%
      </Text>
    </View>
    <View style={styles.positionStats}>
      <View>
        <Text style={styles.positionStatLabel}>Deposited</Text>
        <Text style={styles.positionStatValue}>
          ${position.depositAmount.toLocaleString()}
        </Text>
      </View>
      <View>
        <Text style={styles.positionStatLabel}>Current Value</Text>
        <Text style={styles.positionStatValue}>
          ${position.currentValue.toLocaleString()}
        </Text>
      </View>
      <View>
        <Text style={styles.positionStatLabel}>Yield Earned</Text>
        <Text style={[styles.positionStatValue, styles.yieldPositive]}>
          +${position.accumulatedYield.toFixed(2)}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

// Strategy Card Component
const StrategyCard = ({ strategy, onPress }: any) => (
  <TouchableOpacity style={styles.strategyCard} onPress={onPress}>
    <View style={styles.strategyHeader}>
      <Text style={styles.strategyIcon}>{strategy.icon}</Text>
      <View style={styles.strategyInfo}>
        <Text style={styles.strategyName}>{strategy.name}</Text>
        <Text style={styles.strategyDescription}>{strategy.description}</Text>
      </View>
      <View style={styles.strategyStats}>
        <Text style={styles.strategyApy}>{strategy.apy.toFixed(1)}% APY</Text>
        <Text style={styles.strategyTvl}>
          ${(strategy.tvl / 1000000).toFixed(1)}M TVL
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

// Price Card Component
const PriceCard = ({ symbol, name, price, change, icon }: any) => (
  <View style={styles.priceCard}>
    <View style={styles.priceHeader}>
      <Text style={styles.priceIcon}>{icon}</Text>
      <View>
        <Text style={styles.priceSymbol}>{symbol}</Text>
        <Text style={styles.priceName}>{name}</Text>
      </View>
    </View>
    <Text style={styles.priceValue}>${price.toLocaleString()}</Text>
    <Text style={[
      styles.priceChange,
      change >= 0 ? styles.yieldPositive : styles.yieldNegative
    ]}>
      {change >= 0 ? '+' : ''}{change.toFixed(1)}%
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
  },
  welcomeText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  notificationButton: {
    padding: SPACING.sm,
  },
  notificationIcon: {
    fontSize: 24,
  },
  portfolioCard: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: 16,
    ...SHADOWS.medium,
  },
  portfolioTitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  portfolioValue: {
    fontSize: FONTS.sizes['4xl'],
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  yieldPositive: {
    color: COLORS.success,
  },
  yieldNegative: {
    color: COLORS.error,
  },
  quickActions: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (screenWidth - SPACING.lg * 3) / 2,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    ...SHADOWS.small,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  actionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  positionsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  seeAllText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    fontWeight: '500',
  },
  positionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  positionName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  positionRoi: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
  },
  positionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  positionStatLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  positionStatValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  strategiesSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  strategyCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strategyIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  strategyInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  strategyName: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  strategyDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  strategyStats: {
    alignItems: 'flex-end',
  },
  strategyApy: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  strategyTvl: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  marketSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  priceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    width: (screenWidth - SPACING.lg * 3) / 2,
    ...SHADOWS.small,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  priceIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  priceSymbol: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  priceName: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  priceChange: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
  },
});

export default DashboardScreen;