import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../app/_layout';
import chatService, { ChatMessage } from '../../services/chatService';
import BackButton from '../../components/common/BackButton';

// ── Playful dot-grid background ────────────────────────────────────────────────

function ChatBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="dots"
            patternUnits="userSpaceOnUse"
            width={22}
            height={22}
          >
            <Circle cx={11} cy={11} r={1.1} fill="rgba(242,101,34,0.07)" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dots)" />
      </Svg>
    </View>
  );
}

// ── Date separator ─────────────────────────────────────────────────────────────

function DateSep({ label }: { label: string }) {
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
  showUsername: boolean;
}

function Bubble({ msg, isOwn, showUsername }: BubbleProps) {
  return (
    <View style={[s.bubbleWrap, isOwn ? s.bubbleWrapOwn : s.bubbleWrapOther]}>
      {!isOwn && showUsername && (
        <Text style={s.bubbleSender}>{msg.username}</Text>
      )}
      <View style={[s.bubble, isOwn ? s.bubbleOwn : s.bubbleOther]}>
        <Text style={[s.bubbleText, isOwn && s.bubbleTextOwn]}>{msg.text}</Text>
      </View>
      <Text style={[s.bubbleTime, isOwn && s.bubbleTimeOwn]}>{fmtTime(msg.createdAt)}</Text>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────

type ListItem =
  | { type: 'msg';  data: ChatMessage }
  | { type: 'date'; label: string; key: string };

export default function ChatRoomScreen() {
  const { id: roomId }  = useLocalSearchParams<{ id: string }>();
  const router          = useRouter();
  const { user, token } = useAuth();

  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText]           = useState('');
  const [roomName, setRoomName]   = useState('');
  const [hasMore, setHasMore]     = useState(true);
  const flatRef = useRef<FlatList>(null);
  const seenIds = useRef(new Set<string>());

  // ── Load history ─────────────────────────────────────────────────────────────

  const loadMessages = useCallback(async (before?: string) => {
    if (!roomId) return;
    const res = await chatService.getMessages(roomId, before);
    if (res.success) {
      if (res.data.length < 50) setHasMore(false);
      setMessages(prev => {
        const merged = before ? [...res.data, ...prev] : res.data;
        const seen = new Set<string>();
        return merged.filter(m => {
          if (seen.has(m._id)) return false;
          seen.add(m._id);
          return true;
        });
      });
    }
    setLoading(false);
    setLoadingMore(false);
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !token) return;

    chatService.connect(token);
    chatService.joinRoom(roomId);

    // Fetch room name from rooms list (cached via service)
    chatService.getRooms().then(res => {
      if (res.success) {
        const room = res.data.find(r => r._id === roomId);
        if (room) setRoomName(room.name);
      }
    });

    loadMessages();

    const unsub = chatService.onMessage((msg) => {
      if (msg.room !== roomId) return;
      if (seenIds.current.has(msg._id)) return;
      seenIds.current.add(msg._id);
      setMessages(prev => [...prev, msg]);
      // Scroll to end on new message
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    });

    return () => { unsub(); };
  }, [roomId, token, loadMessages]);

  // ── Build list items with date separators ─────────────────────────────────

  const listItems: ListItem[] = [];
  let lastDate = '';
  for (const msg of messages) {
    const dateLabel = fmtDate(msg.createdAt);
    if (dateLabel !== lastDate) {
      listItems.push({ type: 'date', label: dateLabel, key: `date-${msg.createdAt}` });
      lastDate = dateLabel;
    }
    listItems.push({ type: 'msg', data: msg });
  }

  // ── Send ────────────────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !roomId) return;
    setText('');
    chatService.sendMessage(roomId, trimmed);
  }, [text, roomId]);

  // ── Load more (pull to top) ─────────────────────────────────────────────────

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    loadMessages(messages[0].createdAt);
  }, [hasMore, loadingMore, messages, loadMessages]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>#{roomName || '…'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Chat area with pattern background */}
        <View style={s.chatArea}>
          <ChatBackground />

          {loading ? (
            <View style={s.centered}>
              <ActivityIndicator color="#F26522" />
            </View>
          ) : (
            <FlatList
              ref={flatRef}
              data={listItems}
              keyExtractor={(item) =>
                item.type === 'msg' ? item.data._id : item.key
              }
              renderItem={({ item, index }) => {
                if (item.type === 'date') {
                  return <DateSep label={item.label} />;
                }
                const msg      = item.data;
                const isOwn    = msg.senderId === user?.id;
                const prev     = listItems[index - 1];
                const prevSender = prev?.type === 'msg' ? prev.data.senderId : null;
                const showUsername = !isOwn && prevSender !== msg.senderId;
                return <Bubble msg={msg} isOwn={isOwn} showUsername={showUsername} />;
              }}
              onEndReachedThreshold={0}
              ListHeaderComponent={
                loadingMore ? <ActivityIndicator color="#F26522" style={{ paddingVertical: 12 }} /> : null
              }
              onScrollToIndexFailed={() => {}}
              initialNumToRender={30}
              maxToRenderPerBatch={20}
              windowSize={10}
              contentContainerStyle={s.listContent}
              onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
            />
          )}
        </View>

        {/* Input */}
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            placeholder="Message"
            placeholderTextColor="#444"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#0a0a0a' },
  flex:    { flex: 1 },
  centered:{ flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff' },

  // Chat
  chatArea:    { flex: 1, backgroundColor: '#0d0d0d' },
  listContent: { paddingVertical: 12, paddingHorizontal: 14 },

  // Date separator
  dateSep:  { flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingHorizontal: 8 },
  dateLine: { flex: 1, height: 1, backgroundColor: '#1e1e1e' },
  dateText: { fontSize: 11, color: '#555', marginHorizontal: 12, letterSpacing: 0.5 },

  // Bubbles
  bubbleWrap:      { marginBottom: 4, maxWidth: '80%' },
  bubbleWrapOwn:   { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleWrapOther: { alignSelf: 'flex-start', alignItems: 'flex-start' },

  bubbleSender: { fontSize: 11, color: '#F26522', marginBottom: 4, marginLeft: 4, fontWeight: '600' },

  bubble:      { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleOther: { backgroundColor: '#161616', borderWidth: 1, borderColor: '#222', borderTopLeftRadius: 4 },
  bubbleOwn:   { backgroundColor: 'rgba(242,101,34,0.14)', borderWidth: 1, borderColor: 'rgba(242,101,34,0.3)', borderTopRightRadius: 4 },

  bubbleText:    { fontSize: 14, color: '#cccccc', lineHeight: 20 },
  bubbleTextOwn: { color: '#f0f0f0' },

  bubbleTime:    { fontSize: 10, color: '#444', marginTop: 3, marginHorizontal: 4 },
  bubbleTimeOwn: { color: '#555' },

  // Input
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#0a0a0a', borderTopWidth: 1, borderTopColor: '#1a1a1a', gap: 10 },
  input:    { flex: 1, backgroundColor: '#141414', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: '#ffffff', fontSize: 14, maxHeight: 120, borderWidth: 1, borderColor: '#2a2a2a' },
  sendBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F26522', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#2a2a2a' },
  sendIcon:        { fontSize: 18, color: '#ffffff', fontWeight: '600', lineHeight: 20 },
});
