// Main App.tsx - Entry point for BitcoinYieldBridge
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import WalletConnectScreen from './src/screens/WalletConnectScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import DepositScreen from './src/screens/DepositScreen';
import WithdrawScreen from './src/screens/WithdrawScreen';
import HistoryScreen from './src/screens/HistoryScreen';

// Types
import { RootStackParamList, TabParamList } from './src/types';
import { COLORS } from './src/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Bottom Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="📊" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Deposit"
        component={DepositScreen}
        options={{
          tabBarLabel: 'Deposit',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="💰" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Withdraw"
        component={WithdrawScreen}
        options={{
          tabBarLabel: 'Withdraw',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="📤" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="📋" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Tab Icon Component (using emoji for now, replace with proper icons)
const TabIcon = ({ icon, color, size }: { icon: string; color: string; size: number }) => (
  <span style={{ fontSize: size, opacity: color === COLORS.primary ? 1 : 0.6 }}>
    {icon}
  </span>
);

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="WalletConnect"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen
            name="WalletConnect"
            component={WalletConnectScreen}
            options={{
              title: 'Connect Wallet',
            }}
          />
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{
              title: 'BitcoinYieldBridge',
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

// App Configuration
const AppConfig = {
  name: 'BitcoinYieldBridge',
  version: '1.0.0',
  description: 'Bitcoin-Native DeFi Aggregator with Lightning Integration',
  author: 'BitcoinYieldBridge Team',
  website: 'https://bitcoinyieldbridge.com',
  repository: 'https://github.com/bitcoinyieldbridge/mobile-app',
  license: 'MIT',
  privacy: 'https://bitcoinyieldbridge.com/privacy',
  terms: 'https://bitcoinyieldbridge.com/terms',
  support: 'support@bitcoinyieldbridge.com',
};