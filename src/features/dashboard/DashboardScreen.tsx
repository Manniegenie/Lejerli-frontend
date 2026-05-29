import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image,
  RefreshControl, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg';
import { useDashboard } from './hooks/useDashboard';

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const pnl = (n: number) =>
  `${n >= 0 ? '+' : '−'}${usd(Math.abs(n))}`;

const Rule = () => <View style={s.rule} />;

function CryptoIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 4H14C16.2 4 18 5.8 18 8C18 9.2 17.4 10.2 16.5 10.9C17.5 11.6 18.2 12.7 18.2 14C18.2 16.3 16.3 18.2 14 18.2H9V4Z" stroke="#888888" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 11H15" stroke="#888888" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="7" y1="4" x2="7" y2="20" stroke="#888888" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="11" y1="4" x2="11" y2="2" stroke="#888888" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="14" y1="4" x2="14" y2="2" stroke="#888888" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="11" y1="20" x2="11" y2="22" stroke="#888888" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="14" y1="20" x2="14" y2="22" stroke="#888888" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function FiatIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke="#888888" strokeWidth={1.8} />
      <Path d="M14.5 9C14.5 9 13.8 8 12 8C10 8 9 9 9 10.5C9 13.5 15 12 15 15C15 16.5 13.8 17.5 12 17.5C10 17.5 9 16.5 9 16.5" stroke="#888888" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="12" y1="7" x2="12" y2="8" stroke="#888888" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="12" y1="17.5" x2="12" y2="18.5" stroke="#888888" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function PnlIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Polyline points="3,17 9,11 13,15 21,7" stroke="#888888" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="17,7 21,7 21,11" stroke="#888888" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BellIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="#ffffff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21a2 2 0 01-3.46 0"
        stroke="#ffffff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { summary, loading, refreshing, refresh, newsItem, clocks } = useDashboard();

  const total = summary.cryptoTotal + summary.fiatTotal;
  const pnlUp = summary.profitNet >= 0;

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
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#333" colors={['#333']} />
        }
      >
        {/* ── Top bar: clocks + bell ── */}
        <View style={s.topBar}>
          <View style={s.clocksRow}>
            {clocks.slice(0, 3).map((c) => (
              <View key={c.tz} style={s.clockItem}>
                <Text style={s.clockTime} numberOfLines={1} adjustsFontSizeToFit>{c.time}</Text>
                <Text style={s.clockLabel} numberOfLines={1} adjustsFontSizeToFit>{c.label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={s.bellBtn}
            onPress={() => router.push('/(app)/audit')}
            activeOpacity={0.7}
          >
            <BellIcon />
          </TouchableOpacity>
        </View>

        <Rule />

        {/* ── Total portfolio ── */}
        <View style={s.card}>
          <Image
            source={require('../../../assets/PTRN.png')}
            style={s.cardPattern}
            resizeMode="cover"
          />
          <Text style={s.cardLabel}>TOTAL PORTFOLIO</Text>
          <Text style={s.cardValue}>{usd(total)}</Text>
        </View>

        {/* ── Breakdown ── */}
        <View style={s.statsCard}>
          <View style={s.cardRow}>
            <View style={s.statLabelRow}>
              <CryptoIcon />
              <Text style={s.cardStatLabel}>CRYPTO</Text>
            </View>
            <View style={s.statValues}>
              <Text style={s.cardStatValue}>{usd(summary.cryptoTotal)}</Text>
            </View>
          </View>
          <View style={s.statRule} />
          <View style={s.cardRow}>
            <View style={s.statLabelRow}>
              <FiatIcon />
              <Text style={s.cardStatLabel}>FIAT</Text>
            </View>
            <View style={s.statValues}>
              <Text style={s.cardStatValue}>{usd(summary.fiatTotal)}</Text>
            </View>
          </View>
          <View style={s.statRule} />
          <View style={s.cardRow}>
            <View style={s.statLabelRow}>
              <PnlIcon />
              <Text style={s.cardStatLabel}>NET P&L</Text>
            </View>
            <View style={s.statValues}>
              <Text style={[s.cardStatValue, { color: pnlUp ? '#4ade80' : '#f87171' }]}>
                {pnl(summary.profitNet)}
              </Text>
            </View>
          </View>
        </View>

        <Rule />

        {/* ── Market bulletin ── */}
        {newsItem && (
          <>
            <Text style={s.sectionLabel}>MARKET BULLETIN</Text>
            <Text style={s.newsText} numberOfLines={2}>{newsItem.title}</Text>
            <Text style={s.newsSource}>{newsItem.source}</Text>
            <Rule />
          </>
        )}

        {/* ── Channels ── */}
        <View style={s.sectionHead}>
          <Text style={s.sectionLabel}>
            CHANNELS
            <Text style={s.sectionCount}>
              {'  '}{summary.connectedCount} connected
            </Text>
          </Text>
          <TouchableOpacity onPress={() => router.push('/(app)/channels')} activeOpacity={0.6}>
            <Text style={s.manageLink}>Manage →</Text>
          </TouchableOpacity>
        </View>

        {summary.connectedCount === 0 ? (
          <TouchableOpacity style={s.emptyExchange} onPress={() => router.push('/(app)/channels')} activeOpacity={0.7}>
            <Image source={require('../../../assets/Prototyping process-cuate.png')} style={s.emptyImg} />
            <Text style={s.emptyText}>No channels connected</Text>
            <Text style={s.emptySub}>Channels can be crypto or fiat</Text>
            <Text style={s.emptyAction}>Connect channel →</Text>
          </TouchableOpacity>
        ) : (
          summary.recentChannels.map((c, i) => (
            <View key={c.id}>
              <View style={s.exchangeRow}>
                <View style={s.exchangeLeft}>
                  <View style={s.dot} />
                  <Text style={s.exchangeName}>{c.channel}</Text>
                </View>
                <Text style={s.exchangeBalance}>
                  {c.snapshot?.totalUSD
                    ? `$${parseFloat(c.snapshot.totalUSD).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : '—'}
                </Text>
              </View>
              {i < summary.recentChannels.length - 1 && <View style={s.innerRule} />}
            </View>
          ))
        )}

        <Rule />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#0a0a0a' },
  centered:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:         { paddingHorizontal: 24, paddingTop: 20 },

  rule:           { height: 1, backgroundColor: '#1a1a1a', marginVertical: 20 },
  innerRule:      { height: 1, backgroundColor: '#161616', marginLeft: 20 },

  // world clocks
  clocksRow:    { flexDirection: 'row', marginTop: 14 },
  clockItem:    { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 2 },
  clockTime:    { fontSize: 11, color: '#ffffff', fontWeight: '500', width: '100%', textAlign: 'center' },
  clockLabel:   { fontSize: 8, color: '#666666', letterSpacing: 0.5, marginTop: 2, width: '100%', textAlign: 'center' },

  // top bar — clocks + bell on one line
  topBar:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clocksRow:      { flexDirection: 'row', flex: 1, gap: 8 },
  clockItem:      { flex: 1, minWidth: 0 },
  clockTime:      { fontSize: 12, color: '#ffffff', fontWeight: '500' },
  clockLabel:     { fontSize: 8, color: '#F26522', letterSpacing: 0.5, marginTop: 1 },
  bellBtn:        { padding: 4, marginLeft: 12 },

  // portfolio
  card:           { marginBottom: 10, overflow: 'hidden' },
  cardPattern:    { position: 'absolute', top: 0, left: -24, right: -24, bottom: 0, opacity: 0.04 },
  cardLabel:      { fontSize: 10, color: '#999999', letterSpacing: 2.2, marginBottom: 14 },
  cardValue:      { fontSize: 44, fontWeight: '300', color: '#ffffff', letterSpacing: -1.5 },

  // breakdown
  statsCard:      { marginBottom: 4 },
  statRule:       { height: 1, backgroundColor: '#1e1e1e' },
  cardRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  statLabelRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  cardStatLabel:  { fontSize: 10, color: '#999999', letterSpacing: 1.6 },
  statValues:     { flexDirection: 'row', gap: 16, alignItems: 'center' },
  cardStatValue:  { fontSize: 14, fontWeight: '500', color: '#ffffff' },
  cardStatRate:   { fontSize: 14, color: '#666666' },

  // exchanges
  sectionHead:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  sectionLabel:   { fontSize: 11, color: '#999999', letterSpacing: 1.8, marginBottom: 14 },
  sectionCount:   { fontSize: 11, color: '#bbbbbb', letterSpacing: 0.5 },
  manageLink:     { fontSize: 12, color: '#F26522' },

  exchangeRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  exchangeLeft:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  exchangeName:   { fontSize: 14, color: '#ffffff', fontWeight: '400' },
  exchangeBalance:{ fontSize: 14, color: '#cccccc' },

  // no-exchange empty
  emptyExchange: { alignItems: 'center', paddingVertical: 16 },
  emptyImg:      { width: 180, height: 140, resizeMode: 'contain' },
  emptyText:     { fontSize: 13, color: '#cccccc', marginTop: 8, fontWeight: '500' },
  emptySub:      { fontSize: 12, color: '#666666', marginTop: 4 },
  emptyAction:   { fontSize: 12, color: '#F26522', marginTop: 6 },

  // news
  newsText:       { fontSize: 13, color: '#ffffff', lineHeight: 20, marginBottom: 6 },
  newsSource:     { fontSize: 11, color: '#999999', letterSpacing: 0.5 },
});
