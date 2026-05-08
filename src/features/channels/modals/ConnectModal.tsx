import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import walletService from '../../../services/walletService';

const CEX: { id: string; name: string; color: string }[] = [
  { id: 'binance',    name: 'Binance',  color: '#F0B90B' },
  { id: 'kraken',     name: 'Kraken',   color: '#5741D9' },
  { id: 'coinbase',   name: 'Coinbase', color: '#0052FF' },
  { id: 'bybit_spot', name: 'Bybit',    color: '#F7A600' },
];

const DEX: { id: string; name: string; color: string }[] = [
  { id: 'phantom',  name: 'Phantom',       color: '#AB9FF2' },
  { id: 'metamask', name: 'MetaMask',      color: '#E88B22' },
  { id: 'trust',    name: 'Trust Wallet',  color: '#3375BB' },
  { id: 'jupiter',  name: 'Jupiter',       color: '#00BF8F' },
  { id: 'uniswap',  name: 'Uniswap',       color: '#FF007A' },
  { id: 'raydium',  name: 'Raydium',       color: '#4ADE80' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onConnected: () => void;
}

type Step = 'pick' | 'form';

export default function ConnectModal({ visible, onClose, onConnected }: Props) {
  const [step, setStep] = useState<Step>('pick');
  const [selected, setSelected] = useState<{ id: string; name: string; color: string; isDex: boolean } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep('pick');
    setSelected(null);
    setApiKey('');
    setApiSecret('');
    setWalletAddress('');
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickExchange = (item: { id: string; name: string; color: string }, isDex: boolean) => {
    setSelected({ ...item, isDex });
    setStep('form');
  };

  const handleConnect = async () => {
    if (!selected) return;

    if (selected.isDex) {
      if (!walletAddress.trim()) {
        Alert.alert('Missing field', 'Please enter your wallet address.');
        return;
      }
    } else {
      if (!apiKey.trim() || !apiSecret.trim()) {
        Alert.alert('Missing fields', 'Please enter your API key and secret.');
        return;
      }
    }

    setLoading(true);
    try {
      if (selected.isDex) {
        await walletService.connectDex(selected.id, walletAddress.trim());
      } else {
        await walletService.connect(selected.id, apiKey.trim(), apiSecret.trim());
      }
      onConnected();
      handleClose();
    } catch (e: any) {
      Alert.alert('Connection failed', e.response?.data?.message || 'Could not connect. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={handleClose} />
      <View style={s.sheet}>
        <View style={s.handle} />

        {step === 'pick' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.title}>Connect Exchange</Text>
            <Text style={s.subtitle}>Choose an exchange or wallet to connect</Text>

            <Text style={s.groupLabel}>CENTRALISED EXCHANGES</Text>
            <View style={s.grid}>
              {CEX.map((item) => (
                <ExchangeTile
                  key={item.id}
                  item={item}
                  onPress={() => pickExchange(item, false)}
                />
              ))}
            </View>

            <Text style={s.groupLabel}>DECENTRALISED WALLETS</Text>
            <View style={s.grid}>
              {DEX.map((item) => (
                <ExchangeTile
                  key={item.id}
                  item={item}
                  onPress={() => pickExchange(item, true)}
                />
              ))}
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>
        ) : (
          <View>
            {/* Back + title */}
            <TouchableOpacity onPress={() => setStep('pick')} style={s.backBtn} activeOpacity={0.7}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={s.selectedHeader}>
              <View style={[s.selectedIcon, { backgroundColor: (selected?.color ?? '#F26522') + '18', borderColor: (selected?.color ?? '#F26522') + '35' }]}>
                <Text style={[s.selectedInitials, { color: selected?.color ?? '#F26522' }]}>
                  {selected?.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={s.title}>{selected?.name}</Text>
                <Text style={s.subtitle}>{selected?.isDex ? 'DEX Wallet' : 'CEX Exchange'}</Text>
              </View>
            </View>

            {selected?.isDex ? (
              <>
                <Text style={s.fieldLabel}>Wallet Address</Text>
                <View style={s.inputRow}>
                  <TextInput
                    style={s.input}
                    placeholder="0x... or wallet address"
                    placeholderTextColor="#555"
                    value={walletAddress}
                    onChangeText={setWalletAddress}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={s.fieldLabel}>API Key</Text>
                <View style={s.inputRow}>
                  <TextInput
                    style={s.input}
                    placeholder="Enter API key"
                    placeholderTextColor="#555"
                    value={apiKey}
                    onChangeText={setApiKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <Text style={s.fieldLabel}>API Secret</Text>
                <View style={s.inputRow}>
                  <TextInput
                    style={s.input}
                    placeholder="Enter API secret"
                    placeholderTextColor="#555"
                    value={apiSecret}
                    onChangeText={setApiSecret}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                  />
                </View>
              </>
            )}

            <Text style={s.hint}>
              {selected?.isDex
                ? 'Your wallet address is read-only. No private keys are ever stored.'
                : 'Use read-only API keys. We never request withdrawal permissions.'}
            </Text>

            <TouchableOpacity
              style={[s.confirmBtn, loading && s.confirmBtnDisabled]}
              onPress={handleConnect}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.confirmText}>Connect {selected?.name}</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

function ExchangeTile({
  item, onPress,
}: {
  item: { id: string; name: string; color: string };
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.tile} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.tileIcon, { backgroundColor: item.color + '18', borderColor: item.color + '35' }]}>
        <Text style={[s.tileInitials, { color: item.color }]}>
          {item.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <Text style={s.tileName}>{item.name}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  backdrop:           { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:              { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#111111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 44, maxHeight: '90%' },
  handle:             { width: 36, height: 4, borderRadius: 2, backgroundColor: '#333333', alignSelf: 'center', marginBottom: 24 },
  title:              { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  subtitle:           { fontSize: 13, color: '#666666', marginBottom: 20 },
  groupLabel:         { fontSize: 11, color: '#555555', letterSpacing: 1.2, marginBottom: 12, marginTop: 4 },
  grid:               { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  tile:               { width: '47%', backgroundColor: '#0f0f0f', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1e1e1e', gap: 10 },
  tileIcon:           { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  tileInitials:       { fontSize: 14, fontWeight: '700' },
  tileName:           { fontSize: 13, fontWeight: '500', color: '#ffffff' },
  backBtn:            { marginBottom: 20 },
  backText:           { fontSize: 14, color: '#F26522' },
  selectedHeader:     { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  selectedIcon:       { width: 52, height: 52, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  selectedInitials:   { fontSize: 16, fontWeight: '700' },
  fieldLabel:         { fontSize: 13, color: '#aaaaaa', marginBottom: 8 },
  inputRow:           { backgroundColor: '#0a0a0a', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a', paddingHorizontal: 16, height: 54, justifyContent: 'center', marginBottom: 16 },
  input:              { color: '#ffffff', fontSize: 15 },
  hint:               { fontSize: 12, color: '#555555', lineHeight: 18, marginBottom: 24 },
  confirmBtn:         { height: 54, backgroundColor: '#F26522', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmText:        { fontSize: 16, fontWeight: '600', color: '#ffffff' },
});
