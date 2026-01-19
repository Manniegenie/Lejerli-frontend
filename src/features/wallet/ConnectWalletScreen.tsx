import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import walletService from '../../services/walletService';

export default function ConnectWalletScreen({ route, navigation }: any) {
  const { exchange } = route.params;
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const getExchangeName = () => {
    return exchange.charAt(0).toUpperCase() + exchange.slice(1);
  };

  const handleConnect = async () => {
    if (!apiKey || !apiSecret) {
      Alert.alert('Error', 'Please provide both API Key and API Secret');
      return;
    }

    try {
      setLoading(true);
      let response;

      switch (exchange) {
        case 'binance':
          response = await walletService.connectBinance({ apiKey, apiSecret });
          break;
        case 'kraken':
          response = await walletService.connectKraken({ apiKey, apiSecret });
          break;
        case 'coinbase':
          response = await walletService.connectCoinbase({ apiKey, apiSecret });
          break;
        default:
          throw new Error('Invalid exchange');
      }

      if (response.success) {
        Alert.alert('Success', response.message, [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        'Connection Failed',
        error.response?.data?.message || 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Connect {getExchangeName()}</Text>
        <Text style={styles.subtitle}>
          Enter your {getExchangeName()} API credentials
        </Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Important</Text>
          <Text style={styles.warningText}>
            Make sure your API key has ONLY read permissions enabled. Do not enable
            trading or withdrawal permissions.
          </Text>
        </View>

        <Text style={styles.label}>API Key</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter API Key"
          value={apiKey}
          onChangeText={setApiKey}
          autoCapitalize="none"
          placeholderTextColor="#999"
          multiline
        />

        <Text style={styles.label}>API Secret</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter API Secret"
          value={apiSecret}
          onChangeText={setApiSecret}
          autoCapitalize="none"
          secureTextEntry
          placeholderTextColor="#999"
          multiline
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Connect Wallet</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#b0b0b0',
    marginBottom: 24,
  },
  warningBox: {
    backgroundColor: '#3d2e1b',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#fbbf24',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: '#2a2a2a',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#4a4a4a',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
  },
  cancelButtonText: {
    color: '#b0b0b0',
    fontSize: 16,
  },
});
