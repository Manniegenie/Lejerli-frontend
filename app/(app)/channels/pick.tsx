import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BackButton from '../../../src/components/common/BackButton';

const CEX = [
  { id: 'binance',    name: 'Binance',  color: '#F0B90B', isDex: false, logo: require('../../../assets/Binance-Logo.wine.png') },
  { id: 'kraken',     name: 'Kraken',   color: '#5741D9', isDex: false, logo: require('../../../assets/Kraken_idxFFUOEfJ_1.png') },
  { id: 'coinbase',   name: 'Coinbase', color: '#0052FF', isDex: false, logo: require('../../../assets/Coinbase_idR3970tUM_1.png') },
  { id: 'bybit_spot', name: 'Bybit',    color: '#F7A600', isDex: false, logo: require('../../../assets/id59lUrJSr_logos.png') },
  { id: 'obiex',      name: 'Obiex',    color: '#00C2FF', isDex: false, logo: require('../../../assets/idraEGJh5C_logos.png') },
];

const DEX = [
  { id: 'phantom',  name: 'Phantom',      color: '#AB9FF2', isDex: true,  logo: require('../../../assets/Phantom_Logo_1.png') },
  { id: 'metamask', name: 'MetaMask',     color: '#E88B22', isDex: true,  logo: require('../../../assets/MetaMask_Logo_1.png') },
  { id: 'trust',    name: 'Trust Wallet', color: '#3375BB', isDex: true,  logo: require('../../../assets/Trust_Stacked Logo_Green.png') },
  { id: 'uniswap',  name: 'Uniswap',      color: '#FF007A', isDex: true,  logo: require('../../../assets/Uniswap_Uniswap_logo_1.png') },
];

const FIAT = [
  { id: 'mono',        name: 'Mono',        color: '#0F9D58', isDex: false, logo: null },
  { id: 'paystack',    name: 'Paystack',    color: '#00C3F7', isDex: false, logo: null },
  { id: 'plaid',       name: 'Plaid',       color: '#00D4AB', isDex: false, logo: null },
  { id: 'flutterwave', name: 'Flutterwave', color: '#F5A623', isDex: false, logo: null },
];

function Tile({ item, onPress }: { item: { id: string; name: string; color: string; logo: any }; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.tile} onPress={onPress} activeOpacity={0.7}>
      <View style={item.logo ? s.tileIconLogo : [s.tileIcon, { backgroundColor: item.color + '18', borderColor: item.color + '35' }]}>
        {item.logo
          ? <Image source={item.logo} style={s.tileLogo} resizeMode="contain" />
          : <Text style={[s.tileInitials, { color: item.color }]}>{item.name.slice(0, 2).toUpperCase()}</Text>
        }
      </View>
      <Text style={s.tileName}>{item.name}</Text>
    </TouchableOpacity>
  );
}

export default function ChannelPickScreen() {
  const router = useRouter();
  const { tree } = useLocalSearchParams<{ tree: string }>();
  const isCrypto = tree === 'crypto';

  const navigate = (item: { id: string; name: string; color: string; isDex: boolean }) => {
    router.push({
      pathname: '/(app)/channels/form',
      params: { tree, id: item.id, name: item.name, color: item.color, isDex: item.isDex ? '1' : '0' },
    });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>{isCrypto ? 'Crypto' : 'Fiat'} Channels</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {isCrypto ? (
          <>
            <Text style={s.groupLabel}>CENTRALISED EXCHANGES</Text>
            <View style={s.grid}>
              {CEX.map(item => <Tile key={item.id} item={item} onPress={() => navigate(item)} />)}
            </View>
            <Text style={s.groupLabel}>DECENTRALISED WALLETS</Text>
            <View style={s.grid}>
              {DEX.map(item => <Tile key={item.id} item={item} onPress={() => navigate(item)} />)}
            </View>
          </>
        ) : (
          <>
            <Text style={s.groupLabel}>BANKING & PAYMENT RAILS</Text>
            <View style={s.grid}>
              {FIAT.map(item => <Tile key={item.id} item={item} onPress={() => navigate(item)} />)}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#0a0a0a' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  headerTitle:  { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  scroll:       { paddingHorizontal: 20, paddingTop: 4 },
  groupLabel:   { fontSize: 11, color: '#555555', letterSpacing: 1.2, marginBottom: 12, marginTop: 8 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  tile:         { width: '47%', backgroundColor: '#111111', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#1e1e1e', gap: 10 },
  tileIcon:     { width: 48, height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  tileIconLogo: { width: 80, height: 80 },
  tileInitials: { fontSize: 15, fontWeight: '700' },
  tileLogo:     { width: 80, height: 80, borderRadius: 12 },
  tileName:     { fontSize: 13, fontWeight: '500', color: '#ffffff' },
});
