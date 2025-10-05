# Deployment Guide - BitcoinYieldBridge MVP

## 🎯 **MVP Deployment Strategy**

This guide covers deploying the BitcoinYieldBridge MVP across different environments. The architecture supports cross-platform development with Windows for frontend and Ubuntu/Linux for smart contract deployment.

## 🐧 **Smart Contract Deployment (Ubuntu/Linux)**

### **Prerequisites**
- Ubuntu 20.04+ or WSL2 on Windows
- Git and basic development tools
- Internet connection for toolchain installation

### **1. Environment Setup**

```bash
# Update system
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential

# Install Rust (required for Cairo)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Scarb (Cairo package manager)
curl -L https://raw.githubusercontent.com/software-mansion/scarb/main/install.sh | bash
export PATH="$PATH:$HOME/.local/bin"

# Install Starknet Foundry
curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | bash
export PATH="$PATH:$HOME/.foundry/bin"

# Verify installations
scarb --version
snforge --version
```

### **2. Contract Development Workflow**

```bash
# Clone your repository
git clone https://github.com/YOURUSERNAME/BitcoinYieldBridge.git
cd BitcoinYieldBridge

# Build contracts
scarb build

# Run comprehensive tests
snforge test --verbose

# Check test coverage
snforge test --coverage

# Format code
scarb fmt
```

### **3. Starknet Deployment**

```bash
# Install Starkli (CLI tool)
curl https://get.starkli.sh | sh
export PATH="$PATH:$HOME/.starkli/bin"

# Set up environment variables
export STARKNET_RPC="https://starknet-sepolia.public.blastapi.io/rpc/v0_7"
export STARKNET_ACCOUNT=~/.starkli/account.json
export STARKNET_KEYSTORE=~/.starkli/keystore.json

# Create account (if needed)
starkli account oz init ~/.starkli/account.json
starkli account deploy ~/.starkli/account.json

# Declare contract
starkli declare target/dev/bitcoin_yield_bridge_BitcoinYieldBridge.contract_class.json

# Deploy contract
starkli deploy <CLASS_HASH> --network sepolia

# Verify deployment
starkli call <CONTRACT_ADDRESS> get_contract_version
```

### **4. Integration Testing**

```bash
# Test contract interactions
./scripts/test_integration.sh

# Verify protocol integrations
starkli call <CONTRACT_ADDRESS> get_strategies
starkli call <CONTRACT_ADDRESS> get_total_tvl
```

## 📱 **Mobile App Deployment (Cross-Platform)**

### **Development (Windows/Mac/Linux)**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npx expo start

# Test on different platforms
npx expo start --android    # Android emulator
npx expo start --ios        # iOS simulator (Mac only)
npx expo start --web        # Web browser
```

### **Production Build**

```bash
# Build for production
npx expo build:android      # Android APK
npx expo build:ios          # iOS IPA (requires Apple Developer Account)

# Or use EAS Build (recommended)
npm install -g @expo/eas-cli
eas build --platform android
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### **Web Deployment**

```bash
# Build for web
npx expo export:web

# Deploy to Vercel
npx vercel --prod

# Or deploy to Netlify
npm run build
# Drag dist folder to netlify.com/drop
```

## 🔄 **CI/CD Pipeline (GitHub Actions)**

### **Smart Contract CI**

Create `.github/workflows/contracts.yml`:

```yaml
name: Smart Contracts CI

on: [push, pull_request]

jobs:
  test-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Scarb
        run: |
          curl -L https://raw.githubusercontent.com/software-mansion/scarb/main/install.sh | bash
          echo "$HOME/.local/bin" >> $GITHUB_PATH
          
      - name: Install Starknet Foundry
        run: |
          curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | bash
          echo "$HOME/.foundry/bin" >> $GITHUB_PATH
          
      - name: Build contracts
        run: scarb build
        
      - name: Run tests
        run: snforge test --verbose
```

### **Mobile App CI**

Create `.github/workflows/mobile.yml`:

```yaml
name: Mobile App CI

on: [push, pull_request]

jobs:
  test-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
        
      - name: Type check
        working-directory: ./frontend
        run: npx tsc --noEmit
        
      - name: Lint
        working-directory: ./frontend
        run: npx expo lint
        
      - name: Test
        working-directory: ./frontend
        run: npm test
```

## 🌐 **Environment Configuration**

### **Contract Configuration**

Create `deployment-config.json`:

```json
{
  "networks": {
    "sepolia": {
      "rpc": "https://starknet-sepolia.public.blastapi.io/rpc/v0_7",
      "explorer": "https://sepolia.starkscan.co"
    },
    "mainnet": {
      "rpc": "https://starknet-mainnet.public.blastapi.io/rpc/v0_7",
      "explorer": "https://starkscan.co"
    }
  },
  "contracts": {
    "bitcoin_yield_bridge": {
      "constructor_args": []
    }
  }
}
```

### **Mobile App Configuration**

Update `frontend/app.json`:

```json
{
  "expo": {
    "name": "BitcoinYieldBridge",
    "slug": "bitcoin-yield-bridge",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "bundleIdentifier": "com.bitcoinyieldbridge.app"
    },
    "android": {
      "package": "com.bitcoinyieldbridge.app"
    },
    "web": {
      "bundler": "metro"
    }
  }
}
```

## 📊 **Monitoring & Analytics**

### **Contract Monitoring**

```bash
# Set up monitoring script
./scripts/monitor.sh

# Track key metrics
starkli call <CONTRACT_ADDRESS> get_total_tvl
starkli call <CONTRACT_ADDRESS> get_user_count
starkli call <CONTRACT_ADDRESS> get_total_yield_distributed
```

### **Mobile App Analytics**

```javascript
// Add to mobile app
import { Analytics } from 'expo-analytics';

const analytics = new Analytics('G-XXXXXXXXXX');

// Track user actions
analytics.track('deposit_initiated', {
  amount: bitcoinAmount,
  strategy: selectedStrategy
});
```

## 🔒 **Security Checklist**

### **Smart Contracts**
- ✅ OpenZeppelin security components used
- ✅ Comprehensive test coverage (>90%)
- ✅ Access control implemented
- ✅ Emergency functions available
- ✅ Reentrancy protection enabled

### **Mobile App**
- ✅ No private keys stored in app
- ✅ HTTPS-only API communication
- ✅ Input validation on all forms
- ✅ Secure storage for sensitive data
- ✅ Biometric authentication support

## 🚀 **Go-Live Checklist**

### **Pre-Launch**
- [ ] Smart contracts deployed and verified
- [ ] Mobile app tested on iOS/Android
- [ ] Integration tests passing
- [ ] Documentation complete
- [ ] Security audit (if required)

### **Launch Day**
- [ ] Contract addresses updated in frontend
- [ ] Mobile app submitted to stores
- [ ] Web app deployed
- [ ] Monitoring dashboards active
- [ ] Team communication channels ready

### **Post-Launch**
- [ ] Monitor contract interactions
- [ ] Track mobile app downloads
- [ ] Collect user feedback
- [ ] Plan feature updates
- [ ] Community engagement

---

**Ready to deploy your Bitcoin DeFi aggregator to production!** 🚀

For questions or support during deployment, refer to the main README or create GitHub issues.