import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import authService from '../../services/authService';
import channelService, { ChannelRow } from '../../services/channelService';
import treeService, { Tree } from '../../services/treeService';
import { useClocks } from '../../hooks/useClocks';

type RateMode = 'Manual' | 'Markdown';
type StatusMode = 'Active' | 'Inactive';

interface CryptoSettings {
  otcRate: string;
  rateMode: RateMode;
  marketRefSource: string;
  status: StatusMode;
}

const DEFAULT_CRYPTO: CryptoSettings = {
  otcRate: '',
  rateMode: 'Manual',
  marketRefSource: '',
  status: 'Active',
};

const fmtPrice = (p: number): string => {
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (p >= 1) return '$' + p.toFixed(4);
  return '$' + p.toFixed(8);
};

export default function CryptoTreeScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const clocks = useClocks();

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, []);

  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [trees, setTrees] = useState<Tree[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [ch, tr] = await Promise.all([
        channelService.getChannels(),
        treeService.getTrees(),
      ]);
      setChannels(ch.filter(r => r.type === 'Crypto' || r.type === 'DEX'));
      setTrees(tr);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchData(); }, []);

  // Expand / collapse
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const chevronAnims = useRef<Record<string, Animated.Value>>({}).current;

  const getChevronAnim = (id: string) => {
    if (!chevronAnims[id]) chevronAnims[id] = new Animated.Value(0);
    return chevronAnims[id];
  };

  const toggleExpand = (id: string) => {
    const isOpen = expandedIds.has(id);
    Animated.timing(getChevronAnim(id), {
      toValue: isOpen ? 0 : 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
    setExpandedIds(prev => {
      const next = new Set(prev);
      isOpen ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Local settings per channel
  const [cryptoSettings, setCryptoSettings] = useState<Record<string, CryptoSettings>>({});

  const getCS = (id: string): CryptoSettings => cryptoSettings[id] ?? { ...DEFAULT_CRYPTO };

  const updateField = (id: string, field: keyof CryptoSettings, value: string) => {
    setCryptoSettings(prev => ({
      ...prev,
      [id]: { ...(prev[id] ?? DEFAULT_CRYPTO), [field]: value },
    }));
  };

  const handleSignOut = async () => {
    await authService.logout();
    dispatch(logout());
  };

  return (
    <View style={styles.container}>

      {/* ── Left pane ── */}
      <View style={styles.leftPane}>
        <View style={styles.logoRow}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Quick Access</Text>
            <View style={styles.ctaDivider} />
            <Image source={require('../../../assets/cross.png')} style={styles.ctaCrossEnd} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <View style={styles.ctaUnderline} />

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85} onPress={() => navigation.navigate('Dashboard')}>
            <Image source={require('../../../assets/Vector.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85} onPress={() => navigation.navigate('Channels')}>
            <Image source={require('../../../assets/material-symbols_window.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Channels</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85} onPress={() => navigation.navigate('TreeExpansion')}>
            <Image source={require('../../../assets/carbon_circle-filled.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Trees</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={[styles.ctaRow, { paddingLeft: 45 }]}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85} onPress={() => navigation.navigate('FiatTree')}>
            <Text style={styles.ctaText}>Fiat Trees</Text>
          </TouchableOpacity>
        </View>

        {/* Crypto Trees — active */}
        <View style={[styles.ctaRow, { paddingLeft: 45 }]}>
          <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Crypto Trees</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/token_swap.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Reconciliation</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/carbon_circle-filled.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>P&L Engine</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/mingcute_notification-fill.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Alerts</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/mingcute_ai-fill.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>AI Insights</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/icon-park-solid_audit.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Audit Log</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85}>
            <Image source={require('../../../assets/Vector (1).png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Settings</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.bottomSection}>
          <View style={styles.dividerLine} />
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</Text>
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.contentInner}>

            {/* Header */}
            <View style={styles.topBar}>
              <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
                <Text style={styles.pageTitle}>Crypto Channels</Text>
                <Text style={styles.pageSubtitle}>
                  Configure OTC rate, mode, and market reference for each crypto account
                </Text>
              </Animated.View>

              <View style={styles.clocksCenter}>
                {clocks.map(({ label, time }) => (
                  <View key={label} style={styles.clockBox}>
                    <Text style={styles.clockCity}>{label}</Text>
                    <Text style={styles.clockTime}>{time}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Count badge */}
            <View style={styles.countRow}>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {channels.length} crypto account{channels.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Channel list */}
            <View style={styles.channelList}>
              {channels.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No crypto channels connected.</Text>
                  <Text style={styles.emptyStateSub}>
                    Add a crypto channel from the Channels page to get started.
                  </Text>
                </View>
              ) : (
                channels.map((channel, idx) => {
                  const isExpanded = expandedIds.has(channel.id);
                  const chevronAnim = getChevronAnim(channel.id);
                  const chevronRotate = chevronAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  });
                  const cs = getCS(channel.id);
                  const channelTrees = trees.filter(t => t.channelId === channel.id);

                  return (
                    <View
                      key={channel.id}
                      style={[
                        styles.channelCard,
                        idx < channels.length - 1 && { marginBottom: 10 },
                        isExpanded && styles.channelCardExpanded,
                      ]}
                    >
                      {/* Collapsed row */}
                      <TouchableOpacity
                        style={styles.channelRow}
                        activeOpacity={0.8}
                        onPress={() => toggleExpand(channel.id)}
                      >
                        <View style={styles.rowLeft}>
                          <View style={styles.cryptoIconWrap}>
                            <Text style={styles.cryptoIconText}>
                              {channel.channel?.charAt(0) ?? 'C'}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.channelName}>{channel.channel}</Text>
                            <Text style={styles.channelSub}>{channel.assets}</Text>
                          </View>
                        </View>

                        <View style={styles.rowRight}>
                          <Text style={styles.balanceText}>{channel.balance}</Text>
                          <View
                            style={
                              channel.status === 'Active'
                                ? styles.statusGreen
                                : styles.statusRed
                            }
                          >
                            <Text
                              style={
                                channel.status === 'Active'
                                  ? styles.statusTextGreen
                                  : styles.statusTextRed
                              }
                            >
                              {channel.status}
                            </Text>
                          </View>
                          <Text style={styles.treeCountHint}>
                            {channelTrees.length} tree{channelTrees.length !== 1 ? 's' : ''}
                          </Text>
                          <Animated.Image
                            source={require('../../../assets/chevron-down.png')}
                            style={[
                              styles.expandChevron,
                              { transform: [{ rotate: chevronRotate }] },
                            ]}
                            resizeMode="contain"
                          />
                        </View>
                      </TouchableOpacity>

                      {/* Expanded settings */}
                      {isExpanded && (
                        <View style={styles.expandedPanel}>
                          <View style={styles.expandedDivider} />

                          {/* ── Channel settings ── */}
                          <Text style={styles.sectionLabel}>Channel Settings</Text>
                          <View style={styles.settingsGrid}>

                            {/* Asset — read-only from channel data */}
                            <View style={styles.settingField}>
                              <Text style={styles.fieldLabel}>Asset</Text>
                              <View style={styles.readonlyField}>
                                <Text style={styles.readonlyText}>{channel.assets || '—'}</Text>
                              </View>
                            </View>

                            {/* Connected wallet or exchange — read-only */}
                            <View style={styles.settingField}>
                              <Text style={styles.fieldLabel}>Connected Exchange / Wallet</Text>
                              <View style={styles.readonlyField}>
                                <Text style={styles.readonlyText}>{channel.channel || '—'}</Text>
                              </View>
                            </View>

                            {/* OTC rate */}
                            <View style={styles.settingField}>
                              <Text style={styles.fieldLabel}>OTC Rate</Text>
                              <TextInput
                                style={styles.fieldInput}
                                value={cs.otcRate}
                                onChangeText={v => updateField(channel.id, 'otcRate', v)}
                                placeholder="e.g. 0.9850"
                                placeholderTextColor="#555"
                                keyboardType="numeric"
                              />
                            </View>

                            {/* Rate mode */}
                            <View style={styles.settingField}>
                              <Text style={styles.fieldLabel}>Rate Mode</Text>
                              <View style={styles.toggleRow}>
                                {(['Manual', 'Markdown'] as RateMode[]).map(mode => (
                                  <TouchableOpacity
                                    key={mode}
                                    style={[
                                      styles.toggleBtn,
                                      cs.rateMode === mode && styles.toggleBtnActive,
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => updateField(channel.id, 'rateMode', mode)}
                                  >
                                    <Text
                                      style={[
                                        styles.toggleBtnText,
                                        cs.rateMode === mode && styles.toggleBtnTextActive,
                                      ]}
                                    >
                                      {mode}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>

                            {/* Market reference source */}
                            <View style={styles.settingField}>
                              <Text style={styles.fieldLabel}>Market Reference Source</Text>
                              <TextInput
                                style={styles.fieldInput}
                                value={cs.marketRefSource}
                                onChangeText={v => updateField(channel.id, 'marketRefSource', v)}
                                placeholder="e.g. Binance, CoinGecko, Bloomberg"
                                placeholderTextColor="#555"
                              />
                            </View>

                            {/* Status */}
                            <View style={styles.settingField}>
                              <Text style={styles.fieldLabel}>Status</Text>
                              <View style={styles.toggleRow}>
                                {(['Active', 'Inactive'] as StatusMode[]).map(s => (
                                  <TouchableOpacity
                                    key={s}
                                    style={[
                                      styles.toggleBtn,
                                      cs.status === s && (s === 'Active' ? styles.toggleBtnGreen : styles.toggleBtnRed),
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => updateField(channel.id, 'status', s)}
                                  >
                                    <Text
                                      style={[
                                        styles.toggleBtnText,
                                        cs.status === s && s === 'Active' && styles.toggleBtnTextGreen,
                                        cs.status === s && s === 'Inactive' && styles.toggleBtnTextRed,
                                      ]}
                                    >
                                      {s}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>

                          </View>

                          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
                            <Text style={styles.saveBtnText}>Save Settings</Text>
                          </TouchableOpacity>

                          {/* ── Trees for this channel ── */}
                          {channelTrees.length > 0 && (
                            <View style={styles.treesSection}>
                              <Text style={[styles.sectionLabel, { marginTop: 28 }]}>
                                Trees ({channelTrees.length})
                              </Text>
                              {channelTrees.map((tree, ti) => (
                                <View
                                  key={tree._id}
                                  style={[
                                    styles.treeCard,
                                    ti < channelTrees.length - 1 && { marginBottom: 12 },
                                  ]}
                                >
                                  {/* Tree header */}
                                  <View style={styles.treeCardHeader}>
                                    <Text style={styles.treeCardTitle}>
                                      {tree.name ?? `Tree ${ti + 1}`}
                                    </Text>
                                    <Text style={styles.treeCardDate}>
                                      {new Date(tree.createdAt).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </Text>
                                    <View style={styles.treeStat}>
                                      <Text style={styles.treeStatLabel}>EPPT</Text>
                                      <Text style={styles.treeStatValue}>
                                        {fmtPrice(tree.totalProfitGross)}
                                      </Text>
                                    </View>
                                    <View style={styles.treeStat}>
                                      <Text style={styles.treeStatLabel}>Profit-Net</Text>
                                      <Text
                                        style={[
                                          styles.treeStatValue,
                                          (tree.profitNet || 0) >= 0
                                            ? { color: '#22c55e' }
                                            : { color: '#ef4444' },
                                        ]}
                                      >
                                        {fmtPrice(tree.profitNet || 0)}
                                      </Text>
                                    </View>
                                  </View>

                                  {/* Asset rows */}
                                  <View style={styles.assetTable}>
                                    <View style={styles.assetHead}>
                                      <Text style={[styles.assetHeadCell, { flex: 2 }]}>Asset</Text>
                                      <Text style={[styles.assetHeadCell, { flex: 1, textAlign: 'right' }]}>Margin</Text>
                                      <Text style={[styles.assetHeadCell, { flex: 2, textAlign: 'right' }]}>Entry Price</Text>
                                      <Text style={[styles.assetHeadCell, { flex: 2, textAlign: 'right' }]}>EPPT</Text>
                                    </View>
                                    {tree.assets.map((a, ai) => (
                                      <View
                                        key={a.asset}
                                        style={[
                                          styles.assetRow,
                                          ai < tree.assets.length - 1 && styles.assetRowBorder,
                                        ]}
                                      >
                                        <Text style={[styles.assetCellText, { flex: 2 }]}>{a.asset}</Text>
                                        <Text style={[styles.assetCellText, { flex: 1, textAlign: 'right' }]}>
                                          {a.margin.toFixed(1)}%
                                        </Text>
                                        <Text style={[styles.assetCellText, { flex: 2, textAlign: 'right', color: '#F26522' }]}>
                                          {fmtPrice(a.entryPrice)}
                                        </Text>
                                        <Text style={[styles.assetCellText, { flex: 2, textAlign: 'right', color: '#22c55e' }]}>
                                          {fmtPrice(a.profitGross)}
                                        </Text>
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>

          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#0a0a0a' },

  // ── Left pane ──
  leftPane: {
    width: 337,
    backgroundColor: '#0d0d0d',
    borderRightWidth: 1,
    borderRightColor: '#2a2a2a',
    flexDirection: 'column',
  },
  logoRow: { paddingHorizontal: 25, paddingTop: 48, paddingBottom: 40 },
  logo: { width: 164, height: 28.72 },
  ctaRow: { paddingHorizontal: 25, marginBottom: 16 },
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaDivider: { position: 'absolute', left: 216, top: 0, width: 1, height: 80, backgroundColor: '#ffffff' },
  ctaCrossEnd: { position: 'absolute', right: 24, top: 28, width: 24, height: 24 },
  ctaSecondary: {
    width: 242,
    height: 52,
    backgroundColor: '#F26522',
    borderRadius: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },
  windowIcon: { width: 24, height: 24 },
  chevronIcon: { width: 24, height: 24, marginLeft: 'auto' },
  ctaText: { color: '#ffffff', fontSize: 18, fontWeight: '700', fontFamily: 'GeneralSans' },
  bottomSection: { paddingHorizontal: 25, paddingBottom: 32, gap: 16 },
  dividerLine: { height: 1, backgroundColor: '#2a2a2a', marginBottom: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F26522', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { color: '#ffffff', fontSize: 14, fontWeight: '600', fontFamily: 'GeneralSans' },
  userEmail: { color: '#555555', fontSize: 12, fontFamily: 'GeneralSans' },
  signOutButton: { height: 44, borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  signOutText: { fontSize: 14, fontWeight: '500', color: '#888888', fontFamily: 'GeneralSans' },

  // ── Main ──
  mainContent: { flex: 1, backgroundColor: '#0a0a0a' },
  contentInner: { paddingHorizontal: 48, paddingTop: 60, paddingBottom: 80 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  pageTitle: { fontSize: 30, fontWeight: '700', color: '#ffffff', lineHeight: 32, fontFamily: 'GeneralSans', marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: '#888888', fontFamily: 'GeneralSans' },

  clocksCenter: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 12, paddingRight: 120,
  },
  clockBox: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0f0f0f', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6, gap: 2,
  },
  clockCity: { fontFamily: 'GeneralSans', fontSize: 9, fontWeight: '600', letterSpacing: 1.5, color: '#ffffff', textTransform: 'uppercase' },
  clockTime: { fontFamily: 'monospace', fontSize: 15, fontWeight: '700', color: '#F26522', letterSpacing: 2 },

  countRow: { marginTop: 32, marginBottom: 20 },
  countBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(242,101,34,0.12)',
    borderWidth: 1,
    borderColor: '#F26522',
    borderRadius: 6,
  },
  countBadgeText: { fontSize: 12, fontWeight: '600', color: '#F26522', fontFamily: 'GeneralSans' },

  channelList: { gap: 0 },
  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyStateText: { fontSize: 16, fontWeight: '600', color: '#ffffff', fontFamily: 'GeneralSans', marginBottom: 8 },
  emptyStateSub: { fontSize: 14, color: '#555', fontFamily: 'GeneralSans', textAlign: 'center' },

  // Channel card
  channelCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  channelCardExpanded: { borderColor: '#F26522' },

  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },

  cryptoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(242,101,34,0.15)',
    borderWidth: 1,
    borderColor: '#F26522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cryptoIconText: { fontSize: 16, fontWeight: '700', color: '#F26522', fontFamily: 'GeneralSans' },

  channelName: { fontSize: 15, fontWeight: '600', color: '#ffffff', fontFamily: 'GeneralSans', marginBottom: 2 },
  channelSub: { fontSize: 12, color: '#555', fontFamily: 'GeneralSans' },
  balanceText: { fontSize: 14, color: '#888', fontFamily: 'GeneralSans' },
  treeCountHint: { fontSize: 12, color: '#555', fontFamily: 'GeneralSans' },

  statusGreen: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: 'rgba(34,197,94,0.12)', borderWidth: 1, borderColor: '#22c55e' },
  statusRed: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: '#ef4444' },
  statusTextGreen: { fontSize: 11, fontWeight: '600', color: '#22c55e', fontFamily: 'GeneralSans' },
  statusTextRed: { fontSize: 11, fontWeight: '600', color: '#ef4444', fontFamily: 'GeneralSans' },

  expandChevron: { width: 20, height: 20, tintColor: '#888' },

  // Expanded panel
  expandedPanel: { paddingHorizontal: 20, paddingBottom: 24 },
  expandedDivider: { height: 1, backgroundColor: '#2a2a2a', marginBottom: 24 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#555', fontFamily: 'GeneralSans',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 20,
  },

  settingsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 24 },
  settingField: { width: '46%', minWidth: 220 },
  fieldLabel: {
    fontSize: 11, color: '#888', fontFamily: 'GeneralSans', fontWeight: '600',
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  fieldInput: {
    height: 46,
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#383838',
    borderRadius: 8,
    paddingHorizontal: 14,
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'GeneralSans',
    outlineStyle: 'none' as any,
    outlineWidth: 0,
  },
  readonlyField: {
    height: 46,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  readonlyText: { fontSize: 14, color: '#888', fontFamily: 'GeneralSans' },

  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#383838',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d0d0d',
  },
  toggleBtnActive: { borderColor: '#F26522', backgroundColor: 'rgba(242,101,34,0.12)' },
  toggleBtnGreen: { borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.12)' },
  toggleBtnRed: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.12)' },
  toggleBtnText: { fontSize: 13, fontWeight: '500', color: '#888', fontFamily: 'GeneralSans' },
  toggleBtnTextActive: { color: '#F26522', fontWeight: '700' },
  toggleBtnTextGreen: { color: '#22c55e', fontWeight: '700' },
  toggleBtnTextRed: { color: '#ef4444', fontWeight: '700' },

  saveBtn: {
    alignSelf: 'flex-start',
    height: 44,
    paddingHorizontal: 28,
    backgroundColor: '#F26522',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff', fontFamily: 'GeneralSans' },

  // Trees section
  treesSection: {},
  treeCard: {
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  treeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  treeCardTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#ffffff', fontFamily: 'GeneralSans' },
  treeCardDate: { fontSize: 12, color: '#555', fontFamily: 'GeneralSans' },
  treeStat: { alignItems: 'flex-end', gap: 2 },
  treeStatLabel: { fontSize: 10, color: '#555', fontFamily: 'GeneralSans', textTransform: 'uppercase', letterSpacing: 0.5 },
  treeStatValue: { fontSize: 14, fontWeight: '700', color: '#ffffff', fontFamily: 'GeneralSans' },

  assetTable: { paddingHorizontal: 16, paddingVertical: 8 },
  assetHead: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  assetHeadCell: { fontSize: 11, fontWeight: '600', color: '#555', fontFamily: 'GeneralSans', textTransform: 'uppercase', letterSpacing: 0.5 },
  assetRow: { flexDirection: 'row', paddingVertical: 10 },
  assetRowBorder: { borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  assetCellText: { fontSize: 13, color: '#D0D5DD', fontFamily: 'GeneralSans' },
});
