import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import walletService, { WalletStatusResponse } from '../../services/walletService';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [walletStatus, setWalletStatus] = useState<WalletStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWalletStatus = async () => {
    try {
      const status = await walletService.getWalletStatus();
      setWalletStatus(status);
    } catch (error) {
      console.error('Error fetching wallet status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletStatus();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWalletStatus();
  };

  const getConnectedCount = () => {
    if (!walletStatus) return 0;
    return [
      walletStatus.data.binance.connected,
      walletStatus.data.kraken.connected,
      walletStatus.data.coinbase.connected,
    ].filter(Boolean).length;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.username}>{user?.username}!</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Connected Exchanges</Text>
        <Text style={styles.statsValue}>{getConnectedCount()}/3</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exchange Wallets</Text>

        <TouchableOpacity
          style={[
            styles.walletCard,
            walletStatus?.data.binance.connected && styles.walletCardConnected,
          ]}
          onPress={() => navigation.navigate('ConnectWallet', { exchange: 'binance' })}
        >
          <View style={styles.walletHeader}>
            <Text style={styles.walletName}>Binance</Text>
            <View
              style={[
                styles.badge,
                walletStatus?.data.binance.connected ? styles.badgeConnected : styles.badgeDisconnected,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  walletStatus?.data.binance.connected ? styles.badgeTextConnected : styles.badgeTextDisconnected,
                ]}
              >
                {walletStatus?.data.binance.connected ? 'Connected' : 'Not Connected'}
              </Text>
            </View>
          </View>
          {walletStatus?.data.binance.connected && walletStatus.data.binance.connectedAt && (
            <Text style={styles.walletInfo}>
              Connected {new Date(walletStatus.data.binance.connectedAt).toLocaleDateString()}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.walletCard,
            walletStatus?.data.kraken.connected && styles.walletCardConnected,
          ]}
          onPress={() => navigation.navigate('ConnectWallet', { exchange: 'kraken' })}
        >
          <View style={styles.walletHeader}>
            <Text style={styles.walletName}>Kraken</Text>
            <View
              style={[
                styles.badge,
                walletStatus?.data.kraken.connected ? styles.badgeConnected : styles.badgeDisconnected,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  walletStatus?.data.kraken.connected ? styles.badgeTextConnected : styles.badgeTextDisconnected,
                ]}
              >
                {walletStatus?.data.kraken.connected ? 'Connected' : 'Not Connected'}
              </Text>
            </View>
          </View>
          {walletStatus?.data.kraken.connected && walletStatus.data.kraken.connectedAt && (
            <Text style={styles.walletInfo}>
              Connected {new Date(walletStatus.data.kraken.connectedAt).toLocaleDateString()}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.walletCard,
            walletStatus?.data.coinbase.connected && styles.walletCardConnected,
          ]}
          onPress={() => navigation.navigate('ConnectWallet', { exchange: 'coinbase' })}
        >
          <View style={styles.walletHeader}>
            <Text style={styles.walletName}>Coinbase</Text>
            <View
              style={[
                styles.badge,
                walletStatus?.data.coinbase.connected ? styles.badgeConnected : styles.badgeDisconnected,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  walletStatus?.data.coinbase.connected ? styles.badgeTextConnected : styles.badgeTextDisconnected,
                ]}
              >
                {walletStatus?.data.coinbase.connected ? 'Connected' : 'Not Connected'}
              </Text>
            </View>
          </View>
          {walletStatus?.data.coinbase.connected && walletStatus.data.coinbase.connectedAt && (
            <Text style={styles.walletInfo}>
              Connected {new Date(walletStatus.data.coinbase.connectedAt).toLocaleDateString()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 18,
    color: '#b0b0b0',
  },
  username: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statsCard: {
    backgroundColor: '#007AFF',
    margin: 20,
    marginTop: 0,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  statsTitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  walletCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  walletCardConnected: {
    borderColor: '#34C759',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  walletInfo: {
    fontSize: 14,
    color: '#b0b0b0',
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeConnected: {
    backgroundColor: '#1b3d1b',
  },
  badgeDisconnected: {
    backgroundColor: '#3d2e1b',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextConnected: {
    color: '#4ade80',
  },
  badgeTextDisconnected: {
    color: '#fbbf24',
  },
});
