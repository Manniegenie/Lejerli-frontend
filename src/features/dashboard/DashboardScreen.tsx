import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Linking,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop } from 'react-native-svg';
import { VictoryArea } from 'victory-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import authService from '../../services/authService';


const plData = [
  { x: 0, y: 20 }, { x: 1, y: 45 }, { x: 2, y: 28 }, { x: 3, y: 80 },
  { x: 4, y: 55 }, { x: 5, y: 65 }, { x: 6, y: 90 }, { x: 7, y: 70 },
  { x: 8, y: 85 }, { x: 9, y: 60 }, { x: 10, y: 95 }, { x: 11, y: 75 },
];


export default function DashboardScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // ── Clocks — driven from backend ─────────────────────────────────────────
  const [clocks, setClocks] = useState<{ label: string; tz: string; time: string }[]>([]);
  useEffect(() => {
    const fetchClocks = async () => {
      try {
        const res  = await fetch('http://localhost:3000/clocks');
        const json = await res.json();
        if (json.success) setClocks(json.data);
      } catch (_) {}
    };
    fetchClocks();
    const id = setInterval(fetchClocks, 1000);
    return () => clearInterval(id);
  }, []);

  // ── News ticker ──────────────────────────────────────────────────────────
  const [newsItem, setNewsItem] = useState<{ title: string; source: string; region: string; image: string | null; link: string | null } | null>(null);
  const newsOpacity = useRef(new Animated.Value(1)).current;

  const fetchNews = async () => {
    try {
      const res = await fetch('http://localhost:3000/news');
      const json = await res.json();
      if (json.success) return json.data;
    } catch (_) {}
    return null;
  };

  const cycleNews = async () => {
    // Fade out
    Animated.timing(newsOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(async () => {
      const item = await fetchNews();
      if (item) setNewsItem(item);
      // Fade in
      Animated.timing(newsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    cycleNews(); // initial load
    const interval = setInterval(cycleNews, 10_000);
    return () => clearInterval(interval);
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(titleY,      { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, []);


  const handleSignOut = async () => {
    await authService.logout();
    dispatch(logout());
  };

  return (
    <View style={styles.container}>

      {/* ── Left pane (703px — matches auth image panel) ── */}
      <View style={styles.leftPane}>

        {/* Logo */}
        <View style={styles.logoRow}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* CTA button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Quick Access</Text>
            <View style={styles.ctaDivider} />
            <Image source={require('../../../assets/cross.png')} style={styles.ctaCrossEnd} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <View style={styles.ctaUnderline} />

        {/* Secondary button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
            <Image source={require('../../../assets/Vector.png')} style={styles.vectorIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Channels button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85} onPress={() => navigation.navigate('Channels')}>
            <Image source={require('../../../assets/material-symbols_window.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Channels</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Reconciliation button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/token_swap.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Reconciliation</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* P&L Engine button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/carbon_circle-filled.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>P&L Engine</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>


        {/* Alerts button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/mingcute_notification-fill.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Alerts</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* AI Insights button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/mingcute_ai-fill.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>AI Insights</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Audit Log button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/icon-park-solid_audit.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Audit Log</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Settings button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/Vector (1).png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Settings</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Bottom — user info + sign out */}
        <View style={styles.bottomSection}>
          <View style={styles.dividerLine} />

          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.username || '—'}</Text>
              <Text style={styles.userEmail}>{user?.email || '—'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main content ── */}
      <View style={styles.mainContent}>
        <ScrollView contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={true}>
          <View style={styles.topBar}>

            <View>
              <Animated.Text style={[styles.pageTitle, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
                Dashboard
              </Animated.Text>
              <Animated.Text style={[styles.pageSubtitle, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
                Manage accounts
              </Animated.Text>
            </View>

            {/* Retro world clocks — absolutely centred in the top bar */}
            <View style={[styles.clocksCenter, { pointerEvents: 'none' }]}>
              {clocks.map(({ label, tz, time }) => (
                <View key={tz} style={styles.clockBox}>
                  <Text style={styles.clockCity}>{label}</Text>
                  <Text style={styles.clockTime}>{time}</Text>
                </View>
              ))}
            </View>

            <View style={styles.searchRow}>
              <Image source={require('../../../assets/Group (2).png')} style={styles.searchIcon} resizeMode="contain" />
              <View style={styles.searchInput}>
                <View style={styles.searchInner}>
                  <Image source={require('../../../assets/tdesign_ai-search.png')} style={styles.searchIcon} resizeMode="contain" />
                  <TextInput style={styles.searchField} placeholder="Search portfolio" placeholderTextColor="#737373" />
                </View>
              </View>
            </View>
          </View>

          {/* Cards row */}
          <View style={styles.cardsRow}>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderLabel} numberOfLines={1}>Total Liquidity</Text>
              </View>
            </View>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderLabel} numberOfLines={1}>Crypto Liquidity</Text>
              </View>
            </View>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderLabel} numberOfLines={1}>Fiat Liquidity</Text>
              </View>
            </View>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderLabel} numberOfLines={1}>Today's P&L</Text>
              </View>
            </View>
          </View>

          {/* News ticker */}
          <TouchableOpacity
            style={styles.newsTicker}
            activeOpacity={0.75}
            onPress={() => newsItem?.link && Linking.openURL(newsItem.link)}
          >
            <Animated.View style={[styles.newsTickerInner, { opacity: newsOpacity }]}>
              {newsItem ? (
                <>
                  <View style={styles.newsSourceBadge}>
                    <Text style={styles.newsSourceRegion}>{newsItem.region}</Text>
                    <Text style={styles.newsSourceName}>{newsItem.source}</Text>
                  </View>
                  <Text style={styles.newsHeadline} numberOfLines={1}>{newsItem.title}</Text>
                  {newsItem.image ? (
                    <Image
                      source={{ uri: newsItem.image }}
                      style={styles.newsPreviewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.newsPreviewPlaceholder}>
                      <Text style={styles.newsPreviewPlaceholderText}>
                        {newsItem.source.charAt(0)}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.newsHeadline}>Loading news feed…</Text>
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* Bottom cards row */}
          <View style={styles.bottomCardsRow}>
            <View style={styles.bottomCard}>
              <View style={styles.cardTopBar}>
                <View style={styles.cardTopBarLeft}>
                  <Text style={styles.cardTopBarTitle}>P&L Performance</Text>
                  <Text style={styles.cardTopBarSubtitle}>Net profitability trend across all assets</Text>
                </View>
                <View style={styles.cardTopBarRight}>
                  <View style={styles.cardTopBarTag}>
                    <Text style={styles.cardTopBarTagText}>24H</Text>
                  </View>
                  <View style={styles.cardTopBarTagPlain}>
                    <Text style={styles.cardTopBarTagText}>7D</Text>
                  </View>
                  <View style={styles.cardTopBarTagPlain}>
                    <Text style={styles.cardTopBarTagText}>30D</Text>
                  </View>
                </View>
              </View>

              {/* P&L Performance Chart */}
              <View style={styles.plChartWrapper}>
                <Svg width="100%" height={380}>
                  <Defs>
                    <LinearGradient id="plGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#F26522" stopOpacity="0.2" />
                      <Stop offset="100%" stopColor="#F26522" stopOpacity="0.1" />
                    </LinearGradient>
                  </Defs>
                  <VictoryArea
                    standalone={false}
                    width={632}
                    height={380}
                    data={plData}
                    interpolation="natural"
                    style={{
                      data: {
                        fill: 'url(#plGradient)',
                        stroke: '#F26522',
                        strokeWidth: 2,
                      },
                    }}
                    padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
                  />
                </Svg>

                {/* Timestamps */}
                <View style={styles.chartTimestamps}>
                  {['00:00','04:00','08:00','12:00','16:00','20:00','24:00'].map(t => (
                    <Text key={t} style={styles.chartTimestamp}>{t}</Text>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.bottomCard}>
              {/* Reconciliation Health header */}
              <View style={styles.cardTopBar}>
                <View style={[styles.cardTopBarLeft, { width: 'auto' }]}>
                  <Text style={[styles.cardTopBarTitle, { width: 'auto' }]} numberOfLines={1}>Reconciliation Health</Text>
                  <Text style={[styles.cardTopBarSubtitle, { width: 'auto' }]}>Live match rate across channels</Text>
                </View>
              </View>

              {/* Reconciliation bars */}
              <View style={styles.reconList}>
                {[
                  { label: 'Crypto Matching',  pct: 0.95 },
                  { label: 'Fiat Matching',    pct: 0.52 },
                  { label: 'Margin Sync',      pct: 0.28 },
                  { label: 'Settlement',       pct: 0.74 },
                ].map(({ label, pct }) => {
                  const barColor = pct >= 0.8 ? '#4EDEA3' : pct >= 0.45 ? '#FACC15' : '#EB4141';
                  return (
                    <View key={label} style={styles.reconItem}>
                      <View style={styles.reconRow}>
                        <Text style={styles.reconLabel}>{label}</Text>
                        <Text style={[styles.reconPct, { color: barColor }]}>
                          {Math.round(pct * 100)}%
                        </Text>
                      </View>
                      <View style={styles.reconTrack}>
                        <View style={[styles.reconFill, { width: `${pct * 100}%` as any, backgroundColor: barColor }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Bottom wide layout */}
          <View style={styles.bottomWideLayout}>
            <View style={styles.bottomWideTopBar}>
              <Text style={styles.recentTransTitle}>Recent Transactions</Text>
              <TouchableOpacity style={styles.downloadButton} activeOpacity={0.85}>
                <Image source={require('../../../assets/Group (3).png')} style={styles.downloadIcon} resizeMode="contain" />
                <Text style={styles.downloadButtonText}>Download</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.transactionsTable}>
              <View style={styles.tableRowBlock}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText} numberOfLines={1}>Time</Text>
                </View>
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>14:22:10</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>13:47:33</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>12:15:05</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>11:58:44</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>10:32:19</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>09:04:52</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>08:41:27</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>07:29:11</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>06:53:38</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>05:17:04</Text></View>
              </View>
              <View style={styles.tableRowBlock}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText} numberOfLines={1}>Assets</Text>
                </View>
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>BTC / USDT</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>ETH / USDT</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>SOL / USDT</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>BNB / USDT</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>XRP / USDT</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>ADA / USDT</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>MATIC / USDT</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>AVAX / USDT</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>LINK / USDT</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>DOT / USDT</Text></View>
              </View>
              <View style={styles.tableRowBlock}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText} numberOfLines={1}>Amount</Text>
                </View>
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>$12,450.00</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>$8,200.50</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>$3,750.00</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>$5,100.75</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>$950.25</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>$2,300.00</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>$1,875.50</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>$6,620.00</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>$430.80</Text></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><Text style={styles.tableCellText} numberOfLines={1}>$780.00</Text></View>
              </View>
              <View style={styles.tableRowBlock}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText} numberOfLines={1}>Status</Text>
                </View>
                <View style={styles.tableCell}><View style={styles.statusBadge}><Text style={styles.statusBadgeText} numberOfLines={1}>INFLOW</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.outflowBadge}><Text style={styles.outflowBadgeText} numberOfLines={1}>OUTFLOW</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.statusBadge}><Text style={styles.statusBadgeText} numberOfLines={1}>INFLOW</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.outflowBadge}><Text style={styles.outflowBadgeText} numberOfLines={1}>OUTFLOW</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.statusBadge}><Text style={styles.statusBadgeText} numberOfLines={1}>INFLOW</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.outflowBadge}><Text style={styles.outflowBadgeText} numberOfLines={1}>OUTFLOW</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.statusBadge}><Text style={styles.statusBadgeText} numberOfLines={1}>INFLOW</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.outflowBadge}><Text style={styles.outflowBadgeText} numberOfLines={1}>OUTFLOW</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.statusBadge}><Text style={styles.statusBadgeText} numberOfLines={1}>INFLOW</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.outflowBadge}><Text style={styles.outflowBadgeText} numberOfLines={1}>OUTFLOW</Text></View></View>
              </View>
              <View style={styles.tableRowBlock}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText} numberOfLines={1}>Type</Text>
                </View>
                <View style={styles.tableCell}><View style={styles.typeRow}><View style={styles.typeDotGreen} /><Text style={styles.typeText} numberOfLines={1}>Matched</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.typeRow}><View style={styles.typeDotOrange} /><Text style={styles.typeText} numberOfLines={1}>Pending Fiat</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.typeRow}><View style={styles.typeDotOrange} /><Text style={styles.typeText} numberOfLines={1}>Pending Crypto</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.typeRow}><View style={styles.typeDotGreen} /><Text style={styles.typeText} numberOfLines={1}>Matched</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.typeRow}><View style={styles.typeDotOrange} /><Text style={styles.typeText} numberOfLines={1}>Pending Fiat</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.typeRow}><View style={styles.typeDotGreen} /><Text style={styles.typeText} numberOfLines={1}>Matched</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.typeRow}><View style={styles.typeDotOrange} /><Text style={styles.typeText} numberOfLines={1}>Pending Crypto</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.typeRow}><View style={styles.typeDotGreen} /><Text style={styles.typeText} numberOfLines={1}>Matched</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.typeRow}><View style={styles.typeDotOrange} /><Text style={styles.typeText} numberOfLines={1}>Pending Fiat</Text></View></View>
                <View style={styles.tableDivider} />
                <View style={styles.tableCell}><View style={styles.typeRow}><View style={styles.typeDotGreen} /><Text style={styles.typeText} numberOfLines={1}>Matched</Text></View></View>
              </View>
            </View>
          </View>

        </ScrollView>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
  },

  // ── Left pane ──────────────────────────────────────────
  leftPane: {
    width: 337,
    backgroundColor: '#0d0d0d',
    borderRightWidth: 1,
    borderRightColor: '#2a2a2a',
    flexDirection: 'column',
  },

  logoRow: {
    paddingHorizontal: 25,
    paddingTop: 48,
    paddingBottom: 40,
  },
  logo: {
    width: 164,
    height: 28.72,
  },

  ctaRow: {
    paddingHorizontal: 25,
    marginBottom: 16,
  },
  ctaUnderline: {
    width: 287,
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    marginLeft: 25,
    marginBottom: 40,
  },
  ctaButton: {
    width: 287,
    height: 80,
    backgroundColor: '#F26522',
    borderRadius: 6,
    padding: 12,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaDivider: {
    position: 'absolute',
    left: 216,
    top: 0,
    width: 1,
    height: 80,
    backgroundColor: '#ffffff',
    opacity: 1,
  },
  ctaCrossEnd: {
    position: 'absolute',
    right: 24,
    top: 28,
    width: 24,
    height: 24,
  },
  ctaSecondary: {
    width: 287,
    height: 68,
    backgroundColor: '#F26522',
    borderRadius: 6,
    padding: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  ctaChannels: {
    width: 287,
    height: 68,
    backgroundColor: '#171717',
    borderRadius: 6,
    padding: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  vectorIcon: {
    width: 24,
    height: 24,
  },
  windowIcon: {
    width: 24,
    height: 24,
  },
  chevronIcon: {
    width: 24,
    height: 24,
    marginLeft: 'auto',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'GeneralSans',
    width: 191,
    height: 24,
    gap: 12,
  },
  nav: {
    flex: 1,
    paddingHorizontal: 25,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: '#1a1a1a',
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555555',
    flex: 1,
    fontFamily: 'GeneralSans',
  },
  navLabelActive: {
    color: '#ffffff',
  },
  navIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F26522',
  },

  // ── Bottom section ─────────────────────────────────────
  bottomSection: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginBottom: 24,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F26522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'GeneralSans',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'GeneralSans',
  },
  userEmail: {
    fontSize: 12,
    color: '#555555',
    marginTop: 2,
    fontFamily: 'GeneralSans',
  },
  signOutButton: {
    height: 44,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888888',
    fontFamily: 'GeneralSans',
  },

  // ── Main content ───────────────────────────────────────
  mainContent: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  contentInner: {
    paddingHorizontal: 48,
    paddingTop: 60,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  searchInput: {
    width: 619,
    height: 68,
    backgroundColor: '#171717',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#383838',
    position: 'relative',
  },
  searchInner: {
    width: 324,
    height: 27,
    position: 'absolute',
    top: 19,
    left: 21,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  searchField: {
    width: 146,
    height: 27,
    color: '#ffffff',
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: 0,
    outlineStyle: 'none' as any,
    outlineWidth: 0,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 32,
    fontFamily: 'GeneralSans',
    letterSpacing: 0,
    marginBottom: 8,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 64,
  },
  card: {
    flex: 1,
    height: 113,
    backgroundColor: '#171717',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#383838',
    paddingTop: 16,
    paddingRight: 24,
    paddingBottom: 16,
    paddingLeft: 24,
    gap: 12,
  },
  newsTicker: {
    height: 56,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#282828',
    marginTop: 24,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  newsTickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  newsSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    flexShrink: 0,
  },
  newsSourceRegion: {
    fontFamily: 'GeneralSans',
    fontSize: 9,
    fontWeight: '600',
    color: '#F26522',
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  newsSourceName: {
    fontFamily: 'GeneralSans',
    fontSize: 10,
    fontWeight: '500',
    color: '#555555',
  },
  newsHeadline: {
    flex: 1,
    fontFamily: 'GeneralSans',
    fontSize: 13,
    fontWeight: '400',
    color: '#D0D5DD',
    letterSpacing: 0.2,
  },
  newsPreviewImage: {
    width: 72,
    height: 40,
    borderRadius: 6,
    flexShrink: 0,
  },
  newsPreviewPlaceholder: {
    width: 72,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  newsPreviewPlaceholderText: {
    fontFamily: 'GeneralSans',
    fontSize: 16,
    fontWeight: '700',
    color: '#F26522',
  },
  bottomCardsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 44,
    alignItems: 'flex-start',
  },
  recentTransTitle: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
    color: '#ffffff',
  },
  tableCellText: {
    height: 20,
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: 0,
    color: '#ffffff',
  },
  statusBadgeText: {
    height: 20,
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    color: '#4EDEA3',
    textAlignVertical: 'center',
  },
  outflowBadgeText: {
    height: 20,
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    color: '#EB4141',
    textAlignVertical: 'center',
  },
  outflowBadge: {
    height: 21,
    borderRadius: 2,
    paddingTop: 0.5,
    paddingRight: 8,
    paddingBottom: 0.5,
    paddingLeft: 8,
    backgroundColor: '#EB41411A',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  statusBadge: {
    height: 21,
    borderRadius: 2,
    paddingTop: 0.5,
    paddingRight: 8,
    paddingBottom: 0.5,
    paddingLeft: 8,
    backgroundColor: '#4EDEA31A',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  typeRow: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
  },
  typeDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 12,
    backgroundColor: '#4EDEA3',
  },
  typeDotOrange: {
    width: 6,
    height: 6,
    borderRadius: 12,
    backgroundColor: '#FB923C',
  },
  typeText: {
    height: 16,
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 14,
    color: '#ffffff',
  },
  tableDivider: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#383838',
  },
  tableCell: {
    height: 74,
    justifyContent: 'center',
    paddingLeft: 18,
    paddingRight: 10,
    paddingVertical: 10,
  },
  tableHeaderText: {
    height: 22,
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 18,
    letterSpacing: 0,
    color: '#D0D5DD',
  },
  tableHeader: {
    height: 68,
    backgroundColor: '#171717',
    borderTopLeftRadius: 8,
    paddingLeft: 18,
    paddingRight: 10,
    paddingVertical: 10,
    gap: 10,
    justifyContent: 'center',
  },
  tableRowBlock: {
    flex: 1,
    height: 761,
    gap: 8,
    flexDirection: 'column',
  },
  transactionsTable: {
    height: 761,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#383838',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  downloadIcon: {
    width: 20,
    height: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    width: 190,
    height: 44,
    backgroundColor: '#F26522',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FB923C',
    padding: 10,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'GeneralSans',
  },
  bottomWideTopBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 996,
  },
  bottomWideLayout: {
    height: 841,
    gap: 36,
    marginTop: 44,
  },
  cardTopBarLeft: {
    width: 217,
    height: 44,
    flexDirection: 'column',
  },
  cardTopBarTitle: {
    width: 155,
    height: 28,
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0,
    color: '#DAE2FD',
    textAlignVertical: 'center',
  },
  cardTopBarTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'GeneralSans',
    textAlign: 'center',
  },
  cardHeaderLabel: {
    height: 20,
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: 0,
    color: '#505050',
  },
  cardHeaderRow: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTopBarTag: {
    height: 28,
    borderRadius: 12,
    paddingTop: 4,
    paddingRight: 14,
    paddingBottom: 4,
    paddingLeft: 14,
    backgroundColor: '#F26522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopBarTagPlain: {
    height: 28,
    borderRadius: 12,
    paddingTop: 4,
    paddingRight: 14,
    paddingBottom: 4,
    paddingLeft: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopBarRight: {
    height: 36,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTopBarSubtitle: {
    width: 217,
    height: 16,
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    color: '#888888',
    textAlignVertical: 'center',
  },
  cardTopBar: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomCard: {
    flex: 1,
    height: 680,
    backgroundColor: '#171717',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#383838',
    padding: 24,
    gap: 32,
  },
  clocksCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingRight: 120,
  },
  clockBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 2,
  },
  clockCity: {
    fontFamily: 'GeneralSans',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  clockTime: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '700',
    color: '#F26522',
    letterSpacing: 2,
  },
  plChartWrapper: {
    marginHorizontal: -24,
    marginBottom: -24,
    height: 380,
    marginTop: 'auto',
  },
  chartTimestamps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: 8,
  },
  chartTimestamp: {
    fontFamily: 'GeneralSans',
    fontSize: 11,
    fontWeight: '400',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  reconList: {
    width: '100%',
    gap: 40,
  },
  reconItem: {
    gap: 8,
  },
  reconRow: {
    height: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reconLabel: {
    fontFamily: 'GeneralSans',
    fontSize: 13,
    fontWeight: '500',
    color: '#ffffff',
  },
  reconPct: {
    fontFamily: 'GeneralSans',
    fontSize: 13,
    fontWeight: '600',
  },
  reconTrack: {
    width: '100%',
    height: 6,
    borderRadius: 12,
    backgroundColor: '#EB41411A',
    overflow: 'hidden',
  },
  reconFill: {
    height: 6,
    borderRadius: 12,
  },
  wideCardText: {
    color: '#EB4141',
    fontSize: 14,
    fontFamily: 'GeneralSans',
    fontWeight: '400',
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#888888',
    fontFamily: 'GeneralSans',
  },
});
