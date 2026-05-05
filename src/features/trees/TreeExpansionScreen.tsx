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

type RateMode = 'Fixed' | 'Dynamic' | 'Spot';

interface FiatSettings {
  country: string;
  currency: string;
  connectedBank: string;
  otcRate: string;
  rateMode: RateMode;
  fxRefSource: string;
}

const DEFAULT_FIAT: FiatSettings = {
  country: '',
  currency: '',
  connectedBank: '',
  otcRate: '',
  rateMode: 'Fixed',
  fxRefSource: '',
};

const TABS = ['All', 'Crypto', 'Fiat'] as const;
type Tab = (typeof TABS)[number];
const TAB_WIDTH = 114.33;
const TAB_GAP = 4;

export default function TreeExpansionScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const clocks = useClocks();

  // Page entrance animation
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, []);

  // Data
  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [trees, setTrees] = useState<Tree[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [ch, tr] = await Promise.all([
        channelService.getChannels(),
        treeService.getTrees(),
      ]);
      setChannels(ch);
      setTrees(tr);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchData(); }, []);

  // Tab filter
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const pillX = useRef(new Animated.Value(0)).current;

  const switchTab = (tab: Tab) => {
    const idx = TABS.indexOf(tab);
    Animated.timing(pillX, {
      toValue: idx * (TAB_WIDTH + TAB_GAP),
      duration: 260,
      useNativeDriver: true,
    }).start();
    setActiveTab(tab);
  };

  const filteredChannels =
    activeTab === 'All'
      ? channels
      : activeTab === 'Crypto'
      ? channels.filter(r => r.type === 'Crypto' || r.type === 'DEX')
      : channels.filter(r => r.type === 'Fiat' || r.type === 'Fiat/Crypto');

  // Expand / collapse per channel
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

  // Fiat settings local state (no backend yet)
  const [fiatSettings, setFiatSettings] = useState<Record<string, FiatSettings>>({});

  const getFiatSettings = (id: string): FiatSettings =>
    fiatSettings[id] ?? { ...DEFAULT_FIAT };

  const updateFiatField = (
    id: string,
    field: keyof FiatSettings,
    value: string
  ) => {
    setFiatSettings(prev => ({
      ...prev,
      [id]: { ...(prev[id] ?? DEFAULT_FIAT), [field]: value },
    }));
  };

  const handleSignOut = async () => {
    await authService.logout();
    dispatch(logout());
  };

  const fmtPrice = (p: number): string => {
    if (p >= 1000) return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (p >= 1) return '$' + p.toFixed(4);
    return '$' + p.toFixed(8);
  };

  return (
    <View style={styles.container}>

      {/* ── Left pane ── */}
      <View style={styles.leftPane}>
        <View style={styles.logoRow}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
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
          <TouchableOpacity
            style={styles.ctaChannels}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Image source={require('../../../assets/Vector.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.ctaChannels}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Channels')}
          >
            <Image source={require('../../../assets/material-symbols_window.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Channels</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Trees — active */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
            <Image source={require('../../../assets/carbon_circle-filled.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Trees</Text>
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.contentInner}>

            {/* Top bar */}
            <View style={styles.topBar}>
              <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
                <Text style={styles.pageTitle}>Tree Expansion</Text>
                <Text style={styles.pageSubtitle}>
                  Click any account to expand and configure its settings
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

            {/* Tab bar + count */}
            <View style={styles.filterSection}>
              <View style={styles.filterBar}>
                <View style={styles.tabBar}>
                  <Animated.View style={[styles.pill, { transform: [{ translateX: pillX }] }]} />
                  {TABS.map(tab => (
                    <TouchableOpacity
                      key={tab}
                      style={styles.tabBtn}
                      onPress={() => switchTab(tab)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.countText}>
                  {filteredChannels.length} account{filteredChannels.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Channel list */}
            <View style={styles.channelList}>
              {filteredChannels.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No channels found.</Text>
                  <Text style={styles.emptyStateSub}>
                    Connect channels from the Channels page first.
                  </Text>
                </View>
              ) : (
                filteredChannels.map((channel, idx) => {
                  const isExpanded = expandedIds.has(channel.id);
                  const chevronAnim = getChevronAnim(channel.id);
                  const chevronRotate = chevronAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  });
                  const isFiat =
                    channel.type === 'Fiat' || channel.type === 'Fiat/Crypto';
                  const channelTrees = trees.filter(
                    t => t.channelId === channel.id
                  );
                  const fs = getFiatSettings(channel.id);

                  return (
                    <View
                      key={channel.id}
                      style={[
                        styles.channelCard,
                        idx < filteredChannels.length - 1 && { marginBottom: 8 },
                        isExpanded && styles.channelCardExpanded,
                      ]}
                    >
                      {/* Row header */}
                      <TouchableOpacity
                        style={styles.channelRow}
                        activeOpacity={0.8}
                        onPress={() => toggleExpand(channel.id)}
                      >
                        <View style={styles.channelRowLeft}>
                          <View style={styles.channelNameCell}>
                            <Text style={styles.channelName}>{channel.channel}</Text>
                            <View
                              style={[
                                styles.typeBadge,
                                isFiat ? styles.typeBadgeFiat : styles.typeBadgeCrypto,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.typeBadgeText,
                                  isFiat
                                    ? styles.typeBadgeTextFiat
                                    : styles.typeBadgeTextCrypto,
                                ]}
                              >
                                {channel.type}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.channelBalance}>{channel.balance}</Text>
                        </View>

                        <View style={styles.channelRowRight}>
                          <View
                            style={
                              channel.status === 'Active'
                                ? styles.statusBadgeGreen
                                : styles.statusBadgeRed
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

                          <Text style={styles.treeCountLabel}>
                            {isFiat
                              ? 'Fiat settings'
                              : `${channelTrees.length} tree${channelTrees.length !== 1 ? 's' : ''}`}
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

                      {/* Expanded panel */}
                      {isExpanded && (
                        <View style={styles.expandedPanel}>
                          <View style={styles.expandedDivider} />

                          {isFiat ? (
                            /* ── Fiat channel configuration ── */
                            <View style={styles.fiatForm}>
                              <Text style={styles.expandedSectionTitle}>
                                Fiat Channel Configuration
                              </Text>
                              <View style={styles.fiatGrid}>

                                {/* Country */}
                                <View style={styles.fiatField}>
                                  <Text style={styles.fiatLabel}>Country</Text>
                                  <TextInput
                                    style={styles.fiatInput}
                                    value={fs.country}
                                    onChangeText={v =>
                                      updateFiatField(channel.id, 'country', v)
                                    }
                                    placeholder="e.g. United States"
                                    placeholderTextColor="#555"
                                  />
                                </View>

                                {/* Currency */}
                                <View style={styles.fiatField}>
                                  <Text style={styles.fiatLabel}>Currency</Text>
                                  <TextInput
                                    style={styles.fiatInput}
                                    value={fs.currency}
                                    onChangeText={v =>
                                      updateFiatField(channel.id, 'currency', v)
                                    }
                                    placeholder="e.g. USD, EUR, GBP"
                                    placeholderTextColor="#555"
                                  />
                                </View>

                                {/* Connected bank */}
                                <View style={styles.fiatField}>
                                  <Text style={styles.fiatLabel}>Connected Bank</Text>
                                  <TextInput
                                    style={styles.fiatInput}
                                    value={fs.connectedBank}
                                    onChangeText={v =>
                                      updateFiatField(channel.id, 'connectedBank', v)
                                    }
                                    placeholder="e.g. Chase, Barclays, GTBank"
                                    placeholderTextColor="#555"
                                  />
                                </View>

                                {/* OTC rate */}
                                <View style={styles.fiatField}>
                                  <Text style={styles.fiatLabel}>OTC Rate</Text>
                                  <TextInput
                                    style={styles.fiatInput}
                                    value={fs.otcRate}
                                    onChangeText={v =>
                                      updateFiatField(channel.id, 'otcRate', v)
                                    }
                                    placeholder="e.g. 1.0850"
                                    placeholderTextColor="#555"
                                    keyboardType="numeric"
                                  />
                                </View>

                                {/* Rate mode */}
                                <View style={styles.fiatField}>
                                  <Text style={styles.fiatLabel}>Rate Mode</Text>
                                  <View style={styles.rateModeRow}>
                                    {(['Fixed', 'Dynamic', 'Spot'] as RateMode[]).map(
                                      mode => (
                                        <TouchableOpacity
                                          key={mode}
                                          style={[
                                            styles.rateModeBtn,
                                            fs.rateMode === mode &&
                                              styles.rateModeBtnActive,
                                          ]}
                                          activeOpacity={0.8}
                                          onPress={() =>
                                            updateFiatField(
                                              channel.id,
                                              'rateMode',
                                              mode
                                            )
                                          }
                                        >
                                          <Text
                                            style={[
                                              styles.rateModeBtnText,
                                              fs.rateMode === mode &&
                                                styles.rateModeBtnTextActive,
                                            ]}
                                          >
                                            {mode}
                                          </Text>
                                        </TouchableOpacity>
                                      )
                                    )}
                                  </View>
                                </View>

                                {/* FX reference source */}
                                <View style={styles.fiatField}>
                                  <Text style={styles.fiatLabel}>FX Reference Source</Text>
                                  <TextInput
                                    style={styles.fiatInput}
                                    value={fs.fxRefSource}
                                    onChangeText={v =>
                                      updateFiatField(channel.id, 'fxRefSource', v)
                                    }
                                    placeholder="e.g. Bloomberg, Reuters, Central Bank"
                                    placeholderTextColor="#555"
                                  />
                                </View>
                              </View>

                              <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
                                <Text style={styles.saveBtnText}>Save Settings</Text>
                              </TouchableOpacity>
                            </View>
                          ) : channelTrees.length > 0 ? (
                            /* ── Crypto trees ── */
                            <View style={styles.treesPanel}>
                              <Text style={styles.expandedSectionTitle}>Trees</Text>
                              {channelTrees.map((tree, ti) => (
                                <View
                                  key={tree._id}
                                  style={[
                                    styles.treeCard,
                                    ti < channelTrees.length - 1 && {
                                      marginBottom: 12,
                                    },
                                  ]}
                                >
                                  {/* Tree header */}
                                  <View style={styles.treeCardHeader}>
                                    <Text style={styles.treeCardTitle}>
                                      {tree.name ?? `Tree ${ti + 1}`}
                                    </Text>
                                    <Text style={styles.treeCardDate}>
                                      {new Date(tree.createdAt).toLocaleDateString(
                                        'en-GB',
                                        {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                        }
                                      )}
                                    </Text>
                                    <View style={styles.treeCardStat}>
                                      <Text style={styles.treeStatLabel}>EPPT</Text>
                                      <Text style={styles.treeStatValue}>
                                        {fmtPrice(tree.totalProfitGross)}
                                      </Text>
                                    </View>
                                    <View style={styles.treeCardStat}>
                                      <Text style={styles.treeStatLabel}>
                                        Profit-Net
                                      </Text>
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

                                  {/* Asset table */}
                                  <View style={styles.assetTable}>
                                    <View style={styles.assetTableHead}>
                                      <Text style={[styles.assetHeadCell, { flex: 2 }]}>
                                        Asset
                                      </Text>
                                      <Text
                                        style={[
                                          styles.assetHeadCell,
                                          { flex: 1, textAlign: 'right' },
                                        ]}
                                      >
                                        Margin
                                      </Text>
                                      <Text
                                        style={[
                                          styles.assetHeadCell,
                                          { flex: 2, textAlign: 'right' },
                                        ]}
                                      >
                                        Entry Price
                                      </Text>
                                      <Text
                                        style={[
                                          styles.assetHeadCell,
                                          { flex: 2, textAlign: 'right' },
                                        ]}
                                      >
                                        EPPT
                                      </Text>
                                    </View>
                                    {tree.assets.map((a, ai) => (
                                      <View
                                        key={a.asset}
                                        style={[
                                          styles.assetRow,
                                          ai < tree.assets.length - 1 &&
                                            styles.assetRowDivider,
                                        ]}
                                      >
                                        <Text
                                          style={[styles.assetCellText, { flex: 2 }]}
                                        >
                                          {a.asset}
                                        </Text>
                                        <Text
                                          style={[
                                            styles.assetCellText,
                                            { flex: 1, textAlign: 'right' },
                                          ]}
                                        >
                                          {a.margin.toFixed(1)}%
                                        </Text>
                                        <Text
                                          style={[
                                            styles.assetCellText,
                                            {
                                              flex: 2,
                                              textAlign: 'right',
                                              color: '#F26522',
                                            },
                                          ]}
                                        >
                                          {fmtPrice(a.entryPrice)}
                                        </Text>
                                        <Text
                                          style={[
                                            styles.assetCellText,
                                            {
                                              flex: 2,
                                              textAlign: 'right',
                                              color: '#22c55e',
                                            },
                                          ]}
                                        >
                                          {fmtPrice(a.profitGross)}
                                        </Text>
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              ))}
                            </View>
                          ) : (
                            <View style={styles.noTreesMsg}>
                              <Text style={styles.noTreesMsgText}>
                                No trees created for this channel yet.
                              </Text>
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
  },
  ctaCrossEnd: { position: 'absolute', right: 24, top: 28, width: 24, height: 24 },
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
  windowIcon: { width: 24, height: 24 },
  chevronIcon: { width: 24, height: 24, marginLeft: 'auto' },
  ctaText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'GeneralSans',
  },
  bottomSection: { paddingHorizontal: 25, paddingBottom: 32, gap: 16 },
  dividerLine: { height: 1, backgroundColor: '#2a2a2a', marginBottom: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F26522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'GeneralSans',
  },
  userEmail: { color: '#555555', fontSize: 12, fontFamily: 'GeneralSans' },
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

  // ── Main content ──
  mainContent: { flex: 1, backgroundColor: '#0a0a0a' },
  contentInner: { paddingHorizontal: 48, paddingTop: 60, paddingBottom: 80 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 32,
    fontFamily: 'GeneralSans',
    marginBottom: 8,
  },
  pageSubtitle: { fontSize: 15, color: '#888888', fontFamily: 'GeneralSans' },

  // Clocks
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

  // Filter / tab bar
  filterSection: { width: '100%', marginTop: 40, marginBottom: 24 },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    padding: 4,
    position: 'relative',
    height: 44,
    width: TAB_WIDTH * 3 + TAB_GAP * 2 + 8,
  },
  pill: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: TAB_WIDTH,
    height: 36,
    backgroundColor: '#F26522',
    borderRadius: 6,
  },
  tabBtn: {
    width: TAB_WIDTH,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: 'GeneralSans',
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
  },
  tabTextActive: { color: '#ffffff', fontWeight: '700' },
  countText: { fontSize: 13, color: '#555', fontFamily: 'GeneralSans' },

  // Channel list
  channelList: { gap: 0 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'GeneralSans',
    marginBottom: 8,
  },
  emptyStateSub: { fontSize: 14, color: '#555', fontFamily: 'GeneralSans' },

  // Channel card
  channelCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    overflow: 'hidden',
  },
  channelCardExpanded: { borderColor: '#383838' },

  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  channelRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  channelRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  channelNameCell: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  channelName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'GeneralSans',
  },
  channelBalance: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'GeneralSans',
  },

  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  typeBadgeCrypto: { borderColor: '#F26522', backgroundColor: 'rgba(242,101,34,0.12)' },
  typeBadgeFiat: { borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.12)' },
  typeBadgeText: { fontSize: 11, fontWeight: '600', fontFamily: 'GeneralSans' },
  typeBadgeTextCrypto: { color: '#F26522' },
  typeBadgeTextFiat: { color: '#3b82f6' },

  statusBadgeGreen: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  statusBadgeRed: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  statusTextGreen: { fontSize: 11, fontWeight: '600', color: '#22c55e', fontFamily: 'GeneralSans' },
  statusTextRed: { fontSize: 11, fontWeight: '600', color: '#ef4444', fontFamily: 'GeneralSans' },

  treeCountLabel: { fontSize: 12, color: '#555', fontFamily: 'GeneralSans' },
  expandChevron: { width: 20, height: 20, tintColor: '#888' },

  // Expanded panel
  expandedPanel: { paddingHorizontal: 20, paddingBottom: 24 },
  expandedDivider: { height: 1, backgroundColor: '#2a2a2a', marginBottom: 24 },
  expandedSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    fontFamily: 'GeneralSans',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },

  // Fiat form
  fiatForm: {},
  fiatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  fiatField: { width: '45%', minWidth: 200 },
  fiatLabel: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fiatInput: {
    height: 44,
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
  rateModeRow: { flexDirection: 'row', gap: 8 },
  rateModeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#383838',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d0d0d',
  },
  rateModeBtnActive: { borderColor: '#F26522', backgroundColor: 'rgba(242,101,34,0.12)' },
  rateModeBtnText: { fontSize: 13, fontWeight: '500', color: '#888', fontFamily: 'GeneralSans' },
  rateModeBtnTextActive: { color: '#F26522', fontWeight: '700' },
  saveBtn: {
    alignSelf: 'flex-start',
    height: 44,
    paddingHorizontal: 24,
    backgroundColor: '#F26522',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff', fontFamily: 'GeneralSans' },

  // Trees panel
  treesPanel: {},
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
    borderBottomColor: '#2a2a2a',
  },
  treeCardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'GeneralSans',
  },
  treeCardDate: { fontSize: 12, color: '#555', fontFamily: 'GeneralSans' },
  treeCardStat: { alignItems: 'flex-end', gap: 2 },
  treeStatLabel: { fontSize: 10, color: '#555', fontFamily: 'GeneralSans', textTransform: 'uppercase', letterSpacing: 0.5 },
  treeStatValue: { fontSize: 14, fontWeight: '700', color: '#ffffff', fontFamily: 'GeneralSans' },

  // Asset table inside tree
  assetTable: { paddingHorizontal: 16, paddingVertical: 8 },
  assetTableHead: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  assetHeadCell: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
    fontFamily: 'GeneralSans',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  assetRow: { flexDirection: 'row', paddingVertical: 10 },
  assetRowDivider: { borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  assetCellText: {
    fontSize: 13,
    color: '#D0D5DD',
    fontFamily: 'GeneralSans',
  },

  // No trees message
  noTreesMsg: { paddingVertical: 20, alignItems: 'center' },
  noTreesMsgText: { fontSize: 14, color: '#555', fontFamily: 'GeneralSans' },
});
