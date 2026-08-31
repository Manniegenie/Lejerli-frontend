import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Image, StyleSheet, Text,
  TouchableOpacity, View, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import chatService, { ChatSummary } from '../../services/chatService';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../constants/theme';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ChatRow({ chat, onPress, s, colors }: { chat: ChatSummary; onPress: () => void; s: ReturnType<typeof makeStyles>; colors: AppColors }) {
  const isFloor = chat.kind === 'FLOOR';
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <View style={s.rowLeft}>
        <View style={s.icon}>
          <Text style={s.iconGlyph}>{isFloor ? '#' : chat.title.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={s.meta}>
          <Text style={s.name} numberOfLines={1}>{chat.title}</Text>
          {chat.lastMessage ? (
            <Text style={s.preview} numberOfLines={1}>{chat.lastMessage.text}</Text>
          ) : (
            <Text style={s.previewEmpty}>No messages yet</Text>
          )}
        </View>
      </View>
      {chat.lastMessage && (
        <Text style={s.time}>{timeAgo(chat.lastMessage.createdAt)}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function ChatroomListScreen() {
  const router    = useRouter();
  const { token } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [chats, setChats]     = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    const res = await chatService.getChats();
    if (res.success) {
      setChats(res.data);
    } else {
      setError('Could not load chats.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      chatService.connect(token);
      const unsub = chatService.onMessage(() => load());
      load();
      return () => { unsub(); };
    }
  }, [token, load]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Chats</Text>
      </View>

      <View style={s.divider} />

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={s.empty}>
          <Text style={s.emptyMsg}>{error}</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={s.empty}>
          <Image source={require('../../assets/Prototyping process-cuate.png')} style={s.emptyImg} />
          <Text style={s.emptyMsg}>No chats yet</Text>
          <Text style={s.emptySub}>Connect a partner or join a desk to start a conversation.</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={c => `${c.kind}-${c.id}`}
          renderItem={({ item }) => (
            <ChatRow
              chat={item}
              s={s}
              colors={colors}
              onPress={() => router.push({
                pathname: '/(app)/chats/[id]',
                params: { id: item.id, kind: item.kind, title: item.title },
              })}
            />
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    safe:      { flex: 1, backgroundColor: colors.background },
    centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
    divider:   { height: 1, backgroundColor: colors.border },
    sep:       { height: 1, backgroundColor: colors.border, marginLeft: 64 },

    header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
    title:     { fontSize: 20, fontWeight: '700', color: colors.text },

    row:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
    rowLeft:     { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
    icon:        { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    iconGlyph:   { fontSize: 16, color: colors.primary, fontWeight: '600' },
    meta:        { flex: 1 },
    name:        { fontSize: 15, color: colors.text, fontWeight: '500', marginBottom: 3 },
    preview:     { fontSize: 12, color: colors.textSecondary },
    previewEmpty:{ fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },
    time:        { fontSize: 11, color: colors.textSecondary },

    empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 60 },
    emptyImg:  { width: 240, height: 200, resizeMode: 'contain' },
    emptyMsg:  { fontSize: 15, color: colors.text, fontWeight: '500', marginTop: 16, textAlign: 'center' },
    emptySub:  { fontSize: 13, color: colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  });
}
