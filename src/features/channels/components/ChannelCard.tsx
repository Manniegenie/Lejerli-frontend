import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ChannelRow } from '../../../services/channelService';

const EXCHANGE_META: Record<string, { color: string; initials: string }> = {
  binance:    { color: '#F0B90B', initials: 'BN' },
  kraken:     { color: '#5741D9', initials: 'KR' },
  coinbase:   { color: '#0052FF', initials: 'CB' },
  bybit_spot: { color: '#F7A600', initials: 'BY' },
  phantom:    { color: '#AB9FF2', initials: 'PH' },
  metamask:   { color: '#E88B22', initials: 'MM' },
  trust:      { color: '#3375BB', initials: 'TW' },
  jupiter:    { color: '#00BF8F', initials: 'JU' },
  uniswap:    { color: '#FF007A', initials: 'UN' },
  raydium:    { color: '#4ADE80', initials: 'RY' },
};

interface Props {
  channel: ChannelRow;
  isSyncing: boolean;
  onSync: () => void;
  onDisconnect: () => void;
}

export default function ChannelCard({ channel, isSyncing, onSync, onDisconnect }: Props) {
  const meta = EXCHANGE_META[channel.id] ?? { color: '#F26522', initials: channel.id.slice(0, 2).toUpperCase() };
  const isConnected = channel.status === 'Active' || !!channel.snapshot;

  const formatUSD = (val: string | null | undefined) => {
    if (!val) return '—';
    const n = parseFloat(val);
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={s.card}>
      {/* Top row: icon + name + status */}
      <View style={s.topRow}>
        <View style={[s.iconBg, { backgroundColor: meta.color + '18', borderColor: meta.color + '35' }]}>
          <Text style={[s.iconText, { color: meta.color }]}>{meta.initials}</Text>
        </View>

        <View style={s.nameBlock}>
          <Text style={s.channelName}>{channel.channel}</Text>
          <Text style={s.channelType}>{channel.type}</Text>
        </View>

        <View style={[s.statusBadge, { backgroundColor: isConnected ? '#14532d' : '#1c1c1c' }]}>
          <View style={[s.statusDot, { backgroundColor: isConnected ? '#22c55e' : '#555555' }]} />
          <Text style={[s.statusText, { color: isConnected ? '#4ade80' : '#888888' }]}>
            {isConnected ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Balance row */}
      <View style={s.balanceRow}>
        <View style={s.balanceStat}>
          <Text style={s.balanceLabel}>Balance</Text>
          <Text style={s.balanceValue}>{formatUSD(channel.snapshot?.totalUSD)}</Text>
        </View>
        <View style={s.balanceStat}>
          <Text style={s.balanceLabel}>Assets</Text>
          <Text style={s.balanceValue}>{channel.snapshot?.assetCount ?? '—'}</Text>
        </View>
        <View style={s.balanceStat}>
          <Text style={s.balanceLabel}>Last Synced</Text>
          <Text style={s.balanceValue} numberOfLines={1}>{formatDate(channel.lastSynced)}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.syncBtn, isSyncing && s.syncBtnDisabled]}
          onPress={onSync}
          disabled={isSyncing}
          activeOpacity={0.8}
        >
          {isSyncing
            ? <ActivityIndicator size="small" color="#F26522" />
            : <Text style={s.syncBtnText}>↻  Sync</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.disconnectBtn} onPress={onDisconnect} activeOpacity={0.7}>
          <Text style={s.disconnectText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card:              { backgroundColor: '#111111', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#1e1e1e', marginBottom: 12 },
  topRow:            { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  iconBg:            { width: 46, height: 46, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  iconText:          { fontSize: 14, fontWeight: '700' },
  nameBlock:         { flex: 1, gap: 3 },
  channelName:       { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  channelType:       { fontSize: 12, color: '#666666' },
  statusBadge:       { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10, gap: 6 },
  statusDot:         { width: 6, height: 6, borderRadius: 3 },
  statusText:        { fontSize: 12, fontWeight: '500' },
  balanceRow:        { flexDirection: 'row', backgroundColor: '#0a0a0a', borderRadius: 10, padding: 14, marginBottom: 14, gap: 4 },
  balanceStat:       { flex: 1, alignItems: 'center', gap: 4 },
  balanceLabel:      { fontSize: 11, color: '#555555' },
  balanceValue:      { fontSize: 13, fontWeight: '600', color: '#ffffff' },
  actions:           { flexDirection: 'row', gap: 10 },
  syncBtn:           { flex: 1, height: 42, backgroundColor: 'rgba(242,101,34,0.1)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(242,101,34,0.25)' },
  syncBtnDisabled:   { opacity: 0.5 },
  syncBtnText:       { fontSize: 14, fontWeight: '600', color: '#F26522' },
  disconnectBtn:     { height: 42, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  disconnectText:    { fontSize: 13, color: '#888888' },
});
