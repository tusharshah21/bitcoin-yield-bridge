# BitcoinYieldBridge Mobile Frontend

Mobile-first React Native application for Bitcoin-Native DeFi Aggregation with Lightning Integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g @expo/cli`
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
expo start
```

### Platform Setup

**iOS:**
```bash
expo start --ios
```

**Android:**
```bash
expo start --android
```

**Web (for testing):**
```bash
expo start --web
```

## 📱 App Architecture

### Technology Stack
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and SDK
- **TypeScript**: Type safety and better DX
- **Starknet.js**: Blockchain interactions
- **React Navigation**: Screen navigation
- **Async Storage**: Local data persistence

### Project Structure
```
src/
├── components/          # Reusable UI components
├── screens/            # App screens (pages)
├── services/           # External integrations
├── hooks/              # Custom React hooks
├── types/              # TypeScript interfaces
├── constants/          # App configuration
└── utils/              # Helper functions
```

### Key Features

#### 🔐 Wallet Integration
- **Xverse Wallet**: Bitcoin authentication and signing
- **Deep Linking**: Mobile wallet integration
- **Account Management**: Address and balance display

#### ⚡ Lightning Bridge
- **Atomiq SDK**: Bitcoin to Starknet swaps
- **Real-time Rates**: Live exchange rate updates
- **Transaction Tracking**: Bridge status monitoring

#### 💰 DeFi Yield Strategies
- **Vesu Protocol**: Lending yield (5-6% APY)
- **Troves Protocol**: Yield farming (7-9% APY)
- **Risk Assessment**: Visual risk level indicators
- **APY Tracking**: Real-time yield calculations

#### 📊 Portfolio Management
- **Balance Overview**: Total value and yield tracking
- **Position Details**: Per-strategy breakdown
- **Performance Metrics**: ROI and yield analytics
- **Transaction History**: Complete activity log

#### 🎯 Account Abstraction
- **AVNU Paymaster**: Gasless transactions
- **Hidden Complexity**: Fees paid in USD equivalent
- **Mobile UX**: One-click operations

## 🔧 Development

### Environment Setup

1. **Create Environment File**
```bash
cp .env.example .env
```

2. **Configure API Keys**
```env
EXPO_PUBLIC_STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io/rpc/v0_7
EXPO_PUBLIC_CONTRACT_ADDRESS=0x...
EXPO_PUBLIC_ATOMIQ_API_KEY=your_atomiq_key
EXPO_PUBLIC_XVERSE_APP_ID=your_xverse_app_id
```

### Building for Production

**Android APK:**
```bash
expo build:android
```

**iOS IPA:**
```bash
expo build:ios
```

**Web Build:**
```bash
expo build:web
```

### Testing

**Unit Tests:**
```bash
npm test
```

**E2E Tests:**
```bash
npm run test:e2e
```

## 📋 Screen Specifications

### 1. WalletConnect Screen
- **Purpose**: Initial wallet connection and onboarding
- **Features**:
  - App introduction and value proposition
  - Xverse wallet connection flow
  - Deep link handling for mobile
  - Demo mode for testing
  - Error handling and retry logic

### 2. Dashboard Screen  
- **Purpose**: Main portfolio overview and quick actions
- **Features**:
  - Total portfolio value display
  - Yield summary and ROI metrics
  - Quick action buttons (Deposit/Withdraw/Bridge)
  - Active positions overview
  - Available strategies showcase
  - Real-time price updates (BTC/ETH)

### 3. Deposit Screen
- **Purpose**: Bitcoin deposit and strategy selection
- **Features**:
  - Bitcoin amount input with USD conversion
  - Strategy comparison (Vesu vs Troves)
  - APY and risk level display
  - Bridge transaction preview
  - One-click deposit execution
  - Transaction status tracking

### 4. Withdraw Screen
- **Purpose**: Yield withdrawal and position management
- **Features**:
  - Current positions overview
  - Partial or full withdrawal options
  - Yield breakdown by strategy
  - Fee estimation and confirmation
  - Real-time balance updates
  - Withdrawal history

### 5. History Screen
- **Purpose**: Transaction history and analytics
- **Features**:
  - Complete transaction list
  - Filter by type (deposit/withdrawal/yield)
  - Search and sort functionality
  - Transaction detail modals
  - Earnings analytics and charts
  - Export capabilities

## 🔌 Integration Details

### Xverse Wallet Integration
```typescript
// Connect to Xverse wallet
const wallet = await XverseWalletService.connectMobile();

// Sign Bitcoin transaction
const signature = await wallet.signTransaction(txData);

// Get balance
const balance = await wallet.getBalance();
```

### Starknet Integration
```typescript
// Connect to Starknet
const provider = await StarknetService.connect();

// Execute deposit
const result = await provider.depositAndYield(amount, strategyId);

// Get user balance
const balance = await provider.getUserBalance(address);
```

### Atomiq Bridge Integration
```typescript
// Initiate Bitcoin bridge
const bridgeId = await AtomiqService.initiateBridge({
  from: 'BTC',
  to: 'USDC',
  amount: bitcoinAmount,
});

// Track bridge status
const status = await AtomiqService.getBridgeStatus(bridgeId);
```

### AVNU Paymaster Integration
```typescript
// Check if transaction is gasless
const isGasless = await AVNUService.isTransactionSponsored(user);

// Execute gasless transaction
const result = await AVNUService.executeGaslessTransaction(calldata);
```

## 🎨 UI/UX Guidelines

### Design System
- **Colors**: Bitcoin orange (#FF6B35) primary, professional grays
- **Typography**: System fonts with clear hierarchy
- **Spacing**: Consistent 8px grid system
- **Shadows**: Subtle elevation for depth
- **Animation**: Smooth transitions (200-400ms)

### Mobile Optimization
- **Touch Targets**: Minimum 44px tap areas
- **Typography**: Readable sizes (16px+ for body text)
- **Navigation**: Bottom tabs for main sections
- **Loading States**: Clear progress indicators
- **Error Handling**: User-friendly error messages

### Accessibility
- **Screen Reader**: Full VoiceOver/TalkBack support
- **Color Contrast**: WCAG AA compliant
- **Text Scaling**: Support for dynamic type
- **Touch Accommodation**: Accessible tap targets

## 🔒 Security Considerations

### Private Key Management
- Never store private keys in the app
- Use Xverse wallet for key management
- Secure communication with wallet apps

### API Security
- Validate all external API responses
- Implement request timeouts
- Use HTTPS for all network calls
- Sanitize user inputs

### Data Protection
- Encrypt sensitive local data
- Implement secure storage
- Clear sensitive data on app backgrounding
- Use biometric authentication when available

## 🚀 Deployment

### App Store Deployment

**iOS App Store:**
1. Build production IPA
2. Upload via Xcode or Application Loader
3. Submit for App Store review
4. Monitor app performance

**Google Play Store:**
1. Build production APK/AAB
2. Upload to Google Play Console
3. Complete store listing
4. Publish to production

### Web Deployment
```bash
# Build for web
expo build:web

# Deploy to hosting service
npm run deploy
```

## 📊 Performance Optimization

### Bundle Size
- Code splitting for large dependencies
- Lazy loading for non-critical screens
- Asset optimization (images/fonts)
- Remove unused dependencies

### Runtime Performance
- Optimize FlatList rendering
- Implement proper key props
- Use React.memo for expensive components
- Debounce API calls

### Network Optimization
- Cache API responses
- Implement offline support
- Optimize image loading
- Use compression for large payloads

## 🐛 Debugging

### Development Tools
- **Flipper**: React Native debugging
- **Reactotron**: State and API monitoring
- **Expo DevTools**: Live reload and debugging

### Error Tracking
- **Sentry**: Crash reporting and performance monitoring
- **Custom Logging**: Debug and error logging
- **Analytics**: User behavior tracking

## 📈 Analytics & Monitoring

### Key Metrics
- Daily/Monthly Active Users
- Transaction success rates
- Average session duration
- Feature adoption rates
- Conversion funnel metrics

### Performance Monitoring
- App startup time
- Screen transition performance
- API response times
- Crash rates and error tracking

## 🤝 Contributing

### Development Workflow
1. Fork repository and create feature branch
2. Follow code style guidelines
3. Write tests for new features
4. Submit pull request with description
5. Address code review feedback

### Code Standards
- TypeScript strict mode
- ESLint and Prettier formatting
- Component documentation
- Unit test coverage >80%

## 📄 License

MIT License - see LICENSE file for details

---

**Building the future of Bitcoin DeFi on mobile** 🚀📱