import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import chatService, { ChatKind, ChatMessage, RoomDetail } from '../../services/chatService';
import BackButton from '../../components/common/BackButton';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../constants/theme';

type ChannelSource = 'LINE' | 'BACKSTAGE' | 'FLOOR';

interface ActiveChannel {
  id: string;
  source: ChannelSource;
}

// ── Playful dot-grid background ────────────────────────────────────────────────

function ChatBackground({ color }: { color: string }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="dots" patternUnits="userSpaceOnUse" width={22} height={22}>
            <Circle cx={11} cy={11} r={1.1} fill={color} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dots)" />
      </Svg>
    </View>
  );
}

// ── Date separator ─────────────────────────────────────────────────────────────

function DateSep({ label, s }: { label: string; s: ReturnType<typeof makeStyles> }) {
  return (
    <View style={s.dateSep}>
      <View style={s.dateLine} />
      <Text style={s.dateText}>{label}</Text>
      <View style={s.dateLine} />
    </View>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  if (d.toDateString() === today)     return 'Today';
  if (d.toDateString() === yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ── Message bubble ─────────────────────────────────────────────────────────────

interface BubbleProps {
  msg: ChatMessage;
  isOwn: boolean;
  isBackstage: boolean;
  s: ReturnType<typeof makeStyles>;
}

function Bubble({ msg, isOwn, isBackstage, s }: BubbleProps) {
  return (
    <View style={[s.bubbleWrap, isOwn ? s.bubbleWrapOwn : s.bubbleWrapOther, isBackstage && s.bubbleWrapBackstage]}>
      {isBackstage && <Text style={s.backstageTag}>BACKSTAGE</Text>}
      <View style={[s.bubble, isOwn ? s.bubbleOwn : s.bubbleOther, isBackstage && s.bubbleBackstage]}>
        <Text style={[s.bubbleText, isOwn && s.bubbleTextOwn]}>{msg.body?.text}</Text>
      </View>
      <Text style={[s.bubbleTime, isOwn && s.bubbleTimeOwn]}>{fmtTime(msg.createdAt)}</Text>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────

type ListItem =
  | { type: 'msg';  data: ChatMessage; source: ChannelSource }
  | { type: 'date'; label: string; key: string };

const PAGE_SIZE = 50;

export default function ChatRoomScreen() {
  const params = useLocalSearchParams<{ id: string; kind?: string; title?: string }>();
  const id = params.id;
  const kind: ChatKind = params.kind === 'ROOM' ? 'ROOM' : 'FLOOR';
  const router          = useRouter();
  const { user, token } = useAuth();
  const { colors }      = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [loadingSetup, setLoadingSetup]     = useState(true);
  const [roomDetail, setRoomDetail]         = useState<RoomDetail | null>(null);
  const [headerTitle, setHeaderTitle]       = useState(params.title ?? '');
  const [activeChannels, setActiveChannels] = useState<ActiveChannel[]>([]);
  const [permitted, setPermitted]           = useState<ChannelSource[]>([]);
  const [selected, setSelected]             = useState<ChannelSource | null>(null);
  const [disclosureVisible, setDisclosureVisible] = useState(false);

  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, ChatMessage[]>>({});
  const [hasMoreByChannel, setHasMoreByChannel]   = useState<Record<string, boolean>>({});
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText]               = useState('');

  const flatRef = useRef<FlatList>(null);
  const seenIds = useRef(new Set<string>());
  const channelSourceMap = useRef<Record<string, ChannelSource>>({});

  // ── Resolve what this screen is looking at ──────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setLoadingSetup(true);

    async function setup() {
      if (kind === 'FLOOR') {
        channelSourceMap.current = { [id]: 'FLOOR' };
        if (cancelled) return;
        setActiveChannels([{ id, source: 'FLOOR' }]);
        setPermitted(['FLOOR']);
        setSelected('FLOOR');
        setLoadingSetup(false);
        return;
      }

      const res = await chatService.getRoomDetail(id);
      if (cancelled) return;
      if (!res.success) {
        setLoadingSetup(false);
        return;
      }

      const detail = res.data;
      setRoomDetail(detail);
      if (!params.title) {
        setHeaderTitle(detail.role === 'PARTNER' ? detail.deskName : detail.partnerDisplayName);
      }

      if (detail.role === 'PARTNER') {
        channelSourceMap.current = { [detail.lineChannelId]: 'LINE' };
        setActiveChannels([{ id: detail.lineChannelId, source: 'LINE' }]);
        setPermitted(['LINE']);
        setSelected('LINE');
        setDisclosureVisible(!detail.disclosureAcknowledgedAt);
      } else {
        channelSourceMap.current = {
          [detail.lineChannelId]: 'LINE',
          [detail.backstageChannelId]: 'BACKSTAGE',
        };
        setActiveChannels([
          { id: detail.lineChannelId, source: 'LINE' },
          { id: detail.backstageChannelId, source: 'BACKSTAGE' },
        ]);
        const canPost: ChannelSource[] =
          detail.role === 'PRINCIPAL' || detail.role === 'LEAD' ? ['LINE', 'BACKSTAGE']
          : detail.role === 'TRADER' ? ['BACKSTAGE']
          : [];
        setPermitted(canPost);
        setSelected(canPost[0] ?? null);
      }
      setLoadingSetup(false);
    }

    setup();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, kind]);

  // ── Connect, join, load history, subscribe ──────────────────────────────────

  useEffect(() => {
    if (loadingSetup || !token || activeChannels.length === 0) return;

    chatService.connect(token);
    activeChannels.forEach(c => chatService.joinChannel(c.id));

    let cancelled = false;
    setLoading(true);

    (async () => {
      const results = await Promise.all(
        activeChannels.map(c => chatService.getMessages(c.id))
      );
      if (cancelled) return;

      const nextMessages: Record<string, ChatMessage[]> = {};
      const nextHasMore: Record<string, boolean> = {};
      results.forEach((res, i) => {
        const c = activeChannels[i];
        if (res.success) {
          nextMessages[c.id] = res.data;
          nextHasMore[c.id] = res.data.length >= PAGE_SIZE;
          res.data.forEach(m => seenIds.current.add(m._id));
        } else {
          nextMessages[c.id] = [];
          nextHasMore[c.id] = false;
        }
      });
      setMessagesByChannel(nextMessages);
      setHasMoreByChannel(nextHasMore);
      setLoading(false);
    })();

    const unsubMsg = chatService.onMessage((msg) => {
      if (!channelSourceMap.current[msg.channelId]) return;
      if (seenIds.current.has(msg._id)) return;
      seenIds.current.add(msg._id);
      setMessagesByChannel(prev => ({
        ...prev,
        [msg.channelId]: [...(prev[msg.channelId] ?? []), msg],
      }));
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    });

    return () => { cancelled = true; unsubMsg(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannels, token, loadingSetup]);

  // ── Merge + build list items with date separators ───────────────────────────

  const listItems: ListItem[] = useMemo(() => {
    const all: ChatMessage[] = [];
    Object.values(messagesByChannel).forEach(list => all.push(...list));
    all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const items: ListItem[] = [];
    let lastDate = '';
    for (const msg of all) {
      const dateLabel = fmtDate(msg.createdAt);
      if (dateLabel !== lastDate) {
        items.push({ type: 'date', label: dateLabel, key: `date-${msg.createdAt}` });
        lastDate = dateLabel;
      }
      items.push({ type: 'msg', data: msg, source: channelSourceMap.current[msg.channelId] ?? 'LINE' });
    }
    return items;
  }, [messagesByChannel]);

  const hasMore = Object.values(hasMoreByChannel).some(Boolean);

  // ── Load more (scroll to top) ────────────────────────────────────────────────

  const handleLoadMore = useCallback(async () => {
    const loadable = activeChannels.filter(c => hasMoreByChannel[c.id]);
    if (loadable.length === 0 || loadingMore) return;
    setLoadingMore(true);

    const results = await Promise.all(loadable.map(async (c) => {
      const list = messagesByChannel[c.id] ?? [];
      const before = list[0]?.createdAt;
      const res = await chatService.getMessages(c.id, before);
      return { channelId: c.id, res };
    }));

    setMessagesByChannel(prev => {
      const next = { ...prev };
      results.forEach(({ channelId, res }) => {
        if (res.success) next[channelId] = [...res.data, ...(prev[channelId] ?? [])];
      });
      return next;
    });
    setHasMoreByChannel(prev => {
      const next = { ...prev };
      results.forEach(({ channelId, res }) => {
        next[channelId] = res.success ? res.data.length >= PAGE_SIZE : false;
      });
      return next;
    });
    setLoadingMore(false);
  }, [activeChannels, hasMoreByChannel, messagesByChannel, loadingMore]);

  // ── Send ────────────────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !selected) return;
    const target = activeChannels.find(c => c.source === selected);
    if (!target) return;
    setText('');
    chatService.sendMessage(target.id, trimmed);
  }, [text, selected, activeChannels]);

  const handleAcknowledge = useCallback(async () => {
    setDisclosureVisible(false);
    await chatService.acknowledgeDisclosure(id);
  }, [id]);

  const isPartnerView = kind === 'ROOM' && roomDetail?.role === 'PARTNER';
  const isDeskView = kind === 'ROOM' && !!roomDetail && roomDetail.role !== 'PARTNER';
  const isObserver = isDeskView && roomDetail?.role === 'OBSERVER';
  const canCompose = permitted.length > 0;
  const showSegmented = isDeskView && permitted.length > 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle} numberOfLines={1}>
          {kind === 'FLOOR' ? `#${headerTitle || '…'}` : (headerTitle || '…')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Disclosure banner (partner, unacknowledged) */}
        {isPartnerView && disclosureVisible && roomDetail && (
          <View style={s.disclosure}>
            <Text style={s.disclosureText}>
              Connected to {roomDetail.deskName} — represented by the desk team. Desk team members may monitor this room.
            </Text>
            <TouchableOpacity onPress={handleAcknowledge} style={s.disclosureBtn} activeOpacity={0.8}>
              <Text style={s.disclosureBtnText}>Acknowledge</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Chat area with pattern background */}
        <View style={s.chatArea}>
          <ChatBackground color={colors.primaryMuted} />

          {loadingSetup || loading ? (
            <View style={s.centered}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatRef}
              data={listItems}
              keyExtractor={(item) => item.type === 'msg' ? item.data._id : item.key}
              renderItem={({ item }) => {
                if (item.type === 'date') {
                  return <DateSep label={item.label} s={s} />;
                }
                const msg = item.data;
                const isOwn = msg.senderId === user?.id;
                return (
                  <Bubble
                    msg={msg}
                    isOwn={isOwn}
                    isBackstage={item.source === 'BACKSTAGE'}
                    s={s}
                  />
                );
              }}
              onEndReachedThreshold={0}
              ListHeaderComponent={
                loadingMore ? <ActivityIndicator color={colors.primary} style={{ paddingVertical: 12 }} /> : null
              }
              onScrollToIndexFailed={() => {}}
              onScroll={({ nativeEvent }) => {
                if (nativeEvent.contentOffset.y <= 0) handleLoadMore();
              }}
              scrollEventThrottle={100}
              initialNumToRender={30}
              maxToRenderPerBatch={20}
              windowSize={10}
              contentContainerStyle={s.listContent}
              onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
            />
          )}
        </View>

        {/* Line / Backstage segmented control */}
        {showSegmented && (
          <View style={s.segmentRow}>
            {(['LINE', 'BACKSTAGE'] as ChannelSource[])
              .filter(opt => permitted.includes(opt))
              .map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[s.segmentPill, selected === opt && s.segmentPillActive]}
                  onPress={() => setSelected(opt)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.segmentLabel, selected === opt && s.segmentLabelActive]}>
                    {opt === 'LINE' ? 'Line' : 'Backstage'}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* Input */}
        {canCompose ? (
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="Message"
              placeholderTextColor={colors.textSecondary}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={2000}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[s.sendBtn, !text.trim() && s.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim()}
              activeOpacity={0.8}
            >
              <Text style={s.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        ) : (
          !loadingSetup && (
            <View style={s.readOnlyRow}>
              <Text style={s.readOnlyText}>
                {isObserver ? "Observers can view but can't send messages." : 'You do not have permission to post here.'}
              </Text>
            </View>
          )
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    safe:    { flex: 1, backgroundColor: colors.background },
    flex:    { flex: 1 },
    centered:{ flex: 1, alignItems: 'center', justifyContent: 'center' },

    // Header
    header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.text },

    // Disclosure banner
    disclosure:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.primaryMuted, borderBottomWidth: 1, borderBottomColor: colors.primaryBorder },
    disclosureText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.text },
    disclosureBtn:  { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
    disclosureBtnText: { fontSize: 12, fontWeight: '600', color: '#ffffff' },

    // Chat
    chatArea:    { flex: 1, backgroundColor: colors.background },
    listContent: { paddingVertical: 12, paddingHorizontal: 14 },

    // Date separator
    dateSep:  { flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingHorizontal: 8 },
    dateLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dateText: { fontSize: 11, color: colors.textSecondary, marginHorizontal: 12, letterSpacing: 0.5 },

    // Bubbles
    bubbleWrap:      { marginBottom: 4, maxWidth: '80%' },
    bubbleWrapOwn:   { alignSelf: 'flex-end', alignItems: 'flex-end' },
    bubbleWrapOther: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    bubbleWrapBackstage: { marginLeft: 22 },

    backstageTag: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: colors.primary, marginBottom: 3, marginLeft: 4 },

    bubble:      { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleOther: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderTopLeftRadius: 4 },
    bubbleOwn:   { backgroundColor: colors.primaryMuted, borderWidth: 1, borderColor: colors.primaryBorder, borderTopRightRadius: 4 },
    bubbleBackstage: { borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: 11 },

    bubbleText:    { fontSize: 14, color: colors.text, lineHeight: 20 },
    bubbleTextOwn: { color: colors.text },

    bubbleTime:    { fontSize: 10, color: colors.textSecondary, marginTop: 3, marginHorizontal: 4 },
    bubbleTimeOwn: { color: colors.textSecondary },

    // Segmented control
    segmentRow:  { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingTop: 10 },
    segmentPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    segmentPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    segmentLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    segmentLabelActive: { color: '#ffffff' },

    // Input
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 },
    input:    { flex: 1, backgroundColor: colors.card, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: colors.text, fontSize: 14, maxHeight: 120, borderWidth: 1, borderColor: colors.border },
    sendBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    sendBtnDisabled: { backgroundColor: colors.surfaceAlt },
    sendIcon:        { fontSize: 18, color: '#ffffff', fontWeight: '600', lineHeight: 20 },

    // Read-only state
    readOnlyRow:  { paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' },
    readOnlyText: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },
  });
}
