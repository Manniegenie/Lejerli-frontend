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
  Modal,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import authService from '../../services/authService';


type ChannelRow = {
  channel: string; type: string; assets: string; connection: string;
  balance: string; mode: string; margin: string; status: string;
};

const ALL_CHANNELS: ChannelRow[] = [
  { channel: 'Binance Pro',   type: 'Crypto',      assets: 'BTC / USDT',  connection: 'API',    balance: '$128,400',    mode: 'Active',  margin: '12.4%', status: 'Active'   },
  { channel: 'Kraken OTC',    type: 'Crypto',      assets: 'ETH / USDT',  connection: 'API',    balance: '$74,200',     mode: 'Passive', margin: '8.1%',  status: 'Active'   },
  { channel: 'Coinbase Inst', type: 'Crypto',      assets: 'SOL / USDT',  connection: 'Manual', balance: '$31,500',     mode: 'Active',  margin: '15.7%', status: 'Inactive' },
  { channel: 'FTX Europe',    type: 'Fiat',        assets: 'USD / EUR',   connection: 'API',    balance: '$250,000',    mode: 'Active',  margin: '5.2%',  status: 'Active'   },
  { channel: 'Bitstamp',      type: 'Fiat',        assets: 'GBP / USD',   connection: 'Manual', balance: '$89,700',     mode: 'Passive', margin: '9.8%',  status: 'Inactive' },
  { channel: 'First Bank',    type: 'Fiat/Crypto', assets: 'NGN / USDT',  connection: 'API',    balance: '₦42,600,000', mode: 'Active',  margin: '6.3%',  status: 'Active'   },
];

export default function ChannelsScreen({ navigation }: any) {
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

  const handleSignOut = async () => {
    await authService.logout();
    dispatch(logout());
  };

  // Animated title entrance
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(titleY,      { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, []);

  const TABS = ['All', 'Crypto', 'Fiat'] as const;
  type Tab = typeof TABS[number];
  const TAB_WIDTH = 114.33;
  const TAB_GAP   = 4;

  const [activeTab, setActiveTab] = useState<Tab>('All');
  const pillX = useRef(new Animated.Value(0)).current;

  // ── Create Channel modal ──────────────────────────────────────────────────
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [channelType, setChannelType] = useState<'Crypto' | 'Fiat'>('Crypto');

  const hoverAnims = useRef<Record<'Crypto' | 'Fiat', Animated.Value>>({
    Crypto: new Animated.Value(1),
    Fiat:   new Animated.Value(0),
  }).current;

  const handleTypePress = (label: 'Crypto' | 'Fiat') => {
    Animated.timing(hoverAnims[channelType], { toValue: 0, duration: 200, useNativeDriver: false }).start();
    Animated.timing(hoverAnims[label],       { toValue: 1, duration: 200, useNativeDriver: false }).start();
    setChannelType(label);
  };

  type Exchange = { id: string; name: string; image: string; url: string };
  const [exchanges, setExchanges] = useState<Exchange[]>([]);

  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        const res  = await fetch('http://localhost:3000/exchanges');
        const json = await res.json();
        if (json.success) setExchanges(json.data);
      } catch (_) {}
    };
    fetchExchanges();
  }, []);

  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);

  const resetForm = () => {
    setChannelType('Crypto');
    setSelectedExchange(null);
  };

  // ── Fiat currency → ISO 3166-1 alpha-2 country code (for flagcdn.com) ───
  const FIAT_COUNTRY: Record<string, string> = {
    USD: 'us', GBP: 'gb', EUR: 'eu', NGN: 'ng', JPY: 'jp',
    CNY: 'cn', AED: 'ae', QAR: 'qa', ZAR: 'za', KES: 'ke',
    CAD: 'ca', AUD: 'au', CHF: 'ch', INR: 'in', BRL: 'br',
    MXN: 'mx', SGD: 'sg', HKD: 'hk', NOK: 'no', SEK: 'se',
    DKK: 'dk', PLN: 'pl', TRY: 'tr', SAR: 'sa', EGP: 'eg',
    GHS: 'gh', MAD: 'ma', RUB: 'ru', HUF: 'hu', XOF: 'sn',
  };

  // ── Token icons — fetched from backend ───────────────────────────────────
  const [tokenIcons, setTokenIcons] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const res  = await fetch('http://localhost:3000/tokens/icons');
        const json = await res.json();
        if (json.success) setTokenIcons(json.data);
      } catch (_) {}
    };
    fetchIcons();
  }, []);

  const switchTab = (tab: Tab) => {
    const idx = TABS.indexOf(tab);
    Animated.timing(pillX, {
      toValue: idx * (TAB_WIDTH + TAB_GAP),
      duration: 260,
      useNativeDriver: true,
    }).start();
    setActiveTab(tab);
  };

  const filteredChannels = activeTab === 'All'
    ? ALL_CHANNELS
    : activeTab === 'Crypto'
      ? ALL_CHANNELS.filter(r => r.type === 'Crypto')
      : ALL_CHANNELS.filter(r => r.type === 'Fiat' || r.type === 'Fiat/Crypto');

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

        {/* Quick Access */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Quick Access</Text>
            <View style={styles.ctaDivider} />
            <Image source={require('../../../assets/cross.png')} style={styles.ctaCrossEnd} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <View style={styles.ctaUnderline} />

        {/* Dashboard — inactive */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaChannels} activeOpacity={0.85} onPress={() => navigation.navigate('Dashboard')}>
            <Image source={require('../../../assets/Vector.png')} style={styles.vectorIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Channels — active */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
            <Image source={require('../../../assets/material-symbols_window.png')} style={styles.windowIcon} resizeMode="contain" />
            <Text style={styles.ctaText}>Channels</Text>
            <Image source={require('../../../assets/chevron-down.png')} style={styles.chevronIcon} resizeMode="contain" />
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

      {/* ── Create Channel Modal ── */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => { setCreateModalVisible(false); resetForm(); }}
      >
        {/* Dim overlay */}
        <View style={styles.modalOverlay}>
          {/* Card */}
          <View style={styles.modalCard}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Create Channel</Text>
                <Text style={styles.modalSubtitle}>Configure a new trading channel</Text>
              </View>
              <TouchableOpacity
                style={styles.modalClose}
                activeOpacity={0.75}
                onPress={() => { setCreateModalVisible(false); resetForm(); }}
              >
                <Image source={require('../../../assets/cross.png')} style={styles.modalCloseIcon} resizeMode="contain" tintColor="#888888" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            {/* Form */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>

              {/* Channel Type */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Channel Type</Text>
                <View style={styles.segmentRow}>
                  {([
                    { label: 'Crypto', subtitle: 'Wallet or exchange' },
                    { label: 'Fiat',   subtitle: 'Bank account' },
                  ] as const).map(({ label, subtitle }) => (
                    <Animated.View
                      key={label}
                      style={[
                        styles.segmentBtn,
                        {
                          borderColor: hoverAnims[label].interpolate({
                            inputRange: [0, 1],
                            outputRange: ['#383838', '#F26522'],
                          }),
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.segmentBtnInner}
                        activeOpacity={0.8}
                        onPress={() => handleTypePress(label)}
                      >
                        <View style={styles.segmentInner}>
                          <Animated.Image
                            source={require('../../../assets/Vector (3).png')}
                            style={{
                              width: 20, height: 20,
                              opacity: hoverAnims[label],
                            }}
                            resizeMode="contain"
                          />
                          <Text style={[styles.segmentText, channelType === label && styles.segmentTextActive]}>{label}</Text>
                        </View>
                        <Text style={styles.segmentSubtitle}>{subtitle}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </View>

              {/* Exchange / Bank grid */}
              {channelType === 'Crypto' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Select Exchange</Text>
                  <View style={styles.exchangeGrid}>
                    {exchanges.map(ex => (
                      <TouchableOpacity
                        key={ex.id}
                        style={[styles.exchangeCard, selectedExchange === ex.id && { borderColor: '#F26522', borderWidth: 2 }]}
                        activeOpacity={0.8}
                        onPress={() => setSelectedExchange(ex.id)}
                      >
                        <Image source={{ uri: ex.image }} style={styles.exchangeLogo} resizeMode="contain" />
                        <Text style={styles.exchangeName} numberOfLines={1}>{ex.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

            </ScrollView>

            <View style={styles.modalDivider} />

            {/* Footer actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.8}
                onPress={() => { setCreateModalVisible(false); resetForm(); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                activeOpacity={0.85}
                onPress={() => {
                  // TODO: dispatch create channel action
                  setCreateModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.confirmBtnText}>Continue</Text>
                <Text style={styles.confirmBtnArrow}>→</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* ── Main content ── */}
      <View style={styles.mainContent}>
        <ScrollView contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={true}>

          <View style={styles.topBar}>
            <View>
              <Animated.Text style={[styles.pageTitle, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
                Channels
              </Animated.Text>
              <Animated.Text style={[styles.pageSubtitle, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
                Manage channels
              </Animated.Text>
            </View>

            {/* Retro world clocks — absolutely centred */}
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
                  <TextInput style={styles.searchField} placeholder="Search channels" placeholderTextColor="#737373" />
                </View>
              </View>
            </View>
          </View>

          {/* Filter / action bar */}
          <View style={styles.filterSection}>

            {/* Create Channel button — right aligned above tab row */}
            <TouchableOpacity style={styles.createChannelBtn} activeOpacity={0.85} onPress={() => setCreateModalVisible(true)}>
              <Image source={require('../../../assets/cross.png')} style={styles.createChannelIcon} resizeMode="contain" tintColor="#ffffff" />
              <Text style={styles.createChannelText} numberOfLines={1}>Create Channel</Text>
            </TouchableOpacity>

            <View style={styles.filterBar}>
              <View style={styles.tabControl}>
                {/* Sliding pill */}
                <Animated.View style={[styles.tabPill, { transform: [{ translateX: pillX }] }]} />

                {TABS.map(tab => (
                  <TouchableOpacity key={tab} style={styles.tabItem} onPress={() => switchTab(tab)} activeOpacity={0.8}>
                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Right side filters row */}
              <View style={styles.filterRightRow}>
                <TouchableOpacity style={styles.dropdownBtn} activeOpacity={0.85}>
                  <Text style={styles.dropdownText}>All Status</Text>
                  <Text style={styles.dropdownArrow}>▾</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dropdownBtn} activeOpacity={0.85}>
                  <Text style={styles.dropdownText}>All Assets</Text>
                  <Text style={styles.dropdownArrow}>▾</Text>
                </TouchableOpacity>

                <View style={styles.filterSearch}>
                  <Image source={require('../../../assets/tdesign_ai-search.png')} style={styles.filterSearchIcon} resizeMode="contain" />
                  <TextInput style={styles.filterSearchField} placeholder="Search" placeholderTextColor="#737373" />
                </View>
              </View>
            </View>
          </View>

          {/* Channels Table */}
          <View style={styles.channelsTable}>
            {[
              { key: 'channel',    label: 'Channel'    },
              { key: 'type',       label: 'Type'       },
              { key: 'assets',     label: 'Assets'     },
              { key: 'connection', label: 'Connection' },
              { key: 'balance',    label: 'Balance'    },
              { key: 'mode',       label: 'Mode'       },
              { key: 'margin',     label: 'Margin'     },
              { key: 'status',     label: 'Status'     },
            ].map(({ key, label }, colIdx) => {
              const colKey = key as keyof ChannelRow;
              return (
                <View key={key} style={styles.tableCol}>
                  <View style={[styles.tableColHeader, colIdx === 0 && styles.tableColHeaderFirst]}>
                    <Text style={styles.tableColHeaderText}>{label}</Text>
                  </View>
                  {filteredChannels.map((row, i) => {
                    const cell = row[colKey];
                    return (
                    <View key={i}>
                      <View style={styles.tableColCell}>
                        {key === 'status' ? (
                          <View style={cell === 'Active' ? styles.statusBadgeGreen : styles.statusBadgeRed}>
                            <Text style={cell === 'Active' ? styles.statusTextGreen : styles.statusTextRed}>{cell}</Text>
                          </View>
                        ) : key === 'assets' ? (
                          <View style={styles.assetCell}>
                            {(() => {
                              const symbol = cell.split(' / ')[0].trim();
                              const countryCode = FIAT_COUNTRY[symbol];
                              if (countryCode) {
                                return (
                                  <Image
                                    source={{ uri: `https://flagcdn.com/w20/${countryCode}.png` }}
                                    style={styles.flagIcon}
                                  />
                                );
                              }
                              const iconUrl = tokenIcons[symbol];
                              return iconUrl ? (
                                <Image source={{ uri: iconUrl }} style={styles.tokenIcon} />
                              ) : (
                                <View style={styles.tokenIconPlaceholder}>
                                  <Text style={styles.tokenIconPlaceholderText}>{symbol.charAt(0)}</Text>
                                </View>
                              );
                            })()}
                            <Text style={styles.tableColCellText} numberOfLines={1}>{cell}</Text>
                          </View>
                        ) : (
                          <Text style={styles.tableColCellText} numberOfLines={1}>{cell}</Text>
                        )}
                      </View>
                      {i < filteredChannels.length - 1 && <View style={styles.tableRowDivider} />}
                    </View>
                    );
                  })}
                </View>
              );
            })}
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#0a0a0a' },

  // ── Left pane ──
  leftPane: { width: 337, backgroundColor: '#0d0d0d', borderRightWidth: 1, borderRightColor: '#2a2a2a', flexDirection: 'column' },
  logoRow: { paddingHorizontal: 25, paddingTop: 48, paddingBottom: 40 },
  logo: { width: 164, height: 28.72 },
  ctaRow: { paddingHorizontal: 25, marginBottom: 16 },
  ctaUnderline: { width: 287, height: 0, borderBottomWidth: 1, borderBottomColor: '#282828', marginLeft: 25, marginBottom: 40 },
  ctaButton: { width: 287, height: 80, backgroundColor: '#F26522', borderRadius: 6, padding: 12, gap: 8, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  ctaDivider: { position: 'absolute', left: 216, top: 0, width: 1, height: 80, backgroundColor: '#ffffff' },
  ctaCrossEnd: { position: 'absolute', right: 24, top: 28, width: 24, height: 24 },
  ctaSecondary: { width: 287, height: 68, backgroundColor: '#F26522', borderRadius: 6, padding: 12, gap: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  ctaChannels: { width: 287, height: 68, backgroundColor: '#171717', borderRadius: 6, padding: 12, gap: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  vectorIcon: { width: 24, height: 24 },
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

  // ── Main content ──
  mainContent: { flex: 1, backgroundColor: '#0a0a0a' },
  contentInner: { paddingHorizontal: 48, paddingTop: 60 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  pageTitle: { fontSize: 30, fontWeight: '700', color: '#ffffff', lineHeight: 32, fontFamily: 'GeneralSans', marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: '#888888', fontFamily: 'GeneralSans' },

  // Clocks
  clocksCenter: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, paddingRight: 120 },
  clockBox: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f0f', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6, gap: 2 },
  clockCity: { fontFamily: 'GeneralSans', fontSize: 9, fontWeight: '600', letterSpacing: 1.5, color: '#ffffff', textTransform: 'uppercase' },
  clockTime: { fontFamily: 'monospace', fontSize: 15, fontWeight: '700', color: '#F26522', letterSpacing: 2 },

  // Search
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchIcon: { width: 24, height: 24 },
  searchInput: { width: 619, height: 68, backgroundColor: '#171717', borderRadius: 12, borderWidth: 1, borderColor: '#383838', position: 'relative' },
  searchInner: { width: 324, height: 27, position: 'absolute', top: 19, left: 21, gap: 10, flexDirection: 'row', alignItems: 'center' },
  searchField: { width: 146, height: 27, color: '#ffffff', fontFamily: 'GeneralSans', fontWeight: '400', fontSize: 20, outlineStyle: 'none' as any, outlineWidth: 0 },

  filterSection: {
    width: '100%',
    marginTop: 250,
    gap: 16,
  },
  filterBar: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createChannelBtn: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    gap: 10,
    backgroundColor: '#F26522',
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  createChannelIcon: {
    width: 18,
    height: 18,
  },
  createChannelText: {
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 16,
  },
  filterRightRow: {
    width: 600,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  dropdownBtn: {
    width: 160,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 8,
  },
  dropdownText: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#CBD5E1',
  },
  channelsTable: {
    width: '100%',
    height: 401,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#383838',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    marginTop: 24,
  },
  tableCol: {
    flex: 1,
    flexDirection: 'column',
  },
  tableColHeader: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: '#383838',
  },
  tableColHeaderFirst: {
    borderTopLeftRadius: 8,
  },
  tableColHeaderText: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 13,
    color: '#D0D5DD',
  },
  tableColCell: {
    height: 58,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: '#383838',
  },
  tableColCellText: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 13,
    color: '#D0D5DD',
  },
  assetCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tokenIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  tokenIconPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#282828',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenIconPlaceholderText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F26522',
    fontFamily: 'GeneralSans',
  },
  flagIcon: {
    width: 20,
    height: 14,
    borderRadius: 2,
  },
  tableRowDivider: {
    height: 1,
    backgroundColor: '#383838',
  },
  statusBadgeGreen: {
    alignSelf: 'flex-start',
    backgroundColor: '#4EDEA31A',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeRed: {
    alignSelf: 'flex-start',
    backgroundColor: '#EB41411A',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusTextGreen: {
    fontFamily: 'GeneralSans',
    fontSize: 12,
    fontWeight: '600',
    color: '#4EDEA3',
  },
  statusTextRed: {
    fontFamily: 'GeneralSans',
    fontSize: 12,
    fontWeight: '600',
    color: '#EB4141',
  },
  filterSearch: {
    flex: 1,
    height: 40,
    backgroundColor: '#171717',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#383838',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  filterSearchIcon: {
    width: 16,
    height: 16,
  },
  filterSearchField: {
    flex: 1,
    color: '#ffffff',
    fontFamily: 'GeneralSans',
    fontSize: 14,
    outlineStyle: 'none' as any,
    outlineWidth: 0,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 14,
  },

  // ── Create Channel Modal ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18,18,18,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '95%',
    maxWidth: 860,
    maxHeight: '92%',
    backgroundColor: '#161616',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
    flexShrink: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 24,
  },
  modalTitle: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 22,
    color: '#ffffff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 14,
    color: '#888888',
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    width: 16,
    height: 16,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 0,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 13,
    color: '#ffffff',
    marginBottom: 8,
  },
  fieldInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontFamily: 'GeneralSans',
    fontSize: 14,
    outlineStyle: 'none' as any,
    outlineWidth: 0,
  },
  segmentRow: {
    flexDirection: 'row',
    width: '100%',
    height: 72,
    gap: 12,
  },
  segmentBtn: {
    flex: 1,
    height: 72,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#383838',
    borderRadius: 8,
  },
  segmentBtnInner: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    gap: 8,
    justifyContent: 'center',
  },
  segmentBtnActive: {},
  segmentText: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 13,
    color: '#888888',
  },
  segmentTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  segmentInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmentSubtitle: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 24,
    color: '#737373',
  },
  exchangeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exchangeCard: {
    width: '30%',
    aspectRatio: 1.6,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
  },
  exchangeCardActive: {
    borderColor: '#F26522',
    borderWidth: 2,
  },
  exchangeLogo: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  exchangeName: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 11,
    color: '#cccccc',
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
  },
  cancelBtnText: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 15,
    color: '#888888',
  },
  confirmBtn: {
    flex: 2,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F26522',
    borderRadius: 8,
  },
  confirmBtnArrow: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
  confirmBtnText: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 15,
    color: '#ffffff',
  },
  tabPill: {
    position: 'absolute',
    width: 114.33,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F26522',
  },
  tabItem: {
    width: 114.33,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#ffffff',
    textAlign: 'center',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  tabControl: {
    width: 359,
    height: 44,
    backgroundColor: '#282828',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
