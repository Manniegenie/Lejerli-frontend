import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import walletService from '../../services/walletService';
import { useChannelManager } from './hooks/useChannelManager';
import ChannelCard from './components/ChannelCard';
import SyncModal from './modals/SyncModal';
import ConnectModal from './modals/ConnectModal';

export default function ChannelsScreen({ navigation }: any) {
  const { channels, loading, refreshing, refresh, fetchChannels, syncing, syncChannel } = useChannelManager();
  const [syncTarget, setSyncTarget] = useState<{ id: string; name: string } | null>(null);
  const [connectVisible, setConnectVisible] = useState(false);

  useEffect(() => { fetchChannels(); }, []);

  const handleDisconnect = (channelId: string, channelName: string) => {
    Alert.alert(
      `Disconnect ${channelName}?`,
      'This will remove your API credentials. You can reconnect at any time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await walletService.disconnect(channelId);
              await refresh();
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Could not disconnect.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#F26522" />
        </View>
      </SafeAreaView>
    );
  }

  const connected = channels.filter((c) => c.snapshot || c.connectedAt);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.title}>Channels</Text>
            <Text style={s.subtitle}>
              {connected.length > 0
                ? `${connected.length} exchange${connected.length !== 1 ? 's' : ''} connected`
                : 'No exchanges connected'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={s.connectBtn}
          onPress={() => setConnectVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={s.connectBtnText}>+ Connect</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#F26522"
            colors={['#F26522']}
          />
        }
      >
        {connected.length === 0 ? (
          <EmptyState onConnect={() => setConnectVisible(true)} />
        ) : (
          connected.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              isSyncing={syncing.has(channel.id)}
              onSync={() => setSyncTarget({ id: channel.id, name: channel.channel })}
              onDisconnect={() => handleDisconnect(channel.id, channel.channel)}
            />
          ))
        )}
        <View style={s.bottomSpacer} />
      </ScrollView>

      {/* Sync Modal */}
      <SyncModal
        visible={!!syncTarget}
        exchangeName={syncTarget?.name ?? ''}
        onClose={() => setSyncTarget(null)}
        onConfirm={(permissions) => syncChannel(syncTarget!.id, permissions)}
      />

      {/* Connect Modal */}
      <ConnectModal
        visible={connectVisible}
        onClose={() => setConnectVisible(false)}
        onConnected={async () => { await refresh(); }}
      />
    </SafeAreaView>
  );
}

function EmptyState({ onConnect }: { onConnect: () => void }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIconWrap}>
        <Text style={s.emptyIcon}>⚡</Text>
      </View>
      <Text style={s.emptyTitle}>No channels yet</Text>
      <Text style={s.emptySub}>
        Connect Binance, Kraken, Coinbase, or any supported exchange to start tracking your portfolio.
      </Text>
      <TouchableOpacity style={s.emptyBtn} onPress={onConnect} activeOpacity={0.85}>
        <Text style={s.emptyBtnText}>Connect Exchange</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#0a0a0a' },
  centered:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn:       { width: 38, height: 38, borderRadius: 10, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  backText:      { fontSize: 18, color: '#ffffff' },
  title:         { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  subtitle:      { fontSize: 13, color: '#666666', marginTop: 2 },
  connectBtn:    { backgroundColor: '#F26522', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  connectBtnText:{ fontSize: 14, fontWeight: '600', color: '#ffffff' },
  scroll:        { paddingHorizontal: 20, paddingTop: 4 },
  empty:         { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyIcon:     { fontSize: 32 },
  emptyTitle:    { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 10 },
  emptySub:      { fontSize: 14, color: '#555555', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  emptyBtn:      { backgroundColor: '#F26522', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  emptyBtnText:  { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  bottomSpacer:  { height: 40 },
});
