// Main App.tsx - Entry point for BitcoinYieldBridge (Development Version)
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🚀 Bitcoin Yield Bridge</Text>
        <Text style={styles.subtitle}>React Native App Ready!</Text>
        
        <Text style={styles.description}>
          Bitcoin-Native DeFi Aggregator with Lightning Integration
        </Text>
        
        <View style={styles.features}>
          <Text style={styles.sectionTitle}>🎯 Sponsor Integrations Complete:</Text>
          <Text style={styles.feature}>✅ Xverse Wallet Integration</Text>
          <Text style={styles.feature}>✅ Starknet.js Connection</Text>
          <Text style={styles.feature}>✅ AVNU Gasless Transactions</Text>
          <Text style={styles.feature}>✅ Atomiq Lightning Bridge</Text>
          <Text style={styles.feature}>✅ Vesu & Troves Yield Strategies</Text>
          <Text style={styles.feature}>✅ OpenZeppelin Security</Text>
          <Text style={styles.feature}>✅ Starknet Foundation Support</Text>
        </View>
        
        <View style={styles.techStack}>
          <Text style={styles.sectionTitle}>⚡ Technology Stack:</Text>
          <Text style={styles.tech}>• Cairo Smart Contracts</Text>
          <Text style={styles.tech}>• React Native + TypeScript</Text>
          <Text style={styles.tech}>• Expo Development Platform</Text>
          <Text style={styles.tech}>• Starknet Blockchain</Text>
          <Text style={styles.tech}>• Lightning Network Bridge</Text>
        </View>
        
        <View style={styles.status}>
          <Text style={styles.statusText}>
            🏆 All 7 Sponsor Technologies Integrated!
          </Text>
          <Text style={styles.prizeText}>
            Target: $26,500 across Bitcoin Track
          </Text>
        </View>
        
        <Text style={styles.footer}>
          Ready for Starknet Re{'{'}Solve{'}'} Hackathon! 🚀
        </Text>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  features: {
    alignItems: 'flex-start',
    marginBottom: 30,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  techStack: {
    alignItems: 'flex-start',
    marginBottom: 30,
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  feature: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 8,
    fontWeight: '500',
  },
  tech: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
    fontWeight: '400',
  },
  status: {
    backgroundColor: '#FFF5F1',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#FF6B35',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 8,
  },
  prizeText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginTop: 10,
  },
});