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
  id: number;
  name: string;
  protocol: 'Vesu' | 'Troves';
  apy: number;
  tvl: number;
  riskLevel: 1 | 2 | 3 | 4 | 5;
  icon: string;
  description: string;
  isActive: boolean;
  minDeposit: number;
  maxDeposit: number;
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
  type: 'deposit' | 'withdrawal' | 'bridge' | 'yield';
  amount: number;
  token: string;
  strategy?: YieldStrategy;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  bridgeId?: string;
  gasFeePaid?: number;
  yieldEarned?: number;
}

export interface BridgeTransaction {
  id: string;
  fromToken: 'BTC';
  toToken: 'USDC' | 'ETH';
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
  isEnabled: boolean;
  supportedTokens: string[];
  estimatedGasSavings: number;
  totalGasSponsored: number;
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

// Configuration Types
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
  };
  atomiq: {
    apiKey: string;
    baseUrl: string;
    supportedNetworks: string[];
  };
  avnu: {
    paymasterAddress: string;
    supportedTokens: string[];
  };
}

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