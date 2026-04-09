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
import walletService from '../../services/walletService';
import treeService from '../../services/treeService';
import channelService from '../../services/channelService';
import { useClocks } from '../../hooks/useClocks';
import { useTrees } from '../../hooks/useTrees';
import { useChannels } from '../../hooks/useChannels';
import { useTokenIcons } from '../../hooks/useTokenIcons';

export default function ChannelsScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const clocks = useClocks();

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

  // ── Create Tree modal ─────────────────────────────────────────────────────
  const [treeModalVisible, setTreeModalVisible] = useState(false);
  const [treeStep,          setTreeStep]          = useState<1 | 2>(1);
  const [treeChannel,       setTreeChannel]       = useState<string | null>(null);
  const [editingTree,       setEditingTree]       = useState<TreeDoc | null>(null);

  type AssetMargin = { asset: string; usdValue: string; selected: boolean; margin: string; livePrice: number | null };
  const [treeAssets,   setTreeAssets]   = useState<AssetMargin[]>([]);
  const [livePrices,   setLivePrices]   = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(false);

  const resetTree = () => {
    setTreeStep(1);
    setTreeChannel(null);
    setTreeAssets([]);
    setLivePrices({});
    setEditingTree(null);
  };

  const STABLECOINS = new Set(['USDT','USDC','BUSD','FDUSD','DAI','TUSD']);

  // When user picks a channel in step 1 — load its balances then fetch live prices
  // preFill: map of asset → margin (used when opening edit modal pre-populated)
  const loadTreeChannel = async (exchangeId: string, preFill?: Record<string, number>) => {
    setTreeChannel(exchangeId);
    setTreeStep(2);
    setPricesLoading(true);

    let assetList: { asset: string; usdValue: string }[] = [];
    try {
      assetList = await walletService.getBalances(exchangeId);
    } catch (_) {}

    // Seed rows immediately so the UI shows assets while prices load
    setTreeAssets(assetList.map(b => {
      const savedMargin = preFill?.[b.asset];
      return {
        asset: b.asset, usdValue: b.usdValue,
        selected: savedMargin !== undefined,
        margin:   savedMargin !== undefined ? String(savedMargin) : '',
        livePrice: null,
      };
    }));

    // Fetch all Binance spot prices in one call (public — no auth)
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/price');
      const all: { symbol: string; price: string }[] = await res.json();
      const map: Record<string, number> = {};
      all.forEach(t => { map[t.symbol] = parseFloat(t.price); });

      const priceFor = (asset: string): number | null => {
        if (STABLECOINS.has(asset))          return 1;
        if (map[`${asset}USDT`])             return map[`${asset}USDT`];
        if (map[`${asset}BTC`] && map['BTCUSDT'])
          return map[`${asset}BTC`] * map['BTCUSDT'];
        return null;
      };

      const resolved: Record<string, number> = {};
      assetList.forEach(b => {
        const p = priceFor(b.asset);
        if (p !== null) resolved[b.asset] = p;
      });

      setLivePrices(resolved);
      setTreeAssets(prev => prev.map(r => ({ ...r, livePrice: resolved[r.asset] ?? null })));
    } catch (_) {}

    setPricesLoading(false);
  };

  const toggleTreeAsset = (asset: string) => {
    setTreeAssets(prev => prev.map(r => r.asset === asset ? { ...r, selected: !r.selected } : r));
  };

  const setAssetMargin = (asset: string, margin: string) => {
    setTreeAssets(prev => prev.map(r => r.asset === asset ? { ...r, margin } : r));
  };

  const fmtPrice = (p: number | null): string => {
    if (p === null || isNaN(p)) return '—';
    if (p >= 1000) return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (p >= 1)    return '$' + p.toFixed(4);
    return '$' + p.toFixed(8);
  };
  const fmtLive = fmtPrice;

  const calcEntry = (livePrice: number | null, margin: string): number | null => {
    if (!livePrice || margin === '' || isNaN(parseFloat(margin))) return null;
    return livePrice * (1 - parseFloat(margin) / 100);
  };
  const entryPrice = (livePrice: number | null, margin: string): string => {
    const v = calcEntry(livePrice, margin);
    return v !== null ? fmtPrice(v) : '—';
  };

  // Profit-Gross = live price × (margin / 100) — the dollar offset captured at entry
  const calcProfitGross = (livePrice: number | null, margin: string): number | null => {
    if (!livePrice || margin === '' || isNaN(parseFloat(margin))) return null;
    return livePrice * (parseFloat(margin) / 100);
  };
  const fmtProfitGross = (livePrice: number | null, margin: string): string => {
    const v = calcProfitGross(livePrice, margin);
    return v !== null ? fmtPrice(v) : '—';
  };

  // ── Create Channel modal ──────────────────────────────────────────────────
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [channelType, setChannelType] = useState<'Crypto' | 'Fiat' | 'DEX'>('Crypto');

  const hoverAnims = useRef<Record<'Crypto' | 'Fiat' | 'DEX', Animated.Value>>({
    Crypto: new Animated.Value(1),
    Fiat:   new Animated.Value(0),
    DEX:    new Animated.Value(0),
  }).current;

  const handleTypePress = (label: 'Crypto' | 'Fiat' | 'DEX') => {
    Animated.timing(hoverAnims[channelType], { toValue: 0, duration: 200, useNativeDriver: false }).start();
    Animated.timing(hoverAnims[label],       { toValue: 1, duration: 200, useNativeDriver: false }).start();
    setChannelType(label);
  };

  type Exchange = { id: string; name: string; image: string; dex?: boolean };
  const exchanges: Exchange[] = [
    { id: 'binance',     name: 'Binance',    image: 'https://assets.coingecko.com/markets/images/52/small/binance.jpg' },
    { id: 'coinbase',    name: 'Coinbase',   image: 'https://assets.coingecko.com/markets/images/23/small/Coinbase_Coin_Primary.png' },
    { id: 'kraken',      name: 'Kraken',     image: 'https://assets.coingecko.com/markets/images/29/small/kraken.jpg' },
    { id: 'okx',         name: 'OKX',        image: 'https://assets.coingecko.com/markets/images/96/small/WeChat_Image_20220117220452.png' },
    { id: 'bybit_spot',  name: 'Bybit',      image: 'https://assets.coingecko.com/markets/images/698/small/bybit_spot.png' },
    { id: 'kucoin',      name: 'KuCoin',     image: 'https://assets.coingecko.com/markets/images/61/small/kucoin.png' },
    { id: 'bitfinex',    name: 'Bitfinex',   image: 'https://assets.coingecko.com/markets/images/4/small/BItfinex.png' },
    { id: 'bitstamp',    name: 'Bitstamp',   image: 'https://assets.coingecko.com/markets/images/9/small/bitstamp.png' },
    { id: 'gemini',      name: 'Gemini',     image: 'https://assets.coingecko.com/markets/images/50/small/gemini.png' },
    { id: 'gate',        name: 'Gate.io',    image: 'https://assets.coingecko.com/markets/images/60/small/gate_io_logo1.jpg' },
    { id: 'htx',         name: 'HTX',        image: 'https://assets.coingecko.com/markets/images/25/small/huobi.jpg' },
    { id: 'mexc',        name: 'MEXC',       image: 'https://assets.coingecko.com/markets/images/419/small/MEXC_logo_square.jpeg' },
  ];

  const dexWallets: Exchange[] = [
    { id: 'phantom',  name: 'Phantom',  image: 'https://assets.coingecko.com/coins/images/31503/small/phantom.png',  dex: true },
    { id: 'metamask', name: 'MetaMask', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',   dex: true },
    { id: 'trust',    name: 'Trust',    image: 'https://assets.coingecko.com/coins/images/25244/small/Phantom-Icon_Transparent_Purple.png', dex: true },
    { id: 'jupiter',  name: 'Jupiter',  image: 'https://assets.coingecko.com/coins/images/34188/small/jup.png',      dex: true },
    { id: 'uniswap',  name: 'Uniswap',  image: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png', dex: true },
    { id: 'raydium',  name: 'Raydium',  image: 'https://assets.coingecko.com/coins/images/13928/small/PSigc4ie_400x400.jpg', dex: true },
  ];

  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);

  // ── Step 2 state ──────────────────────────────────────────────────────────
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [permTrades,      setPermTrades]      = useState(true);
  const [permDeposits,    setPermDeposits]    = useState(true);
  const [permWithdrawals, setPermWithdrawals] = useState(false);
  const [termsAgreed,     setTermsAgreed]     = useState(false);
  const [apiKey,          setApiKey]          = useState('');
  const [apiSecret,       setApiSecret]       = useState('');
  const [walletAddress,   setWalletAddress]   = useState('');

  // ── Import range ──────────────────────────────────────────────────────────
  const [importEnabled, setImportEnabled] = useState(false);
  const importToggleAnim = useRef(new Animated.Value(0)).current;
  const toggleImport = () => {
    const next = !importEnabled;
    setImportEnabled(next);
    Animated.timing(importToggleAnim, { toValue: next ? 1 : 0, duration: 220, useNativeDriver: false }).start();
  };

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  const [importFrom, setImportFrom] = useState<Date>(twelveMonthsAgo);
  const [importTo,   setImportTo]   = useState<Date>(new Date());

  // Calendar view state
  type CalTarget = 'from' | 'to' | null;
  const [calTarget,  setCalTarget]  = useState<CalTarget>(null);
  const [calYear,    setCalYear]    = useState(new Date().getFullYear());
  const [calMonth,   setCalMonth]   = useState(new Date().getMonth()); // 0-based

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYS   = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  const openCal = (target: CalTarget, seed: Date) => {
    setCalTarget(target);
    setCalYear(seed.getFullYear());
    setCalMonth(seed.getMonth());
  };

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  const selectDay = (day: number) => {
    const chosen = new Date(calYear, calMonth, day);
    if (calTarget === 'from') {
      setImportFrom(chosen);
      if (chosen > importTo) setImportTo(chosen);
    } else {
      setImportTo(chosen);
      if (chosen < importFrom) setImportFrom(chosen);
    }
    setCalTarget(null);
  };

  const buildCalDays = () => {
    const firstDow = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
    const offset   = firstDow === 0 ? 6 : firstDow - 1;       // shift so Mon=0
    const total    = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  };

  const fmtDate = (d: Date) =>
    `${d.getDate().toString().padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

  // ── API key guide ─────────────────────────────────────────────────────────
  const [guideOpen, setGuideOpen] = useState(false);
  const guideAnim = useRef(new Animated.Value(0)).current;
  const toggleGuide = () => {
    const next = !guideOpen;
    setGuideOpen(next);
    Animated.timing(guideAnim, { toValue: next ? 1 : 0, duration: 240, useNativeDriver: false }).start();
  };

  const API_GUIDES: Record<string, { url: string; steps: string[] }> = {
    binance: {
      url: 'https://www.binance.com/en/my/settings/api-management',
      steps: [
        'Log in to Binance and click your profile icon (top right)',
        'Go to Account  →  API Management',
        'Click "Create API" and choose "System generated"',
        'Give it a label (e.g. "Lejerli") and complete 2FA verification',
        'Under permissions, enable "Read Only" — do NOT enable Spot trading or withdrawals',
        'Copy your API Key and Secret Key — the secret is shown once, save it immediately',
      ],
    },
    coinbase: {
      url: 'https://www.coinbase.com/settings/api',
      steps: [
        'Log in to Coinbase and go to Settings → API',
        'Click "New API Key"',
        'Select the portfolio and enable "View" permissions only',
        'Complete 2FA verification',
        'Copy your API Key and API Secret',
      ],
    },
    kraken: {
      url: 'https://www.kraken.com/u/security/api',
      steps: [
        'Log in to Kraken and go to Account  →  Security  →  API',
        'Click "Add Key"',
        'Under Key Permissions, enable "Query Funds", "Query Ledger Entries", and "Query Open Orders"',
        'Leave all trading and withdrawal permissions OFF',
        'Click Generate Key and copy both the API Key and Private Key',
      ],
    },
    okx: {
      url: 'https://www.okx.com/account/users/personal-center/settings/permission',
      steps: [
        'Log in to OKX and click your profile icon',
        'Go to User Centre  →  API',
        'Click "Create V5 API Key"',
        'Set the purpose to "Read Only", complete passphrase and 2FA',
        'Copy the API Key and Secret Key shown',
      ],
    },
    bybit_spot: {
      url: 'https://www.bybit.com/app/user/api-management',
      steps: [
        'Log in to Bybit and go to Account  →  API',
        'Click "Create New Key"',
        'Choose "System-generated API Keys" and set permissions to "Read-Only"',
        'Complete 2FA verification',
        'Copy the API Key and API Secret immediately — the secret is shown once',
      ],
    },
    kucoin: {
      url: 'https://www.kucoin.com/account/api',
      steps: [
        'Log in to KuCoin and go to your Profile  →  API Management',
        'Click "Create API"',
        'Set API Name, Passphrase, and enable "General" permissions only',
        'DO NOT enable trading or withdrawal permissions',
        'Complete 2FA and copy the API Key and Secret',
        'Note: KuCoin also requires a Passphrase — save all three values',
      ],
    },
    default: {
      url: '',
      steps: [
        'Log in to your exchange account',
        'Navigate to Account Settings  →  API Management',
        'Create a new API key with Read-Only permissions',
        'Disable all trading and withdrawal permissions',
        'Complete any 2FA verification required',
        'Copy your API Key and Secret — the secret is usually shown only once',
      ],
    },
  };

  const currentGuide = selectedExchange
    ? (API_GUIDES[selectedExchange] || API_GUIDES.default)
    : API_GUIDES.default;

  const resetForm = () => {
    setChannelType('Crypto');
    setSelectedExchange(null);
    setModalStep(1);
    setPermTrades(true);
    setPermDeposits(true);
    setPermWithdrawals(false);
    setTermsAgreed(false);
    setApiKey('');
    setApiSecret('');
    setWalletAddress('');
    setImportEnabled(false);
    importToggleAnim.setValue(0);
    const t = new Date(); t.setFullYear(t.getFullYear() - 1);
    setImportFrom(t);
    setImportTo(new Date());
    setCalTarget(null);
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

  // ── Data hooks ────────────────────────────────────────────────────────────
  type TreeAssetDoc = { asset: string; margin: number; priceAtCreation: number; entryPrice: number; profitGross: number };
  type TreeDoc      = { _id: string; channelId: string; assets: TreeAssetDoc[]; totalProfitGross: number; profitNet: number; createdAt: string };

  const { trees, fetchTrees }                           = useTrees() as { trees: TreeDoc[]; fetchTrees: () => void };
  const { channels, connectedAccounts, fetchChannels }  = useChannels();
  const tokenIcons                                       = useTokenIcons();

  useEffect(() => { fetchTrees(); fetchChannels(); }, []);

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
    ? channels
    : activeTab === 'Crypto'
      ? channels.filter(r => r.type === 'Crypto')
      : channels.filter(r => r.type === 'Fiat' || r.type === 'Fiat/Crypto');

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

            {/* Form — Step 1: channel type + exchange selection */}
            {modalStep === 1 && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>

                {/* Channel Type */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Channel Type</Text>
                  <View style={styles.segmentRow}>
                    {([
                      { label: 'Crypto', subtitle: 'Wallet or exchange' },
                      { label: 'Fiat',   subtitle: 'Bank account' },
                      { label: 'DEX',    subtitle: 'On-chain wallet' },
                    ] as const).map(({ label, subtitle }) => (
                      <Animated.View
                        key={label}
                        style={[styles.segmentBtn, { borderColor: hoverAnims[label].interpolate({ inputRange: [0, 1], outputRange: ['#383838', '#F26522'] }) }]}
                      >
                        <TouchableOpacity style={styles.segmentBtnInner} activeOpacity={0.8} onPress={() => handleTypePress(label)}>
                          <View style={styles.segmentInner}>
                            <Animated.Image source={require('../../../assets/Vector (3).png')} style={{ width: 20, height: 20, opacity: hoverAnims[label] }} resizeMode="contain" />
                            <Text style={[styles.segmentText, channelType === label && styles.segmentTextActive]}>{label}</Text>
                          </View>
                          <Text style={styles.segmentSubtitle}>{subtitle}</Text>
                        </TouchableOpacity>
                      </Animated.View>
                    ))}
                  </View>
                </View>

                {/* Exchange grid */}
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

                {/* DEX wallet grid */}
                {channelType === 'DEX' && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Select Wallet</Text>
                    <View style={styles.exchangeGrid}>
                      {dexWallets.map(ex => (
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
            )}

            {/* Form — Step 2: permissions + API credentials */}
            {modalStep === 2 && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>

                {/* Selected exchange header */}
                {(() => {
                  const ex = [...exchanges, ...dexWallets].find(e => e.id === selectedExchange);
                  const isDex = dexWallets.some(w => w.id === selectedExchange);
                  return ex ? (
                    <View style={styles.step2ExchangeRow}>
                      <Image source={{ uri: ex.image }} style={styles.step2ExchangeLogo} resizeMode="contain" />
                      <View>
                        <Text style={styles.step2ExchangeName}>{ex.name}</Text>
                        <Text style={styles.step2ExchangeSub}>{isDex ? 'Connect on-chain wallet' : 'Configure data access'}</Text>
                      </View>
                    </View>
                  ) : null;
                })()}

                {/* DEX: wallet address input / CEX: permissions + guide + API keys */}
                {dexWallets.some(w => w.id === selectedExchange) ? (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Wallet Address</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="Paste your wallet public address"
                      placeholderTextColor="#555555"
                      value={walletAddress}
                      onChangeText={setWalletAddress}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Text style={styles.fieldHint}>Your public wallet address is read-only. We never ask for your seed phrase or private key.</Text>
                  </View>
                ) : (
                  <>
                    {/* Permissions checklist */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Data Permissions</Text>

                      {([
                        { label: 'Trade History',   value: permTrades,      setter: setPermTrades,      desc: 'All buy/sell fills — used for PnL and AI insights' },
                        { label: 'Deposit History', value: permDeposits,    setter: setPermDeposits,    desc: 'Inbound transfers to your exchange account' },
                        { label: 'Withdrawals',     value: permWithdrawals, setter: setPermWithdrawals, desc: 'Outbound transfers from your exchange account' },
                      ] as const).map(({ label, value, setter, desc }) => (
                        <TouchableOpacity key={label} style={styles.permRow} activeOpacity={0.8} onPress={() => setter(!value)}>
                          <View style={[styles.permCheck, value && styles.permCheckActive]}>
                            {value && <Text style={styles.permCheckTick}>✓</Text>}
                          </View>
                          <View style={styles.permTextCol}>
                            <Text style={styles.permLabel}>{label}</Text>
                            <Text style={styles.permDesc}>{desc}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Import Historical Data toggle */}
                    <View style={styles.fieldGroup}>
                      <TouchableOpacity style={styles.importToggleRow} activeOpacity={0.85} onPress={toggleImport}>
                        <View style={styles.importToggleText}>
                          <Text style={styles.permLabel}>Import Historical Data</Text>
                          <Text style={styles.permDesc}>Select a date range to pull past transactions</Text>
                        </View>
                        <Animated.View style={[styles.toggleTrack, { backgroundColor: importToggleAnim.interpolate({ inputRange: [0,1], outputRange: ['#333333','#F26522'] }) }]}>
                          <Animated.View style={[styles.toggleThumb, { transform: [{ translateX: importToggleAnim.interpolate({ inputRange: [0,1], outputRange: [2, 22] }) }] }]} />
                        </Animated.View>
                      </TouchableOpacity>

                      {importEnabled && (
                        <View style={styles.importRangeBlock}>
                          {/* From / To date buttons */}
                          <View style={styles.importDateRow}>
                            <TouchableOpacity
                              style={[styles.importDateBtn, calTarget === 'from' && styles.importDateBtnActive]}
                              onPress={() => calTarget === 'from' ? setCalTarget(null) : openCal('from', importFrom)}
                            >
                              <Text style={styles.importDateLabel}>From</Text>
                              <Text style={styles.importDateValue}>{fmtDate(importFrom)}</Text>
                            </TouchableOpacity>

                            <Text style={styles.importDateArrow}>→</Text>

                            <TouchableOpacity
                              style={[styles.importDateBtn, calTarget === 'to' && styles.importDateBtnActive]}
                              onPress={() => calTarget === 'to' ? setCalTarget(null) : openCal('to', importTo)}
                            >
                              <Text style={styles.importDateLabel}>To</Text>
                              <Text style={styles.importDateValue}>{fmtDate(importTo)}</Text>
                            </TouchableOpacity>
                          </View>

                          {/* Inline calendar */}
                          {calTarget !== null && (
                            <View style={styles.calendarBox}>
                              {/* Month navigation */}
                              <View style={styles.calHeader}>
                                <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}><Text style={styles.calNavArrow}>‹</Text></TouchableOpacity>
                                <Text style={styles.calMonthLabel}>{MONTHS[calMonth]} {calYear}</Text>
                                <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}><Text style={styles.calNavArrow}>›</Text></TouchableOpacity>
                              </View>

                              {/* Day-of-week headers */}
                              <View style={styles.calDayRow}>
                                {DAYS.map(d => <Text key={d} style={styles.calDayHeader}>{d}</Text>)}
                              </View>

                              {/* Day grid */}
                              <View style={styles.calGrid}>
                                {buildCalDays().map((day, idx) => {
                                  if (!day) return <View key={`e${idx}`} style={styles.calCell} />;
                                  const thisDate  = new Date(calYear, calMonth, day);
                                  const isFrom    = thisDate.toDateString() === importFrom.toDateString();
                                  const isTo      = thisDate.toDateString() === importTo.toDateString();
                                  const inRange   = importEnabled && thisDate > importFrom && thisDate < importTo;
                                  const isActive  = isFrom || isTo;
                                  return (
                                    <TouchableOpacity
                                      key={day}
                                      style={[styles.calCell, inRange && styles.calCellInRange, isActive && styles.calCellActive]}
                                      onPress={() => selectDay(day)}
                                      activeOpacity={0.7}
                                    >
                                      <Text style={[styles.calDayText, isActive && styles.calDayTextActive]}>{day}</Text>
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            </View>
                          )}
                        </View>
                      )}
                    </View>

                    {/* How to get API keys — collapsible guide */}
                    <View style={styles.fieldGroup}>
                      <TouchableOpacity style={styles.guideHeader} activeOpacity={0.8} onPress={toggleGuide}>
                        <Text style={styles.guideHeaderText}>How to get your API keys</Text>
                        <Animated.Text style={[styles.guideChevron, { transform: [{ rotate: guideAnim.interpolate({ inputRange: [0,1], outputRange: ['0deg','180deg'] }) }] }]}>
                          ›
                        </Animated.Text>
                      </TouchableOpacity>

                      {guideOpen && (
                        <View style={styles.guideBody}>
                          {currentGuide.steps.map((step, i) => (
                            <View key={i} style={styles.guideStep}>
                              <View style={styles.guideStepNum}>
                                <Text style={styles.guideStepNumText}>{i + 1}</Text>
                              </View>
                              <Text style={styles.guideStepText}>{step}</Text>
                            </View>
                          ))}
                          {currentGuide.url ? (
                            <TouchableOpacity
                              style={styles.guideLinkBtn}
                              activeOpacity={0.8}
                              onPress={() => {
                                if (typeof window !== 'undefined') window.open(currentGuide.url, '_blank');
                              }}
                            >
                              <Text style={styles.guideLinkText}>Open {[...exchanges, ...dexWallets].find(e => e.id === selectedExchange)?.name ?? 'Exchange'} API settings →</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      )}
                    </View>

                    {/* API credentials */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>API Key</Text>
                      <TextInput
                        style={styles.fieldInput}
                        placeholder="Paste your API key"
                        placeholderTextColor="#555555"
                        secureTextEntry
                        value={apiKey}
                        onChangeText={setApiKey}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>API Secret</Text>
                      <TextInput
                        style={styles.fieldInput}
                        placeholder="Paste your API secret"
                        placeholderTextColor="#555555"
                        secureTextEntry
                        value={apiSecret}
                        onChangeText={setApiSecret}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <Text style={styles.fieldHint}>Your keys are encrypted with AES-256 immediately on the server and never stored in plain text.</Text>
                    </View>
                  </>
                )}

                {/* Terms */}
                <TouchableOpacity style={styles.termsRow} activeOpacity={0.8} onPress={() => setTermsAgreed(!termsAgreed)}>
                  <View style={[styles.permCheck, termsAgreed && styles.permCheckActive]}>
                    {termsAgreed && <Text style={styles.permCheckTick}>✓</Text>}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to Lejerli's{' '}
                    <Text style={styles.termsLink}>Terms & Conditions</Text>
                    {' '}and authorise read-only access to my exchange data.
                  </Text>
                </TouchableOpacity>

              </ScrollView>
            )}

            <View style={styles.modalDivider} />

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.8}
                onPress={() => {
                  if (modalStep === 2) { setModalStep(1); }
                  else { setCreateModalVisible(false); resetForm(); }
                }}
              >
                <Text style={styles.cancelBtnText}>{modalStep === 2 ? '← Back' : 'Cancel'}</Text>
              </TouchableOpacity>

              {(() => {
                const isDex = dexWallets.some(w => w.id === selectedExchange);
                const connectDisabled = !termsAgreed || (isDex ? !walletAddress : (!apiKey || !apiSecret));
                return modalStep === 1 ? (
                  <TouchableOpacity
                    style={[styles.confirmBtn, !selectedExchange && styles.confirmBtnDisabled]}
                    activeOpacity={selectedExchange ? 0.85 : 1}
                    onPress={() => { if (selectedExchange) setModalStep(2); }}
                  >
                    <Text style={styles.confirmBtnText}>Continue</Text>
                    <Text style={styles.confirmBtnArrow}>→</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.confirmBtn, connectDisabled && styles.confirmBtnDisabled]}
                    activeOpacity={connectDisabled ? 1 : 0.85}
                    onPress={async () => {
                      if (connectDisabled || !selectedExchange) return;
                      try {
                        if (isDex) {
                          await walletService.connectDex(selectedExchange, walletAddress);
                        } else {
                          await walletService.connect(selectedExchange, apiKey, apiSecret);
                          await channelService.syncChannel(
                            selectedExchange,
                            { trades: permTrades, deposits: permDeposits, withdrawals: permWithdrawals },
                            importEnabled ? { from: importFrom.toISOString(), to: importTo.toISOString() } : undefined
                          );
                        }
                        setCreateModalVisible(false);
                        resetForm();
                        fetchChannels();
                      } catch (_) {}
                    }}
                  >
                    <Text style={styles.confirmBtnText}>Connect</Text>
                    <Text style={styles.confirmBtnArrow}>→</Text>
                  </TouchableOpacity>
                );
              })()}
            </View>

          </View>
        </View>
      </Modal>

      {/* ── Create Tree Modal ──────────────────────────────────────────────── */}
      <Modal visible={treeModalVisible} transparent animationType="fade" onRequestClose={() => { setTreeModalVisible(false); resetTree(); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 680 }]}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{editingTree ? 'Edit Tree' : 'Create Tree'}</Text>
                <Text style={styles.modalSubtitle}>
                  {editingTree
                    ? 'Update assets and entry margins'
                    : treeStep === 1 ? 'Select a connected channel' : 'Select assets and set your entry margin'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => { setTreeModalVisible(false); resetTree(); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Image source={require('../../../assets/cross.png')} style={styles.modalCloseIcon} resizeMode="contain" tintColor="#888888" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            {/* Step 1 — Channel selection */}
            {treeStep === 1 && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {connectedAccounts.length === 0 ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <Text style={styles.emptyStateText}>No channels connected yet.</Text>
                    <Text style={styles.emptyStateSub}>Connect a channel first before creating a tree.</Text>
                  </View>
                ) : (
                  <View style={{ gap: 10 }}>
                    {connectedAccounts.map(acct => {
                      const ex = exchanges.find(e => e.id === acct.exchange);
                      return (
                        <TouchableOpacity
                          key={acct.exchange}
                          style={[styles.treeChannelCard, treeChannel === acct.exchange && styles.treeChannelCardActive]}
                          activeOpacity={0.8}
                          onPress={() => setTreeChannel(acct.exchange)}
                        >
                          {ex?.image
                            ? <Image source={{ uri: ex.image }} style={styles.treeChannelLogo} resizeMode="contain" />
                            : <View style={[styles.treeChannelLogo, { backgroundColor: '#222' }]} />
                          }
                          <View style={{ flex: 1 }}>
                            <Text style={styles.treeChannelName}>{ex?.name ?? acct.exchange}</Text>
                            <Text style={styles.treeChannelSub}>
                              {acct.snapshot?.assetCount ?? 0} assets · ${parseFloat(acct.snapshot?.totalUSD ?? '0').toLocaleString('en-US', { maximumFractionDigits: 2 })} total
                            </Text>
                          </View>
                          <View style={[styles.treeChannelRadio, treeChannel === acct.exchange && styles.treeChannelRadioActive]}>
                            {treeChannel === acct.exchange && <View style={styles.treeChannelRadioDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            )}

            {/* Step 2 — Asset list + margin inputs */}
            {treeStep === 2 && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>

                {/* Column headers */}
                <View style={styles.treeTableHeader}>
                  <Text style={[styles.treeTableHeaderText, { flex: 2 }]}>Asset</Text>
                  <Text style={[styles.treeTableHeaderText, { flex: 2, textAlign: 'right' }]}>Live Price</Text>
                  <Text style={[styles.treeTableHeaderText, { flex: 2, textAlign: 'center' }]}>Margin %</Text>
                  <Text style={[styles.treeTableHeaderText, { flex: 2, textAlign: 'right' }]}>Entry Price</Text>
                  <Text style={[styles.treeTableHeaderText, { flex: 2, textAlign: 'right' }]}>EPPT (Expected Profit per trade)</Text>
                  <View style={{ width: 28 }} />
                </View>

                {pricesLoading && treeAssets.length === 0 && (
                  <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                    <Text style={styles.emptyStateSub}>Loading assets…</Text>
                  </View>
                )}

                {treeAssets.map(row => (
                  <TouchableOpacity
                    key={row.asset}
                    style={[styles.treeAssetRow, row.selected && styles.treeAssetRowSelected]}
                    activeOpacity={0.85}
                    onPress={() => toggleTreeAsset(row.asset)}
                  >
                    {/* Token icon */}
                    {tokenIcons[row.asset]
                      ? <Image source={{ uri: tokenIcons[row.asset] }} style={styles.treeAssetIcon} />
                      : <View style={styles.treeAssetIconPlaceholder}><Text style={styles.treeAssetIconText}>{row.asset.charAt(0)}</Text></View>
                    }
                    {/* Asset name */}
                    <Text style={[styles.treeAssetName, { flex: 2 }]}>{row.asset}</Text>

                    {/* Live price */}
                    <Text style={[styles.treeAssetPrice, { flex: 2, textAlign: 'right' }]}>
                      {pricesLoading && row.livePrice === null ? '…' : fmtLive(row.livePrice)}
                    </Text>

                    {/* Margin input */}
                    <View style={[styles.treeMarginInputWrap, { flex: 2 }]}>
                      <TextInput
                        style={styles.treeMarginInput}
                        placeholder="0"
                        placeholderTextColor="#444"
                        keyboardType="decimal-pad"
                        value={row.margin}
                        onChangeText={v => setAssetMargin(row.asset, v)}
                        onFocus={() => { if (!row.selected) toggleTreeAsset(row.asset); }}
                      />
                      <Text style={styles.treeMarginPct}>%</Text>
                    </View>

                    {/* Entry price */}
                    <Text style={[
                      styles.treeEntryPrice,
                      { flex: 2, textAlign: 'right' },
                      row.margin !== '' && row.livePrice !== null && styles.treeEntryPriceActive,
                    ]}>
                      {entryPrice(row.livePrice, row.margin)}
                    </Text>

                    {/* Profit-Gross */}
                    <Text style={[
                      styles.treeProfitGross,
                      { flex: 2, textAlign: 'right' },
                      calcProfitGross(row.livePrice, row.margin) !== null && styles.treeProfitGrossActive,
                    ]}>
                      {fmtProfitGross(row.livePrice, row.margin)}
                    </Text>

                    {/* Checkbox */}
                    <View style={[styles.treeCheckbox, row.selected && styles.treeCheckboxActive]}>
                      {row.selected && <Text style={styles.treeCheckboxTick}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Profit-Gross summary bar */}
                {(() => {
                  const selected = treeAssets.filter(r => r.selected && r.margin !== '' && r.livePrice !== null);
                  if (selected.length === 0) return null;
                  const totalGross = selected.reduce((sum, r) => {
                    return sum + (calcProfitGross(r.livePrice, r.margin) ?? 0);
                  }, 0);
                  return (
                    <View style={styles.treeSummaryBar}>
                      <View style={styles.treeSummaryItem}>
                        <Text style={styles.treeSummaryLabel}>Selected</Text>
                        <Text style={styles.treeSummaryValue}>{selected.length} asset{selected.length !== 1 ? 's' : ''}</Text>
                      </View>
                      <View style={styles.treeSummaryDivider} />
                      <View style={styles.treeSummaryItem}>
                        <Text style={styles.treeSummaryLabel}>Total EPPT</Text>
                        <Text style={[styles.treeSummaryValue, styles.treeSummaryHighlight]}>{fmtPrice(totalGross)}</Text>
                      </View>
                      <View style={styles.treeSummaryDivider} />
                      <View style={styles.treeSummaryItem}>
                        <Text style={styles.treeSummaryLabel}>Avg Margin</Text>
                        <Text style={styles.treeSummaryValue}>
                          {(selected.reduce((s, r) => s + parseFloat(r.margin), 0) / selected.length).toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  );
                })()}

              </ScrollView>
            )}

            <View style={styles.modalDivider} />

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.8}
                onPress={() => {
                  if (treeStep === 2 && !editingTree) setTreeStep(1);
                  else { setTreeModalVisible(false); resetTree(); }
                }}
              >
                <Text style={styles.cancelBtnText}>{treeStep === 2 && !editingTree ? '← Back' : 'Cancel'}</Text>
              </TouchableOpacity>

              {treeStep === 1 ? (
                <TouchableOpacity
                  style={[styles.confirmBtn, !treeChannel && styles.confirmBtnDisabled]}
                  activeOpacity={treeChannel ? 0.85 : 1}
                  onPress={() => { if (treeChannel) loadTreeChannel(treeChannel); }}
                >
                  <Text style={styles.confirmBtnText}>Continue</Text>
                  <Text style={styles.confirmBtnArrow}>→</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.confirmBtn, treeAssets.filter(r => r.selected).length === 0 && styles.confirmBtnDisabled]}
                  activeOpacity={treeAssets.filter(r => r.selected).length > 0 ? 0.85 : 1}
                  onPress={async () => {
                    const selected = treeAssets.filter(r => r.selected && r.livePrice !== null);
                    if (!selected.length || !treeChannel) return;
                    const payload = {
                      channelId: treeChannel,
                      assets: selected.map(r => ({
                        asset:           r.asset,
                        margin:          parseFloat(r.margin) || 0,
                        priceAtCreation: r.livePrice,
                      })),
                    };
                    try {
                      if (editingTree) {
                        await treeService.updateTree(editingTree._id, payload);
                      } else {
                        await treeService.createTree(payload);
                      }
                    } catch (_) {}
                    setTreeModalVisible(false);
                    resetTree();
                    fetchTrees();
                  }}
                >
                  <Text style={styles.confirmBtnText}>{editingTree ? 'Save Changes' : 'Create Tree'}</Text>
                  <Text style={styles.confirmBtnArrow}>→</Text>
                </TouchableOpacity>
              )}
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

            {/* Action buttons row */}
            <View style={styles.actionBtnRow}>
              <TouchableOpacity style={styles.createChannelBtn} activeOpacity={0.85} onPress={() => setCreateModalVisible(true)}>
                <Image source={require('../../../assets/cross.png')} style={styles.createChannelIcon} resizeMode="contain" tintColor="#ffffff" />
                <Text style={styles.createChannelText} numberOfLines={1}>Create Channel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createTreeBtn} activeOpacity={0.85} onPress={() => { resetTree(); setTreeModalVisible(true); }}>
                <Text style={styles.createTreeText} numberOfLines={1}>Create Tree</Text>
              </TouchableOpacity>
            </View>

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

          {/* Connected Accounts */}
          {connectedAccounts.length > 0 && (
            <View style={styles.connectedSection}>
              {connectedAccounts.map(acct => {
                const ex = exchanges.find(e => e.id === acct.exchange);
                const fmtSynced = acct.lastSynced
                  ? new Date(acct.lastSynced).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Never';
                return (
                  <View key={acct.exchange} style={styles.connectedCard}>
                    <View style={styles.connectedCardLeft}>
                      {ex?.image ? (
                        <Image source={{ uri: ex.image }} style={styles.connectedLogo} resizeMode="contain" />
                      ) : (
                        <View style={styles.connectedLogoPlaceholder}>
                          <Text style={styles.connectedLogoPlaceholderText}>{acct.exchange.charAt(0).toUpperCase()}</Text>
                        </View>
                      )}
                      <View>
                        <Text style={styles.connectedName}>{ex?.name ?? acct.exchange}</Text>
                        <Text style={styles.connectedSub}>Last synced {fmtSynced}</Text>
                      </View>
                    </View>
                    <View style={styles.connectedCardRight}>
                      {acct.snapshot?.totalUSD != null && (
                        <View style={styles.connectedStat}>
                          <Text style={styles.connectedStatValue}>${parseFloat(acct.snapshot.totalUSD).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                          <Text style={styles.connectedStatLabel}>Total Value</Text>
                        </View>
                      )}
                      <View style={styles.connectedStat}>
                        <Text style={styles.connectedStatValue}>{acct.snapshot?.assetCount ?? 0}</Text>
                        <Text style={styles.connectedStatLabel}>Assets</Text>
                      </View>
                      <View style={styles.connectedStatusDot} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Channels Table */}
          {filteredChannels.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No channels connected yet.</Text>
              <Text style={styles.emptyStateSub}>Click Create Channel to connect your first exchange or bank account.</Text>
            </View>
          )}
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

          {/* ── Trees Section ── */}
          {trees.length > 0 && (
            <View style={styles.treesSection}>

              {/* Section header */}
              <View style={styles.treesSectionHeader}>
                <Text style={styles.treesSectionTitle}>Trees</Text>
                <Text style={styles.treesSectionSub}>Asset tracking strategies with entry margins</Text>
              </View>

              {/* Trees table header */}
              <View style={styles.treesTableHead}>
                <Text style={[styles.treesHeadCell, { flex: 2 }]}>Channel</Text>
                <Text style={[styles.treesHeadCell, { flex: 3 }]}>Assets</Text>
                <Text style={[styles.treesHeadCell, { flex: 1, textAlign: 'right' }]}>Avg Margin</Text>
                <Text style={[styles.treesHeadCell, { flex: 2, textAlign: 'right' }]}>Entry Prices</Text>
                <Text style={[styles.treesHeadCell, { flex: 2, textAlign: 'right' }]}>EPPT (Expected Profit per trade)</Text>
                <Text style={[styles.treesHeadCell, { flex: 2, textAlign: 'right' }]}>Profit-Net</Text>
                <Text style={[styles.treesHeadCell, { flex: 2, textAlign: 'right' }]}>Created</Text>
                <View style={{ width: 72 }} />
              </View>

              {trees.map((tree, idx) => {
                const ex          = exchanges.find(e => e.id === tree.channelId);
                const avgMargin   = tree.assets.length
                  ? (tree.assets.reduce((s, a) => s + a.margin, 0) / tree.assets.length).toFixed(1)
                  : '—';
                const assetNames  = tree.assets.map(a => a.asset).join(', ');
                const entryPrices = tree.assets.map(a => fmtPrice(a.entryPrice)).join(' / ');
                const created     = new Date(tree.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                return (
                  <View key={tree._id}>
                    <View style={styles.treesTableRow}>

                      {/* Channel */}
                      <View style={[styles.treesRowCell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                        {ex?.image
                          ? <Image source={{ uri: ex.image }} style={styles.treesExchangeLogo} resizeMode="contain" />
                          : <View style={[styles.treesExchangeLogo, { backgroundColor: '#222' }]} />
                        }
                        <Text style={styles.treesBodyText}>{ex?.name ?? tree.channelId}</Text>
                      </View>

                      {/* Assets */}
                      <View style={[styles.treesRowCell, { flex: 3 }]}>
                        <Text style={styles.treesBodyText} numberOfLines={1}>{assetNames}</Text>
                      </View>

                      {/* Avg margin */}
                      <View style={[styles.treesRowCell, { flex: 1, alignItems: 'flex-end' }]}>
                        <Text style={styles.treesBodyText}>{avgMargin}%</Text>
                      </View>

                      {/* Entry prices */}
                      <View style={[styles.treesRowCell, { flex: 2, alignItems: 'flex-end' }]}>
                        <Text style={[styles.treesBodyText, { color: '#F26522' }]} numberOfLines={1}>{entryPrices}</Text>
                      </View>

                      {/* EPPT (was Profit-Gross) */}
                      <View style={[styles.treesRowCell, { flex: 2, alignItems: 'flex-end' }]}>
                        <Text style={styles.treesProfitText}>{fmtPrice(tree.totalProfitGross)}</Text>
                      </View>

                      {/* Profit-Net */}
                      <View style={[styles.treesRowCell, { flex: 2, alignItems: 'flex-end' }]}>
                        <Text style={[styles.treesProfitText, (tree.profitNet || 0) >= 0 ? { color: '#22c55e' } : { color: '#ef4444' }]}>
                          {fmtPrice(tree.profitNet || 0)}
                        </Text>
                      </View>

                      {/* Created */}
                      <View style={[styles.treesRowCell, { flex: 2, alignItems: 'flex-end' }]}>
                        <Text style={styles.treesSubText}>{created}</Text>
                      </View>

                      {/* Edit button */}
                      <TouchableOpacity
                        style={styles.treesEditBtn}
                        activeOpacity={0.8}
                        onPress={() => {
                          const preFill: Record<string, number> = {};
                          tree.assets.forEach(a => { preFill[a.asset] = a.margin; });
                          setEditingTree(tree);
                          setTreeModalVisible(true);
                          loadTreeChannel(tree.channelId, preFill);
                        }}
                      >
                        <Text style={styles.treesEditBtnText}>Edit</Text>
                      </TouchableOpacity>

                    </View>
                    {idx < trees.length - 1 && <View style={styles.tableRowDivider} />}
                  </View>
                );
              })}

              {/* Total EPPT / Profit-Net footer */}
              <View style={styles.treesTotalRow}>
                <Text style={styles.treesTotalLabel}>Total EPPT across all trees</Text>
                <Text style={styles.treesTotalValue}>
                  {fmtPrice(trees.reduce((s, t) => s + t.totalProfitGross, 0))}
                </Text>
              </View>

            </View>
          )}

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
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  createTreeBtn: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F26522',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  createTreeText: {
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 13,
    color: '#F26522',
  },

  // ── Tree modal ────────────────────────────────────────────────────────────
  treeChannelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: '#0f0f0f',
  },
  treeChannelCardActive: {
    borderColor: '#F26522',
    backgroundColor: '#1a0e08',
  },
  treeChannelLogo: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  treeChannelName: {
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 3,
  },
  treeChannelSub: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 11,
    color: '#555',
  },
  treeChannelRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#383838',
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeChannelRadioActive: {
    borderColor: '#F26522',
  },
  treeChannelRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F26522',
  },
  treeTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    marginBottom: 4,
  },
  treeTableHeaderText: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 11,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  treeAssetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#141414',
    borderRadius: 4,
  },
  treeAssetRowSelected: {
    backgroundColor: '#1a0e0820',
  },
  treeAssetIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  treeAssetIconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeAssetIconText: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 11,
    color: '#F26522',
  },
  treeAssetName: {
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 13,
    color: '#ffffff',
  },
  treeAssetPrice: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 13,
    color: '#888',
  },
  treeMarginInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  treeMarginInput: {
    width: 56,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#111',
    paddingHorizontal: 8,
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
  },
  treeMarginPct: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 12,
    color: '#555',
  },
  treeEntryPrice: {
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 13,
    color: '#555',
  },
  treeEntryPriceActive: {
    color: '#F26522',
  },
  treeCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#383838',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  treeCheckboxActive: {
    backgroundColor: '#F26522',
    borderColor: '#F26522',
  },
  treeCheckboxTick: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    lineHeight: 13,
  },
  treeProfitGross: {
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 13,
    color: '#383838',
  },
  treeProfitGrossActive: {
    color: '#22c55e',
  },
  treeSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    backgroundColor: '#0d0d0d',
    gap: 0,
  },
  treeSummaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  treeSummaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#1f1f1f',
  },
  treeSummaryLabel: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 11,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  treeSummaryValue: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 15,
    color: '#ffffff',
  },
  treeSummaryHighlight: {
    color: '#22c55e',
  },

  // ── Trees section ─────────────────────────────────────────────────────────
  treesSection: {
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  treesSectionHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    backgroundColor: '#0d0d0d',
  },
  treesSectionTitle: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 2,
  },
  treesSectionSub: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 12,
    color: '#555',
  },
  treesTableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  treesHeadCell: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 11,
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  treesTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#0a0a0a',
  },
  treesRowCell: {
    justifyContent: 'center',
  },
  treesExchangeLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  treesBodyText: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 13,
    color: '#cccccc',
  },
  treesProfitText: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 13,
    color: '#22c55e',
  },
  treesSubText: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 12,
    color: '#555',
  },
  treesTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#0d0d0d',
  },
  treesTotalLabel: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 13,
    color: '#555',
  },
  treesTotalValue: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 16,
    color: '#22c55e',
  },
  treesEditBtn: {
    width: 56,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#383838',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    alignSelf: 'center',
  },
  treesEditBtnText: {
    fontFamily: 'GeneralSans',
    fontWeight: '500',
    fontSize: 12,
    color: '#aaaaaa',
  },

  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 15,
    color: '#555555',
    marginBottom: 6,
  },
  emptyStateSub: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 13,
    color: '#383838',
    textAlign: 'center',
    maxWidth: 360,
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

  // ── Connected accounts ────────────────────────────────────────────────────
  connectedSection: {
    marginBottom: 24,
    gap: 10,
  },
  connectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  connectedCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  connectedLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  connectedLogoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedLogoPlaceholderText: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 14,
    color: '#F26522',
  },
  connectedName: {
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 3,
  },
  connectedSub: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 11,
    color: '#555555',
  },
  connectedCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  connectedStat: {
    alignItems: 'flex-end',
  },
  connectedStatValue: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 2,
  },
  connectedStatLabel: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 11,
    color: '#555555',
  },
  connectedStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },

  // ── Import toggle ─────────────────────────────────────────────────────────
  importToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  importToggleText: { flex: 1, marginRight: 16 },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    flexShrink: 0,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  importRangeBlock: {
    marginTop: 16,
    gap: 12,
  },
  importDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  importDateBtn: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  importDateBtnActive: {
    borderColor: '#F26522',
  },
  importDateLabel: {
    fontFamily: 'GeneralSans',
    fontSize: 11,
    fontWeight: '500',
    color: '#737373',
    marginBottom: 2,
  },
  importDateValue: {
    fontFamily: 'GeneralSans',
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  importDateArrow: {
    fontSize: 16,
    color: '#555555',
  },

  // ── Calendar ───────────────────────────────────────────────────────────────
  calendarBox: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    padding: 14,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calNavBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#282828',
    borderRadius: 6,
  },
  calNavArrow: {
    fontSize: 18,
    color: '#ffffff',
    lineHeight: 22,
  },
  calMonthLabel: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
  },
  calDayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'GeneralSans',
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  calCellInRange: {
    backgroundColor: 'rgba(242,101,34,0.15)',
    borderRadius: 0,
  },
  calCellActive: {
    backgroundColor: '#F26522',
    borderRadius: 6,
  },
  calDayText: {
    fontFamily: 'GeneralSans',
    fontSize: 13,
    color: '#cccccc',
  },
  calDayTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  confirmBtnDisabled: {
    backgroundColor: '#3a2a1a',
    opacity: 0.5,
  },

  // ── Step 2 ────────────────────────────────────────────────────────────────
  step2ExchangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  step2ExchangeLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  step2ExchangeName: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 16,
    color: '#ffffff',
  },
  step2ExchangeSub: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 12,
    color: '#737373',
    marginTop: 2,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  permCheck: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#444444',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  permCheckActive: {
    backgroundColor: '#F26522',
    borderColor: '#F26522',
  },
  permCheckTick: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
    lineHeight: 14,
  },
  permTextCol: {
    flex: 1,
  },
  permLabel: {
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 2,
  },
  permDesc: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 12,
    color: '#737373',
    lineHeight: 18,
  },
  fieldHint: {
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 11,
    color: '#555555',
    marginTop: 8,
    lineHeight: 16,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  termsText: {
    flex: 1,
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 13,
    color: '#888888',
    lineHeight: 20,
  },
  termsLink: {
    color: '#F26522',
    fontWeight: '600',
  },

  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1a1a1a',
  },
  guideHeaderText: {
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 13,
    color: '#F26522',
  },
  guideChevron: {
    fontSize: 20,
    color: '#F26522',
    lineHeight: 22,
  },
  guideBody: {
    marginTop: 10,
    paddingHorizontal: 4,
    gap: 12,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guideStepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F26522',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  guideStepNumText: {
    fontFamily: 'GeneralSans',
    fontWeight: '700',
    fontSize: 11,
    color: '#ffffff',
    lineHeight: 13,
  },
  guideStepText: {
    flex: 1,
    fontFamily: 'GeneralSans',
    fontWeight: '400',
    fontSize: 13,
    color: '#cccccc',
    lineHeight: 20,
  },
  guideLinkBtn: {
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F26522',
    alignItems: 'center',
  },
  guideLinkText: {
    fontFamily: 'GeneralSans',
    fontWeight: '600',
    fontSize: 13,
    color: '#F26522',
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
