import { AppConfig } from '../types';

// App Configuration
export const APP_CONFIG: AppConfig = {
  starknet: {
    chainId: '0x534e5f5345504f4c4941', // Starknet Sepolia
    rpcUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
    contractAddress: '0x...', // Will be updated after deployment
  },
  xverse: {
    network: 'testnet',
    appName: 'BitcoinYieldBridge',
    appIcon: 'https://bitcoinyieldbridge.com/icon.png',
  },
  atomiq: {
    apiKey: 'your-atomiq-api-key-here', // Replace with actual API key
    baseUrl: 'https://api.atomiq.exchange',
    supportedNetworks: ['bitcoin', 'lightning', 'starknet'],
  },
  avnu: {
    paymasterAddress: '0x...', // AVNU paymaster address
    supportedTokens: ['USDC', 'ETH', 'STRK'],
  },
};

// UI Constants
export const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  secondary: '#FFA726',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  border: '#E5E7EB',
  overlay: 'rgba(0, 0, 0, 0.5)',
  bitcoin: '#F7931A',
  starknet: '#0C0C4F',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Business Constants
export const YIELD_STRATEGIES = {
  VESU: {
    id: 1,
    name: 'Vesu Lending',
    protocol: 'Vesu' as const,
    baseApy: 5.0,
    riskLevel: 2 as const,
    icon: 'bank-outline',
    description: 'Earn yield by lending USDC on Vesu protocol',
    minDeposit: 10,
    maxDeposit: 1000000,
  },
  TROVES: {
    id: 2,
    name: 'Troves Yield Farming',
    protocol: 'Troves' as const,
    baseApy: 8.0,
    riskLevel: 3 as const,
    icon: 'trending-up-outline',
    description: 'Automated yield farming strategies on Troves',
    minDeposit: 100,
    maxDeposit: 500000,
  },
};

export const RISK_LEVELS = {
  1: { label: 'Very Low', color: COLORS.success },
  2: { label: 'Low', color: COLORS.info },
  3: { label: 'Medium', color: COLORS.warning },
  4: { label: 'High', color: COLORS.error },
  5: { label: 'Very High', color: '#DC2626' },
};

// API Endpoints
export const API_ENDPOINTS = {
  STARKNET_RPC: APP_CONFIG.starknet.rpcUrl,
  ATOMIQ_BASE: APP_CONFIG.atomiq.baseUrl,
  PRICE_API: 'https://api.coingecko.com/api/v3',
  YIELD_DATA: '/api/v1/yield-strategies',
  PORTFOLIO: '/api/v1/portfolio',
  TRANSACTIONS: '/api/v1/transactions',
  BRIDGE_STATUS: '/api/v1/bridge',
};

// Transaction Constants
export const TRANSACTION_STATUS = {
  PENDING: 'pending' as const,
  CONFIRMED: 'confirmed' as const,
  FAILED: 'failed' as const,
};

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit' as const,
  WITHDRAWAL: 'withdrawal' as const,
  BRIDGE: 'bridge' as const,
  YIELD: 'yield' as const,
};

// Wallet Constants
export const SUPPORTED_WALLETS = {
  XVERSE: {
    name: 'Xverse',
    icon: 'wallet-outline',
    deepLink: 'xverse://',
    downloadUrl: 'https://xverse.app/download',
  },
};

// Time Constants
export const TIME_INTERVALS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
};

// Validation Constants
export const VALIDATION = {
  MIN_DEPOSIT: 0.001, // BTC
  MAX_DEPOSIT: 100, // BTC
  MIN_WITHDRAWAL: 0.001, // BTC
  DECIMAL_PLACES: 8,
  PASSWORD_MIN_LENGTH: 8,
  TRANSACTION_TIMEOUT: 300000, // 5 minutes
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_BIOMETRICS: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_BETA_FEATURES: false,
  ENABLE_DEBUG_MODE: true, // Set to false for production
  ENABLE_TESTNET: true,
  ENABLE_ACCOUNT_ABSTRACTION: true,
};

// Network Constants
export const NETWORKS = {
  BITCOIN_MAINNET: {
    name: 'Bitcoin Mainnet',
    chainId: '000000000019d6689c085ae165831e93',
    explorer: 'https://blockstream.info',
  },
  BITCOIN_TESTNET: {
    name: 'Bitcoin Testnet',
    chainId: '000000000933ea01ad0ee984209779ba',
    explorer: 'https://blockstream.info/testnet',
  },
  STARKNET_MAINNET: {
    name: 'Starknet Mainnet',
    chainId: '0x534e5f4d41494e',
    explorer: 'https://starkscan.co',
  },
  STARKNET_SEPOLIA: {
    name: 'Starknet Sepolia',
    chainId: '0x534e5f5345504f4c4941',
    explorer: 'https://sepolia.starkscan.co',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Wallet not connected',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_AMOUNT: 'Invalid amount',
  TRANSACTION_FAILED: 'Transaction failed',
  NETWORK_ERROR: 'Network error occurred',
  CONTRACT_ERROR: 'Smart contract error',
  BRIDGE_ERROR: 'Bridge transaction failed',
  UNKNOWN_ERROR: 'An unknown error occurred',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  DEPOSIT_SUCCESS: 'Deposit completed successfully',
  WITHDRAWAL_SUCCESS: 'Withdrawal completed successfully',
  BRIDGE_SUCCESS: 'Bridge transaction initiated',
  TRANSACTION_CONFIRMED: 'Transaction confirmed',
};

// Animation Constants
export const ANIMATIONS = {
  DURATION: {
    SHORT: 200,
    MEDIUM: 400,
    LONG: 600,
  },
  EASING: {
    IN: 'ease-in',
    OUT: 'ease-out',
    IN_OUT: 'ease-in-out',
  },
};

export default {
  APP_CONFIG,
  COLORS,
  FONTS,
  SPACING,
  SHADOWS,
  YIELD_STRATEGIES,
  RISK_LEVELS,
  API_ENDPOINTS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  SUPPORTED_WALLETS,
  TIME_INTERVALS,
  VALIDATION,
  FEATURE_FLAGS,
  NETWORKS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ANIMATIONS,
};