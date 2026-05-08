import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import authService from '../../services/authService';

import { useDashboard } from './hooks/useDashboard';
import PortfolioCard from './components/PortfolioCard';
import NewsBanner from './components/NewsBanner';
import ClocksStrip from './components/ClocksStrip';

export default function DashboardScreen({ navigation }: any) {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const { summary, loading, refreshing, refresh, newsItem, newsOpacity, clocks } = useDashboard();

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
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

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greet}>{greeting()},</Text>
          <Text style={s.username}>{user?.username ?? 'Trader'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn} activeOpacity={0.7}>
          <Text style={s.logoutText}>Sign out</Text>
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
        <PortfolioCard
          cryptoTotal={summary.cryptoTotal}
          fiatTotal={summary.fiatTotal}
          profitNet={summary.profitNet}
        />

        <View style={s.section}>
          <NewsBanner newsItem={newsItem} opacity={newsOpacity} />
        </View>

        {/* Channels preview */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Channels</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Channels')} activeOpacity={0.7}>
              <Text style={s.sectionLink}>Manage →</Text>
            </TouchableOpacity>
          </View>

          {summary.connectedCount === 0 ? (
            <TouchableOpacity
              style={s.emptyChannels}
              onPress={() => navigation.navigate('Channels')}
              activeOpacity={0.8}
            >
              <Text style={s.emptyChannelsIcon}>＋</Text>
              <Text style={s.emptyChannelsText}>Connect your first exchange</Text>
              <Text style={s.emptyChannelsSub}>Binance, Kraken, Coinbase and more</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.channelPills}>
              {summary.recentChannels.map((c) => (
                <View key={c.id} style={s.pill}>
                  <View style={[s.pillDot, { backgroundColor: '#22c55e' }]} />
                  <Text style={s.pillText}>{c.channel}</Text>
                  {c.snapshot?.totalUSD ? (
                    <Text style={s.pillBalance}>
                      ${parseFloat(c.snapshot.totalUSD).toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </Text>
                  ) : null}
                </View>
              ))}
              {summary.connectedCount > 3 && (
                <TouchableOpacity
                  style={s.pillMore}
                  onPress={() => navigation.navigate('Channels')}
                >
                  <Text style={s.pillMoreText}>+{summary.connectedCount - 3} more</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={s.section}>
          <ClocksStrip clocks={clocks} />
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#0a0a0a' },
  centered:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  greet:             { fontSize: 13, color: '#666666', marginBottom: 2 },
  username:          { fontSize: 22, fontWeight: '700', color: '#ffffff' },
  logoutBtn:         { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#2a2a2a' },
  logoutText:        { fontSize: 13, color: '#888888' },
  scroll:            { paddingHorizontal: 20, paddingBottom: 24 },
  section:           { marginTop: 20 },
  sectionHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:      { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  sectionLink:       { fontSize: 13, color: '#F26522' },
  emptyChannels:     { backgroundColor: '#111111', borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#222222' },
  emptyChannelsIcon: { fontSize: 28, color: '#F26522', marginBottom: 10 },
  emptyChannelsText: { fontSize: 15, fontWeight: '600', color: '#ffffff', marginBottom: 6 },
  emptyChannelsSub:  { fontSize: 13, color: '#555555' },
  channelPills:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill:              { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111111', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#1e1e1e', gap: 8 },
  pillDot:           { width: 7, height: 7, borderRadius: 4 },
  pillText:          { fontSize: 13, fontWeight: '500', color: '#ffffff' },
  pillBalance:       { fontSize: 12, color: '#888888' },
  pillMore:          { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#2a2a2a' },
  pillMoreText:      { fontSize: 13, color: '#F26522' },
  bottomSpacer:      { height: 40 },
});
