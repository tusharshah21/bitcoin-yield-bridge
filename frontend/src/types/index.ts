// Core Types for BitcoinYieldBridge Mobile App

export interface XverseWallet {
  isConnected: boolean;
  address: string;
  publicKey: string;
  balance: {
    btc: number;
    usd: number;
  };
  network: 'mainnet' | 'testnet' | 'signet';
}

export interface StarknetProvider {
  isConnected: boolean;
  chainId: string;
  account: string;
  provider: any;
}

export interface YieldStrategy {
  id: string | number;
  name: string;
  protocol?: 'Vesu' | 'Troves';
  apy: number;
  tvl?: number;
  riskLevel?: 1 | 2 | 3 | 4 | 5;
  risk?: 'low' | 'medium' | 'high';
  icon?: string;
  description: string;
  isActive?: boolean;
  minDeposit: number;
  maxDeposit?: number;
  token?: string;
}

export interface UserPosition {
  strategyId: number;
  depositAmount: number;
  shares: number;
  accumulatedYield: number;
  lastInteraction: number;
  currentValue: number;
  roi: number;
}

export interface Transaction {
  id: string;
  hash: string;
  type: 'deposit' | 'withdraw' | 'yield' | 'bridge';
  amount: number;
  token: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  from: string;
  to: string;
  fee: number;
  gasUsed?: number;
  blockNumber?: number;
  confirmations?: number;
  error?: string;
  strategy?: YieldStrategy;
}

export interface BridgeTransaction {
  id: string;
  fromToken: 'BTC' | 'USDC' | 'ETH';
  toToken: 'BTC' | 'USDC' | 'ETH';
  amount: number;
  expectedOutput: number;
  actualOutput?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bitcoinTxId?: string;
  starknetTxHash?: string;
  timestamp: number;
  exchangeRate: number;
  fees: {
    bitcoin: number;
    lightning: number;
    starknet: number;
    total: number;
  };
}

export interface Portfolio {
  totalBalance: number;
  totalYield: number;
  totalDeposited: number;
  roi: number;
  positions: UserPosition[];
  monthlyYield: number;
  projectedYearlyYield: number;
}

export interface AppFeatures {
  walletConnection: XverseWallet;
  starknetProvider: StarknetProvider;
  accountAbstraction: AVNUPaymaster;
  yieldStrategies: YieldStrategy[];
  bitcoinBridge: AtomiqSDK;
  portfolio: Portfolio;
}

export interface AVNUPaymaster {
  estimateGas(tx: StarknetTransaction): Promise<GasEstimate>;
  sponsorTransaction(tx: StarknetTransaction): Promise<TransactionHash>;
  getPaymasterBalance(): Promise<number>;
  checkPaymasterEligibility(tx: StarknetTransaction): Promise<boolean>;
}

// ==================== SPONSOR API INTERFACES ====================

// 1. Xverse Wallet SDK Integration
export interface XverseIntegration {
  authenticateUser(): Promise<BitcoinAddress>;
  getBalance(): Promise<BTCBalance>;
  signTransaction(tx: BitcoinTransaction): Promise<Signature>;
  getBitcoinPrice(): Promise<number>;
}

export interface BitcoinAddress {
  address: string;
  publicKey: string;
  network: 'mainnet' | 'testnet' | 'signet';
}

export interface BTCBalance {
  confirmed: number;
  unconfirmed: number;
  total: number;
  usdValue: number;
}

export interface BitcoinTransaction {
  inputs: Array<{
    txid: string;
    vout: number;
    value: number;
  }>;
  outputs: Array<{
    address: string;
    value: number;
  }>;
  fee: number;
}

export interface Signature {
  signature: string;
  publicKey: string;
  messageHash: string;
}

// 2. Atomiq Bridge SDK
export interface AtomiqBridge {
  estimateSwapFee(amount: number): Promise<FeeEstimate>;
  bridgeBitcoinToStarknet(amount: number): Promise<BridgeTransaction>;
  getTransactionStatus(txHash: string): Promise<TransactionStatus>;
  supportedTokens(): Promise<Array<Token>>;
}

export interface FeeEstimate {
  networkFee: number;
  serviceFee: number;
  totalFee: number;
  estimatedTime: number;
}

export interface TransactionStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  confirmations: number;
  requiredConfirmations: number;
  txHash?: string;
  blockHeight?: number;
}

export interface Token {
  symbol: string;
  name: string;
  address?: string;
  decimals: number;
  network: string;
}

// 3. AVNU Paymaster Integration (see main interface above)

export interface StarknetTransaction {
  to: string;
  contractAddress: string;
  entrypoint: string;
  calldata: any[];
  signature?: string[];
  value?: string;
  gasLimit?: number;
}

export interface GasEstimate {
  gasUsed?: number;
  gasLimit?: number;
  gasPrice: number;
  totalFee?: number;
  totalCost?: number;
  sponsoredAmount?: number;
  currency?: string;
}

export type TransactionHash = string;

// 4. Vesu Protocol Integration
export interface VesuIntegration {
  getAvailableStrategies(): Promise<Array<YieldStrategy>>;
  depositIntoStrategy(strategyId: string, amount: number): Promise<Position>;
  getPositions(): Promise<Array<Position>>;
  withdrawFromStrategy(positionId: string): Promise<boolean>;
  getPerformanceData(strategyId: string): Promise<Performance>;
}

export interface Position {
  id?: string;
  strategyId: string;
  asset?: string;
  amount: number;
  shares: number;
  entryPrice: number;
  timestamp: number;
  deposited?: number;
  borrowed?: number;
  collateralRatio?: number;
  liquidationPrice?: number;
  apy?: number;
}

// 5. Troves Integration
export interface TrovesIntegration {
  getVaults(): Promise<Array<any>>;
  openVault(collateralAmount: number, debtAmount: number): Promise<any>;
  getMyVaults(): Promise<Array<any>>;
  adjustVault(vaultId: string, collateralChange: number, debtChange: number): Promise<boolean>;
  closeVault(vaultId: string): Promise<boolean>;
}

export interface Performance {
  totalReturn: number;
  dailyReturn?: number;
  weeklyReturn?: number;
  monthlyReturn?: number;
  annualizedReturn?: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown?: number;
  winRate?: number;
}

// Common interfaces for all integrations
export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}

export interface APIConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryConfig: RetryConfig;
  rateLimitConfig: RateLimitConfig;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  context?: any;
}

// Missing bridge interfaces for legacy compatibility
export interface BridgeFeeEstimate {
  networkFee: number;
  serviceFee: number;
  totalFee: number;
  estimatedTime: number;
}

export interface BridgeUpdate {
  bridgeId: string;
  status: string;
  progress: number;
  timestamp: number;
}

// Legacy compatibility
export interface AtomiqSDK {
  // Bridge operations
  estimateBridgeFee(params: {
    amount: number;
    fromChain: 'bitcoin' | 'starknet';
    toChain: 'bitcoin' | 'starknet';
    fromAddress: string;
    toAddress: string;
  }): Promise<BridgeFeeEstimate>;

  // Lightning Network integration
  createLightningInvoice(params: {
    amount: number;
    description?: string;
    expiry?: number;
  }): Promise<{
    invoice: string;
    paymentHash: string;
    expiresAt: number;
  }>;

  // Real-time bridge status
  subscribeToBridgeUpdates(callback: (update: BridgeUpdate) => void): void;
  unsubscribeFromBridgeUpdates(): void;
}

export interface ContractCallResult {
  success: boolean;
  transactionHash: string;
  gasUsed?: number;
}

export interface AppConfig {
  starknet: {
    chainId: string;
    rpcUrl: string;
    contractAddress: string;
  };
  xverse: {
    network: 'mainnet' | 'testnet' | 'signet';
    appName: string;
    appIcon: string;
    apiKey?: string;
    baseUrl?: string;
  };
  atomiq: {
    apiKey: string;
    baseUrl: string;
    supportedNetworks: string[];
  };
  avnu: {
    paymasterAddress: string;
    supportedTokens: string[];
    estimatedGasSavings: number;
    totalGasSponsored: number;
    apiKey?: string;
    baseUrl?: string;
  };
  vesu?: {
    protocolAddress: string;
    supportedAssets: string[];
    currentApy: number;
    totalLiquidity: number;
    apiKey?: string;
    baseUrl?: string;
  };
  troves?: {
    protocolAddress: string;
    collateralRatio: number;
    stabilityFee: number;
    supportedCollateral: string[];
    apiKey?: string;
    baseUrl?: string;
  };
}

export interface AtomiqSDK {
  isInitialized: boolean;
  supportedPairs: Array<{
    from: string;
    to: string;
    minAmount: number;
    maxAmount: number;
    estimatedTime: number;
  }>;
  exchangeRates: Record<string, number>;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: number;
}

export interface ContractCallResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: number;
  blockNumber?: number;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
  recoverable: boolean;
}

export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Navigation Types
export type RootStackParamList = {
  WalletConnect: undefined;
  MainTabs: undefined;
  Dashboard: undefined;
  Deposit: {
    strategy?: YieldStrategy;
  };
  Withdraw: {
    position?: UserPosition;
  };
  History: undefined;
  Settings: undefined;
  StrategyDetails: {
    strategy: YieldStrategy;
  };
  TransactionDetails: {
    transaction: Transaction;
  };
  BridgeStatus: {
    bridgeId: string;
  };
};

export type TabParamList = {
  Dashboard: undefined;
  Deposit: undefined;
  Withdraw: undefined;
  History: undefined;
};

// Hook Types
export interface UseWalletReturn {
  wallet: XverseWallet | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}

export interface UseStarknetReturn {
  provider: StarknetProvider | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}

export interface UseContractReturn {
  deposit: (amount: number, strategyId: number) => Promise<ContractCallResult>;
  withdraw: (amount: number) => Promise<ContractCallResult>;
  getUserBalance: (address: string) => Promise<number>;
  getStrategies: () => Promise<YieldStrategy[]>;
  isLoading: boolean;
  error: string | null;
}

// Configuration Types (see main AppConfig above)

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Component Props Types
export interface BaseComponentProps {
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export interface ButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export interface InputProps extends BaseComponentProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

// State Management Types
export interface AppState {
  wallet: XverseWallet | null;
  starknet: StarknetProvider | null;
  portfolio: Portfolio | null;
  strategies: YieldStrategy[];
  transactions: Transaction[];
  loading: LoadingState;
  error: ErrorState;
  notifications: NotificationState[];
}

export type AppAction = 
  | { type: 'WALLET_CONNECT_SUCCESS'; payload: XverseWallet }
  | { type: 'WALLET_DISCONNECT' }
  | { type: 'STARKNET_CONNECT_SUCCESS'; payload: StarknetProvider }
  | { type: 'STARKNET_DISCONNECT' }
  | { type: 'PORTFOLIO_UPDATE'; payload: Portfolio }
  | { type: 'STRATEGIES_UPDATE'; payload: YieldStrategy[] }
  | { type: 'TRANSACTION_ADD'; payload: Transaction }
  | { type: 'TRANSACTION_UPDATE'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'SET_ERROR'; payload: ErrorState }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationState }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

export default AppFeatures;