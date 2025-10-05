// Starknet Service for blockchain interactions
// Conditional import for web compatibility
let Contract: any, Provider: any, Account: any, CallData: any, num: any;
try {
  const starknet = require('starknet');
  ({ Contract, Provider, Account, CallData, num } = starknet);
} catch (e) {
  console.warn('Starknet not available in web environment - using mocks');
}

import { StarknetProvider, ContractCallResult, YieldStrategy, UserPosition } from '../types';
import { APP_CONFIG } from '../constants';

// ABI for BitcoinYieldBridge contract (simplified)
const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "deposit_and_yield",
    "inputs": [
      { "name": "amount", "type": "u256" },
      { "name": "strategy_id", "type": "u8" }
    ],
    "outputs": [{ "type": "bool" }],
    "state_mutability": "external"
  },
  {
    "type": "function", 
    "name": "withdraw_yield",
    "inputs": [{ "name": "amount", "type": "u256" }],
    "outputs": [{ "type": "bool" }],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "get_user_balance", 
    "inputs": [{ "name": "user", "type": "ContractAddress" }],
    "outputs": [{ "type": "u256" }],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_total_yield",
    "inputs": [],
    "outputs": [{ "type": "u256" }],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "initiate_bridge",
    "inputs": [
      { "name": "from_token", "type": "ContractAddress" },
      { "name": "to_token", "type": "ContractAddress" },
      { "name": "amount", "type": "u256" }
    ],
    "outputs": [{ "type": "felt252" }],
    "state_mutability": "external"
  }
];

export class StarknetService {
  private provider: any = null;
  private account: any = null;
  private contract: any = null;
  private connected: boolean = false;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      if (!Provider) {
        console.warn('Starknet Provider not available - running in mock mode');
        return;
      }
      this.provider = new Provider({
        sequencer: {
          baseUrl: APP_CONFIG.starknet.rpcUrl,
          feederGatewayUrl: APP_CONFIG.starknet.rpcUrl,
          gatewayUrl: APP_CONFIG.starknet.rpcUrl,
        },
      });
    } catch (error) {
      console.error('Failed to initialize Starknet provider:', error);
    }
  }

  async connect(privateKey?: string, accountAddress?: string): Promise<StarknetProvider> {
    try {
      if (!Provider || !Account) {
        // Return mock provider for web compatibility
        return {
          isConnected: false,
          account: '',
          chainId: APP_CONFIG.starknet.chainId,
          provider: null
        };
      }
      
      if (!this.provider) {
        throw new Error('Starknet provider not initialized');
      }

      // For demo purposes, we'll use a mock account
      // In production, this would integrate with Braavos, Argent, or other Starknet wallets
      if (privateKey && accountAddress) {
        this.account = new Account(this.provider, accountAddress, privateKey);
      } else {
        // Mock account for testing
        const mockAccountAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const mockPrivateKey = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
        this.account = new Account(this.provider, mockAccountAddress, mockPrivateKey);
      }

      // Initialize contract
      if (APP_CONFIG.starknet.contractAddress) {
        this.contract = new Contract(
          CONTRACT_ABI,
          APP_CONFIG.starknet.contractAddress,
          this.provider
        );
        
        if (this.account) {
          this.contract.connect(this.account);
        }
      }

      this.connected = true;

      return {
        isConnected: true,
        chainId: APP_CONFIG.starknet.chainId,
        account: this.account?.address || '',
        provider: this.provider,
      };
    } catch (error) {
      console.error('Starknet connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.account = null;
    this.contract = null;
    this.connected = false;
  }

  async depositAndYield(amount: number, strategyId: number): Promise<ContractCallResult> {
    try {
      if (!this.contract || !this.account) {
        throw new Error('Not connected to Starknet');
      }

      // Convert amount to uint256 (assuming 6 decimal places for USDC)
      const amountBN = num.toBigInt(amount * 1_000_000);

      const call = {
        contractAddress: this.contract.address,
        entrypoint: 'deposit_and_yield',
        calldata: CallData.compile([amountBN.toString(), strategyId.toString()]),
      };

      const response = await this.account.execute(call);
      
      return {
        success: true,
        txHash: response.transaction_hash,
        blockNumber: undefined, // Will be available after confirmation
        gasUsed: undefined,
      };
    } catch (error) {
      console.error('Deposit transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async withdrawYield(amount: number): Promise<ContractCallResult> {
    try {
      if (!this.contract || !this.account) {
        throw new Error('Not connected to Starknet');
      }

      // Convert amount to uint256 (0 means withdraw all)
      const amountBN = amount === 0 ? num.toBigInt(0) : num.toBigInt(amount * 1_000_000);

      const call = {
        contractAddress: this.contract.address,
        entrypoint: 'withdraw_yield',
        calldata: CallData.compile([amountBN.toString()]),
      };

      const response = await this.account.execute(call);
      
      return {
        success: true,
        txHash: response.transaction_hash,
      };
    } catch (error) {
      console.error('Withdrawal transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getUserBalance(userAddress: string): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const result = await this.contract.call('get_user_balance', [userAddress]);
      const balanceBN = num.toBigInt((result as any)[0]);
      
      // Convert from uint256 to number (assuming 6 decimal places)
      return Number(balanceBN) / 1_000_000;
    } catch (error) {
      console.error('Error fetching user balance:', error);
      return 0;
    }
  }

  async getTotalYield(): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const result = await this.contract.call('get_total_yield', []);
      const yieldBN = num.toBigInt((result as any)[0]);
      
      return Number(yieldBN) / 1_000_000;
    } catch (error) {
      console.error('Error fetching total yield:', error);
      return 0;
    }
  }

  async initiateBridge(
    fromToken: string,
    toToken: string,
    amount: number
  ): Promise<ContractCallResult> {
    try {
      if (!this.contract || !this.account) {
        throw new Error('Not connected to Starknet');
      }

      const amountBN = num.toBigInt(amount * 100_000_000); // Satoshi for BTC

      const call = {
        contractAddress: this.contract.address,
        entrypoint: 'initiate_bridge',
        calldata: CallData.compile([fromToken, toToken, amountBN.toString()]),
      };

      const response = await this.account.execute(call);
      
      return {
        success: true,
        txHash: response.transaction_hash,
      };
    } catch (error) {
      console.error('Bridge transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if ((receipt as any).execution_status === 'SUCCEEDED') {
        return 'confirmed';
      } else if ((receipt as any).execution_status === 'REVERTED') {
        return 'failed';
      } else {
        return 'pending';
      }
    } catch (error) {
      // Transaction not yet mined or error occurred
      return 'pending';
    }
  }

  async estimateGas(calls: any[]): Promise<number> {
    try {
      if (!this.account) {
        throw new Error('Account not connected');
      }

      const estimate = await this.account.estimateFee(calls);
      return Number(estimate.overall_fee);
    } catch (error) {
      console.error('Gas estimation error:', error);
      return 0;
    }
  }

  // Get yield strategies from contract
  async getYieldStrategies(): Promise<YieldStrategy[]> {
    // Mock implementation - in production, this would call the contract
    return [
      {
        id: 1,
        name: 'Vesu Lending',
        protocol: 'Vesu',
        apy: 5.2,
        tvl: 1_500_000,
        riskLevel: 2,
        icon: 'bank-outline',
        description: 'Earn stable yield by lending USDC on Vesu protocol',
        isActive: true,
        minDeposit: 10,
        maxDeposit: 1_000_000,
      },
      {
        id: 2,
        name: 'Troves Farming',
        protocol: 'Troves',
        apy: 8.7,
        tvl: 850_000,
        riskLevel: 3,
        icon: 'trending-up-outline',
        description: 'Automated yield farming strategies on Troves protocol',
        isActive: true,
        minDeposit: 100,
        maxDeposit: 500_000,
      },
    ];
  }

  // Get user positions from contract
  async getUserPositions(userAddress: string): Promise<UserPosition[]> {
    // Mock implementation - in production, this would call the contract
    return [
      {
        strategyId: 1,
        depositAmount: 1000,
        shares: 1000,
        accumulatedYield: 52,
        lastInteraction: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        currentValue: 1052,
        roi: 5.2,
      },
    ];
  }

  isConnected(): boolean {
    return this.connected;
  }

  getProvider(): any {
    return this.provider;
  }

  getAccount(): any {
    return this.account;
  }

  getContract(): any {
    return this.contract;
  }
}

export default StarknetService;