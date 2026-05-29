import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Image, Modal, StyleSheet, Text,
  TextInput, TouchableOpacity, View, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../app/_layout';
import chatService, { ChatRoom } from '../../services/chatService';
import BackButton from '../../components/common/BackButton';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function RoomRow({ room, onPress }: { room: ChatRoom; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.roomRow} onPress={onPress} activeOpacity={0.7}>
      <View style={s.roomLeft}>
        <View style={s.roomIcon}>
          <Text style={s.roomHash}>#</Text>
        </View>
        <View style={s.roomMeta}>
          <Text style={s.roomName}>{room.name}</Text>
          {room.preview ? (
            <Text style={s.roomPreview} numberOfLines={1}>
              <Text style={s.roomPreviewUser}>{room.preview.username}: </Text>
              {room.preview.text}
            </Text>
          ) : (
            <Text style={s.roomPreviewEmpty}>No messages yet</Text>
          )}
        </View>
      </View>
      {room.preview && (
        <Text style={s.roomTime}>{timeAgo(room.preview.createdAt)}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function ChatroomListScreen() {
  const router    = useRouter();
  const { token } = useAuth();
  const [rooms, setRooms]         = useState<ChatRoom[]>([]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName]     = useState('');
  const [newDesc, setNewDesc]     = useState('');
  const [error, setError]         = useState('');
  const nameRef = useRef<TextInput>(null);

  const load = useCallback(async () => {
    const res = await chatService.getRooms();
    if (res.success) {
      setRooms(res.data);
    } else {
      setError('Could not load rooms.');
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

  const handleCreate = async () => {
    const name = newName.trim().toLowerCase().replace(/\s+/g, '-');
    if (name.length < 2) { setError('Name must be at least 2 characters.'); return; }
    setCreating(true);
    setError('');
    const res = await chatService.createRoom(name, newDesc.trim());
    setCreating(false);
    if (res.success) {
      setRooms(prev => [...prev, { ...res.data, preview: null }]);
      setModalVisible(false);
      setNewName('');
      setNewDesc('');
      router.push(`/(app)/chatroom/${res.data._id}`);
    } else {
      setError((res as any).error ?? 'Failed to create room.');
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.title}>Chatrooms</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.divider} />

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color="#F26522" />
        </View>
      ) : rooms.length === 0 ? (
        <View style={s.empty}>
          <Image source={require('../../../assets/Prototyping process-cuate.png')} style={s.emptyImg} />
          <Text style={s.emptyMsg}>No chatrooms yet</Text>
          <Text style={s.emptySub}>Create a room to start a conversation with your team.</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => setModalVisible(true)} activeOpacity={0.7}>
            <Text style={s.emptyBtnText}>Create Room</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={r => r._id}
          renderItem={({ item }) => (
            <RoomRow room={item} onPress={() => router.push(`/(app)/chatroom/${item._id}`)} />
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* New room modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>New Room</Text>

            <Text style={s.modalLabel}>ROOM NAME</Text>
            <TextInput
              ref={nameRef}
              style={s.modalInput}
              placeholder="e.g. trading-signals"
              placeholderTextColor="#444"
              value={newName}
              onChangeText={setNewName}
              autoCapitalize="none"
              maxLength={60}
              returnKeyType="next"
            />

            <Text style={s.modalLabel}>DESCRIPTION (optional)</Text>
            <TextInput
              style={s.modalInput}
              placeholder="What's this room about?"
              placeholderTextColor="#444"
              value={newDesc}
              onChangeText={setNewDesc}
              maxLength={200}
              returnKeyType="done"
            />

            {error ? <Text style={s.modalError}>{error}</Text> : null}

            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => { setModalVisible(false); setError(''); }}
                activeOpacity={0.7}
              >
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.createBtn, creating && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={creating}
                activeOpacity={0.8}
              >
                {creating
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.createText}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#0a0a0a' },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  divider:   { height: 1, backgroundColor: '#1a1a1a' },
  sep:       { height: 1, backgroundColor: '#131313', marginLeft: 64 },

  // Header — mirrors ChannelsScreen
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  title:     { fontSize: 20, fontWeight: '700', color: '#ffffff' },

  // FAB
  fab:       { position: 'absolute', bottom: 32, right: 24, width: 52, height: 52, borderRadius: 26, backgroundColor: '#F26522', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabIcon:   { fontSize: 28, color: '#ffffff', lineHeight: 32 },

  // Room row
  roomRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  roomLeft:        { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  roomIcon:        { width: 38, height: 38, borderRadius: 10, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  roomHash:        { fontSize: 16, color: '#F26522', fontWeight: '500' },
  roomMeta:        { flex: 1 },
  roomName:        { fontSize: 15, color: '#ffffff', fontWeight: '500', marginBottom: 3 },
  roomPreview:     { fontSize: 12, color: '#555' },
  roomPreviewUser: { color: '#666', fontWeight: '500' },
  roomPreviewEmpty:{ fontSize: 12, color: '#333', fontStyle: 'italic' },
  roomTime:        { fontSize: 11, color: '#444' },

  // Empty state — mirrors ChannelsScreen
  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 60 },
  emptyImg:  { width: 240, height: 200, resizeMode: 'contain' },
  emptyMsg:  { fontSize: 15, color: '#ffffff', fontWeight: '500', marginTop: 16, textAlign: 'center' },
  emptySub:  { fontSize: 13, color: '#888888', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  emptyBtn:  { marginTop: 24, backgroundColor: '#F26522', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },

  // Modal
  modalOverlay:  { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalSheet:    { backgroundColor: '#111111', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle:    { fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 24 },
  modalLabel:    { fontSize: 10, color: '#555', letterSpacing: 1.4, marginBottom: 8 },
  modalInput:    { backgroundColor: '#1a1a1a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#ffffff', fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  modalError:    { fontSize: 12, color: '#f87171', marginBottom: 12 },
  modalActions:  { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn:     { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center' },
  cancelText:    { fontSize: 14, color: '#888' },
  createBtn:     { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#F26522', alignItems: 'center' },
  createText:    { fontSize: 14, fontWeight: '600', color: '#ffffff' },
});
