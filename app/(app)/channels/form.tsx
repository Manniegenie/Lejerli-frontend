import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Svg, { Path, Rect } from 'react-native-svg';
import BackButton from '../../../src/components/common/BackButton';
import walletService from '../../../src/services/walletService';
import CHANNEL_LOGOS from '../../../src/utils/channelLogos';

function PasteIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Rect x="8" y="2" width="8" height="4" rx="1" stroke="#888888" strokeWidth={1.5} />
      <Path d="M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2" stroke="#888888" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export default function ChannelFormScreen() {
  const router = useRouter();
  const { tree, id, name, color, isDex } = useLocalSearchParams<{
    tree: string; id: string; name: string; color: string; isDex: string;
  }>();

  const isWallet = isDex === '1';
  const isFiat   = tree === 'fiat';

  const [apiKey, setApiKey]               = useState('');
  const [apiSecret, setApiSecret]         = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading]             = useState(false);

  const paste = async (setter: (v: string) => void) => {
    const text = await Clipboard.getStringAsync();
    if (text) setter(text.trim());
  };

  const handleConnect = async () => {
    if (isWallet) {
      if (!walletAddress.trim()) { Alert.alert('Missing field', 'Please enter your wallet address.'); return; }
    } else {
      if (!apiKey.trim() || !apiSecret.trim()) { Alert.alert('Missing fields', 'Please enter your API key and secret.'); return; }
    }
    setLoading(true);
    try {
      if (isWallet) {
        await walletService.connectDex(id, walletAddress.trim());
      } else {
        await walletService.connect(id, apiKey.trim(), apiSecret.trim());
      }
      router.dismissAll();
    } catch (e: any) {
      Alert.alert('Connection failed', e.response?.data?.message || 'Could not connect. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const accent = color ?? '#F26522';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>Connect</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.identity}>
          {CHANNEL_LOGOS[id]
            ? <Image source={CHANNEL_LOGOS[id]} style={s.iconLogo} resizeMode="contain" />
            : <View style={[s.icon, { backgroundColor: accent + '18', borderColor: accent + '35' }]}>
                <Text style={[s.initials, { color: accent }]}>
                  {(name ?? '').slice(0, 2).toUpperCase()}
                </Text>
              </View>
          }
          <Text style={s.channelName}>{name}</Text>
          <Text style={s.channelType}>
            {isFiat ? 'Fiat Channel' : isWallet ? 'DEX Wallet' : 'CEX Exchange'}
          </Text>
        </View>

        {isWallet ? (
          <>
            <Text style={s.fieldLabel}>Wallet Address</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="0x... or wallet address"
                placeholderTextColor="#444"
                value={walletAddress}
                onChangeText={setWalletAddress}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={s.pasteBtn} onPress={() => paste(setWalletAddress)} activeOpacity={0.7}>
                <PasteIcon />
                <Text style={s.pasteText}>Paste</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={s.fieldLabel}>API Key</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="Enter API key"
                placeholderTextColor="#444"
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={s.pasteBtn} onPress={() => paste(setApiKey)} activeOpacity={0.7}>
                <PasteIcon />
                <Text style={s.pasteText}>Paste</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.fieldLabel}>API Secret</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="Enter API secret"
                placeholderTextColor="#444"
                value={apiSecret}
                onChangeText={setApiSecret}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <TouchableOpacity style={s.pasteBtn} onPress={() => paste(setApiSecret)} activeOpacity={0.7}>
                <PasteIcon />
                <Text style={s.pasteText}>Paste</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={s.hint}>
          {isWallet
            ? 'Your wallet address is read-only. No private keys are ever stored.'
            : 'Use read-only API keys. We never request withdrawal permissions.'}
        </Text>

        <TouchableOpacity
          style={[s.confirmBtn, loading && { opacity: 0.6 }]}
          onPress={handleConnect}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.confirmText}>Connect {name}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#0a0a0a' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  scroll:      { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },

  identity:    { alignItems: 'center', paddingVertical: 32 },
  icon:        { width: 72, height: 72, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  iconLogo:    { width: 72, height: 72, borderRadius: 20, marginBottom: 14 },
  initials:    { fontSize: 22, fontWeight: '700' },
  channelName: { fontSize: 22, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  channelType: { fontSize: 13, color: '#666666' },

  fieldLabel:  { fontSize: 12, color: '#888888', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111111', borderRadius: 12, borderWidth: 1, borderColor: '#222222', paddingHorizontal: 16, height: 54, marginBottom: 16 },
  input:       { flex: 1, color: '#ffffff', fontSize: 15 },
  pasteBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#2a2a2a' },
  pasteText:   { fontSize: 12, color: '#888888' },
  hint:        { fontSize: 12, color: '#444444', lineHeight: 18, marginBottom: 32, marginTop: 8 },

  confirmBtn:  { height: 54, backgroundColor: '#F26522', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
});
