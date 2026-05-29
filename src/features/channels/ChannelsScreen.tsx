import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, ScrollView, StyleSheet, Image,
  RefreshControl, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import walletService from '../../services/walletService';
import { useChannelManager } from './hooks/useChannelManager';
import ChannelCard from './components/ChannelCard';
import SyncModal from './modals/SyncModal';
import ConnectModal from './modals/ConnectModal';
import BackButton from '../../components/common/BackButton';

export default function ChannelsScreen() {
  const { channels, loading, refreshing, refresh, fetchChannels, syncing, syncChannel } = useChannelManager();
  const [syncTarget, setSyncTarget] = useState<{ id: string; name: string } | null>(null);
  const [connectVisible, setConnectVisible] = useState(false);

  useEffect(() => { fetchChannels(); }, []);
  useFocusEffect(useCallback(() => { fetchChannels(); }, [fetchChannels]));

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
        <BackButton />
        <Text style={s.title}>Channels</Text>
        <View style={{ width: 40 }} />
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
          <View style={s.empty}>
            <Image source={require('../../../assets/Prototyping process-cuate.png')} style={s.emptyImg} />
            <Text style={s.emptyMsg}>No channels connected</Text>
            <Text style={s.emptySub}>Channels can be crypto or fiat. Connect Binance, Kraken, Coinbase, or a bank account to start tracking your portfolio.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setConnectVisible(true)} activeOpacity={0.7}>
              <Text style={s.emptyBtnText}>Connect Channel</Text>
            </TouchableOpacity>
          </View>
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
        onConfirm={(permissions, importRange) => syncChannel(syncTarget!.id, permissions, importRange)}
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


const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#0a0a0a' },
  centered:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  title:         { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  scroll:        { paddingHorizontal: 20, paddingTop: 4 },
  bottomSpacer:  { height: 40 },

  empty:         { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyImg:      { width: 240, height: 200, resizeMode: 'contain' },
  emptyMsg:      { fontSize: 15, color: '#ffffff', fontWeight: '500', marginTop: 16, textAlign: 'center' },
  emptySub:      { fontSize: 13, color: '#888888', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  emptyBtn:      { marginTop: 24, backgroundColor: '#F26522', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText:  { fontSize: 14, fontWeight: '600', color: '#ffffff' },
});
