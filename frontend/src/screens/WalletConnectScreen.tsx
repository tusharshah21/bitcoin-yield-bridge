// WalletConnect Screen - First screen users see
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useXverseWallet } from '../hooks';
import { COLORS, FONTS, SPACING, SHADOWS } from '../constants';

interface WalletConnectScreenProps {
  navigation: any;
}

const WalletConnectScreen: React.FC<WalletConnectScreenProps> = ({ navigation }) => {
  const { wallet, connect, isConnecting, error } = useXverseWallet();
  const [hasTriedConnection, setHasTriedConnection] = useState(false);

  const handleConnectWallet = async () => {
    setHasTriedConnection(true);
    
    try {
      await connect();
      // Navigate to main app on successful connection
      navigation.replace('MainTabs');
    } catch (err) {
      Alert.alert(
        'Connection Failed',
        error || 'Failed to connect to Xverse wallet. Please ensure Xverse is installed and try again.',
        [
          {
            text: 'Retry',
            onPress: () => setHasTriedConnection(false),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleSkipForDemo = () => {
    // For demo purposes, allow skipping wallet connection
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* App Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>₿</Text>
          </View>
          <Text style={styles.title}>BitcoinYieldBridge</Text>
          <Text style={styles.subtitle}>
            Earn yield on your Bitcoin with Lightning-powered DeFi on Starknet
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="⚡"
            title="Lightning Fast"
            description="Instant Bitcoin to Starknet swaps"
          />
          <FeatureItem
            icon="🏦"
            title="Multi-Protocol Yield"
            description="Earn across Vesu & Troves protocols"
          />
          <FeatureItem
            icon="📱"
            title="Mobile First" 
            description="Gasless transactions with account abstraction"
          />
          <FeatureItem
            icon="🔒"
            title="Secure & Audited"
            description="Built with OpenZeppelin contracts"
          />
        </View>

        {/* Connection Status */}
        {wallet?.isConnected ? (
          <View style={styles.connectedContainer}>
            <Text style={styles.connectedText}>✅ Wallet Connected</Text>
            <Text style={styles.addressText}>
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </Text>
            <Text style={styles.balanceText}>
              {wallet.balance.btc.toFixed(6)} BTC (${wallet.balance.usd.toLocaleString()})
            </Text>
          </View>
        ) : null}

        {/* Connect Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
            onPress={handleConnectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.surface} size="small" />
                <Text style={styles.connectButtonText}>Connecting...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.xverseIcon}>X</Text>
                <Text style={styles.connectButtonText}>Connect Xverse Wallet</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Error Message */}
          {error && hasTriedConnection && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Demo Mode Button */}
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleSkipForDemo}
          >
            <Text style={styles.demoButtonText}>Continue in Demo Mode</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by Starknet • Secured by Bitcoin
          </Text>
          <Text style={styles.versionText}>v1.0.0 Beta</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Feature Item Component
interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING['2xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  logoText: {
    fontSize: 40,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  title: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  featuresContainer: {
    marginVertical: SPACING.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
    width: 32,
    textAlign: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  connectedContainer: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  connectedText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  addressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.surface,
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  balanceText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '500',
    color: COLORS.surface,
  },
  buttonContainer: {
    marginBottom: SPACING.xl,
  },
  connectButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  connectButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xverseIcon: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginRight: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  connectButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.surface,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.surface,
    textAlign: 'center',
  },
  demoButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  versionText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default WalletConnectScreen;