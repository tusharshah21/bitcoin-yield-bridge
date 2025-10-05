// Xverse Wallet Service
import { XverseWallet } from '../types';
import { APP_CONFIG, SUPPORTED_WALLETS } from '../constants';

declare global {
  interface Window {
    XverseProviders?: {
      BitcoinProvider: any;
    };
  }
}

export class XverseWalletService {
  private provider: any = null;
  private wallet: XverseWallet | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    // Check if Xverse is available
    if (typeof window !== 'undefined' && (window as any).XverseProviders?.BitcoinProvider) {
      this.provider = (window as any).XverseProviders.BitcoinProvider;
    }
  }

  async connect(): Promise<XverseWallet> {
    try {
      if (!this.provider) {
        throw new Error('Xverse wallet not found. Please install Xverse wallet.');
      }

      // Request connection to Xverse wallet
      const response = await this.provider.connect();
      
      if (response.status === 'success') {
        const addresses = response.result.addresses;
        const btcAddress = addresses.find((addr: any) => addr.purpose === 'payment');
        
        if (!btcAddress) {
          throw new Error('No Bitcoin address found');
        }

        // Get balance
        const balance = await this.getBalance(btcAddress.address);

        this.wallet = {
          isConnected: true,
          address: btcAddress.address,
          publicKey: btcAddress.publicKey,
          balance,
          network: APP_CONFIG.xverse.network,
        };

        return this.wallet;
      } else {
        throw new Error(response.error?.message || 'Failed to connect to Xverse wallet');
      }
    } catch (error) {
      console.error('Xverse connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.provider) {
        await this.provider.disconnect();
      }
      this.wallet = null;
    } catch (error) {
      console.error('Xverse disconnect error:', error);
      throw error;
    }
  }

  async getBalance(address: string): Promise<{ btc: number; usd: number }> {
    try {
      // Mock implementation - in production, use actual API
      // This would call Bitcoin API or Xverse API to get real balance
      const mockBtcBalance = 0.05; // 0.05 BTC
      const mockBtcPrice = 65000; // $65,000 per BTC
      
      return {
        btc: mockBtcBalance,
        usd: mockBtcBalance * mockBtcPrice,
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      return { btc: 0, usd: 0 };
    }
  }

  async signTransaction(transaction: any): Promise<string> {
    try {
      if (!this.provider || !this.wallet) {
        throw new Error('Wallet not connected');
      }

      const signedTx = await this.provider.signTransaction({
        account: {
          address: this.wallet.address,
          publicKey: this.wallet.publicKey,
        },
        message: transaction,
      });

      if (signedTx.status === 'success') {
        return signedTx.result.hex;
      } else {
        throw new Error(signedTx.error?.message || 'Failed to sign transaction');
      }
    } catch (error) {
      console.error('Transaction signing error:', error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    try {
      if (!this.provider || !this.wallet) {
        throw new Error('Wallet not connected');
      }

      const signed = await this.provider.signMessage({
        account: {
          address: this.wallet.address,
          publicKey: this.wallet.publicKey,
        },
        message,
      });

      if (signed.status === 'success') {
        return signed.result.signature;
      } else {
        throw new Error(signed.error?.message || 'Failed to sign message');
      }
    } catch (error) {
      console.error('Message signing error:', error);
      throw error;
    }
  }

  getWalletInfo(): XverseWallet | null {
    return this.wallet;
  }

  isConnected(): boolean {
    return this.wallet?.isConnected || false;
  }

  async switchNetwork(network: 'mainnet' | 'testnet' | 'signet'): Promise<void> {
    try {
      if (!this.provider) {
        throw new Error('Wallet not connected');
      }

      await this.provider.switchNetwork(network);
      
      if (this.wallet) {
        this.wallet.network = network;
      }
    } catch (error) {
      console.error('Network switch error:', error);
      throw error;
    }
  }

  // Deep link handler for mobile
  static handleDeepLink(url: string): boolean {
    try {
      if (url.startsWith('xverse://')) {
        // Handle Xverse deep link response
        const urlParams = new URL(url);
        const result = urlParams.searchParams.get('result');
        
        if (result) {
          // Process the result from Xverse wallet
          console.log('Xverse deep link result:', result);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Deep link handling error:', error);
      return false;
    }
  }

  // Mobile-specific connection method using deep links
  async connectMobile(): Promise<XverseWallet> {
    try {
      const Linking = (await import('expo-linking')).default;
      
      // Create deep link URL for Xverse
      const connectUrl = `xverse://connect?` + new URLSearchParams({
        app: APP_CONFIG.xverse.appName,
        icon: APP_CONFIG.xverse.appIcon,
        network: APP_CONFIG.xverse.network,
      }).toString();

      // Open Xverse app
      const canOpen = await Linking.canOpenURL(connectUrl);
      
      if (canOpen) {
        await Linking.openURL(connectUrl);
        
        // Return a promise that resolves when the deep link response is received
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout'));
          }, 30000); // 30 second timeout

          const handleUrl = (url: string) => {
            if (XverseWalletService.handleDeepLink(url)) {
              clearTimeout(timeout);
              // Mock successful connection for demo
              resolve({
                isConnected: true,
                address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
                publicKey: '02f6e1e4c6c8b2a1f8d4c7b9e3f2a5d8c1b4e7f0a3d6c9b2e5f8a1d4c7b0e3f6',
                balance: { btc: 0.05, usd: 3250 },
                network: APP_CONFIG.xverse.network,
              });
            }
          };

          // Listen for deep link response (this would be set up in app initialization)
          // Linking.addEventListener('url', handleUrl);
        });
      } else {
        // Xverse not installed, redirect to app store
        const downloadUrl = SUPPORTED_WALLETS.XVERSE.downloadUrl;
        await Linking.openURL(downloadUrl);
        throw new Error('Xverse wallet not installed. Please install and try again.');
      }
    } catch (error) {
      console.error('Mobile connection error:', error);
      throw error;
    }
  }
}

export default XverseWalletService;