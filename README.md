# BitcoinYieldBridge 🪙⚡

> **Bitcoin-Native DeFi Aggregator with Lightning Integration**  
> *Mobile-first MVP for seamless Bitcoin yield farming on Starknet*

[![Mobile App](https://img.shields.io/badge/Platform-React%20Native-blue.svg)](https://reactnative.dev/)
[![Smart Contracts](https://img.shields.io/badge/Blockchain-Starknet-purple.svg)](https://starknet.io/)
[![Lightning](https://img.shields.io/badge/Bridge-Lightning%20Network-orange.svg)](https://lightning.network/)
[![MVP Status](https://img.shields.io/badge/Status-MVP%20Development-green.svg)](#features)

## 🎯 **Product Vision**

BitcoinYieldBridge addresses a significant market opportunity where Bitcoin holders want to earn yield on their assets without complex DeFi interactions. Our solution provides seamless Bitcoin-to-Starknet DeFi integration with mobile-first user experience.

## � **Project Overview**

BitcoinYieldBridge is a **mobile-first Bitcoin DeFi aggregator** built on Starknet, enabling Bitcoin holders to earn yield through multiple DeFi protocols with Lightning Network integration and seamless UX.

### **Core Value Proposition**
- **Mobile-Native**: First Bitcoin DeFi app designed for mobile users
- **Multi-Protocol**: Aggregate yield opportunities across Vesu and Troves
- **Lightning Integration**: Instant Bitcoin-to-Starknet transfers
- **Account Abstraction**: Gasless transactions with AVNU paymaster

## 🚀 **Quick Start - MVP Development**

### **📋 Push to GitHub (2 minutes)**

```bash
# 1. Initialize repository (if not done)
git init
git add .
git commit -m "feat: BitcoinYieldBridge MVP with mobile app and smart contracts"

# 2. Create GitHub repository
# Go to: https://github.com/new
# Name: BitcoinYieldBridge
# Description: Bitcoin-Native DeFi Aggregator - Starknet Hackathon 2024
# Set to Public for hackathon visibility

# 3. Push to GitHub
git remote add origin https://github.com/YOURUSERNAME/BitcoinYieldBridge.git
git branch -M main
git push -u origin main
```

### **🐧 Ubuntu Contract Testing**

```bash
# On your Ubuntu system/WSL:
git clone https://github.com/YOURUSERNAME/BitcoinYieldBridge.git
cd BitcoinYieldBridge

# Install Cairo toolchain
curl -L https://raw.githubusercontent.com/software-mansion/scarb/main/install.sh | bash
curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | bash

# Build and test contracts
scarb build
snforge test --verbose

# Deploy to Starknet Sepolia
starkli account deploy --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7
./scripts/deploy.sh
```

### **📱 Test Mobile App (Works on Windows)**

```bash
# Frontend works on any OS
cd frontend
npm install
npx expo start

# Scan QR code with Expo Go app
# Or press 'w' for web version
```

## 🚀 Key Features

### Core Functionality
- **Native Lightning Support**: Instant BTC → Starknet swaps via Atomiq SDK
- **Multi-Protocol Yield**: Automated yield strategies across Vesu and Troves
- **Account Abstraction**: Gasless transactions paid in BTC-equivalent tokens
- **Mobile-First**: React Native app with Xverse wallet integration

### Technical Architecture
- **Smart Contracts**: Cairo contracts with OpenZeppelin security
- **Bridge Layer**: Atomiq SDK for Lightning-to-Starknet infrastructure
- **Frontend**: React Native with seamless Bitcoin authentication
- **Yield Optimization**: Automated strategies across multiple DeFi protocols

## 🛠 Technology Stack

- **Cairo**: Smart contract development
- **OpenZeppelin**: Security and access control
- **Scarb**: Package management
- **Starknet Foundry**: Testing framework
- **React Native**: Mobile-first frontend
- **Atomiq SDK**: Lightning-to-Starknet bridge
- **Xverse Wallet**: Bitcoin authentication

## 📦 Project Structure

```
BitcoinYieldBridge/
├── Scarb.toml                 # Package configuration
├── src/
│   ├── lib.cairo             # Main module
│   ├── bitcoin_yield_bridge.cairo  # Core contract
│   ├── interfaces/           # Contract interfaces
│   │   ├── ibitcoin_yield_bridge.cairo
│   │   ├── iadmin.cairo
│   │   ├── iatomiq_bridge.cairo
│   │   ├── ivesu_protocol.cairo
│   │   └── itroves_protocol.cairo
│   └── utils/               # Utility functions
│       ├── math.cairo
│       ├── constants.cairo
│       └── events.cairo
├── tests/                   # Test suite
├── scripts/                 # Deployment scripts
└── frontend/               # React Native app
```

## 🚀 Quick Start

### Prerequisites
- Rust and Cairo installed
- Scarb package manager
- Starknet Foundry for testing
- Node.js for frontend

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/BitcoinYieldBridge
cd BitcoinYieldBridge

# Install dependencies
scarb build

# Run tests
scarb test

# Deploy (update .env first)
./scripts/deploy.sh sepolia
```

### Environment Setup

```bash
# Copy environment template
cp scripts/.env.example .env

# Update with your configuration
# - Starknet RPC URL
# - Account and keystore paths
# - Integration contract addresses
```

## 🔧 Development

### Building Contracts
```bash
scarb build
```

### Running Tests
```bash
scarb test
```

### Deployment
```bash
# Deploy to Sepolia testnet
./scripts/deploy.sh sepolia

# Deploy to mainnet
./scripts/deploy.sh mainnet
```

## 🎯 Implementation Timeline (10 Days)

- **Days 1-3**: Core Cairo contracts and Atomiq integration ✅
- **Days 4-6**: Frontend development with Xverse and paymaster setup
- **Days 7-9**: Testing and yield strategy optimization
- **Day 10**: Demo video and documentation

## 📋 Smart Contract Features

### Core Functions
- `deposit()`: Deposit tokens into yield strategies
- `withdraw()`: Withdraw with accumulated yield
- `initiate_bridge()`: Start Lightning-to-Starknet swaps
- `add_strategy()`: Admin function to add new yield strategies

### Security Features
- OpenZeppelin access control
- Emergency pause functionality  
- Reentrancy protection
- Input validation and bounds checking

### Events
- Real-time deposit/withdrawal tracking
- Yield harvesting notifications
- Bridge status updates
- Strategy performance metrics

## 🔗 Integration Partners

- **Vesu**: Lending protocol integration
- **Troves**: Yield aggregation strategies
- **Atomiq**: Lightning-to-Starknet bridge
- **Xverse**: Bitcoin wallet authentication
- **AVNU**: Gasless transaction paymaster

## 🏆 Competitive Advantages

1. **First Bitcoin-Native DeFi Aggregator** on Starknet
2. **Lightning Network Integration** for instant settlements
3. **Account Abstraction** for seamless UX
4. **Multi-Protocol Yield** optimization
5. **Mobile-First Design** for mass adoption

## 📊 Market Opportunity

- Bitcoin DeFi TVL: $2.8B (current)
- Ethereum DeFi TVL: $62.3B (target market)
- Opportunity: 10% capture = $6.2B addressable market
- Starknet advantages: Ultra-low fees, Ethereum security

## 🛡 Security

- OpenZeppelin audited contracts
- Formal verification ready
- Emergency pause mechanisms
- Multi-signature admin controls
- Comprehensive test coverage

## 📱 Frontend Features

- Native Bitcoin wallet integration
- Real-time yield tracking
- One-click deposit flows
- Portfolio analytics
- Mobile-optimized interface

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Starknet Re{Solve} Hackathon](https://resolve-starknet.devpost.com/)
- [Starknet Documentation](https://docs.starknet.io/)
- [Cairo Book](https://book.cairo-lang.org/)
- [OpenZeppelin Cairo](https://github.com/OpenZeppelin/cairo-contracts)

## 📞 Contact

- Twitter: [@BitcoinYieldBridge]
- Discord: [Join our server]
- Email: team@bitcoinyieldbridge.com

---

**Building the future of Bitcoin DeFi on Starknet** 🚀#   b i t c o i n - y i e l d - b r i d g e  
 