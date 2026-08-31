import { io, Socket } from 'socket.io-client';
import api from './api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://piperpoloter.online';

export type ChatKind = 'ROOM' | 'FLOOR';

export interface ChatSummary {
  id: string;
  kind: ChatKind;
  title: string;
  lastMessage: { text: string; createdAt: string } | null;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  channelId: string;
  senderId: string;
  type: string;
  body: { text: string };
  createdAt: string;
}

export type RoomRole = 'PRINCIPAL' | 'LEAD' | 'TRADER' | 'OBSERVER' | 'PARTNER';

export interface RoomDetail {
  deskName: string;
  partnerDisplayName: string;
  lineChannelId: string;
  backstageChannelId: string;
  role: RoomRole;
  disclosureAcknowledgedAt: string | null;
}

class ChatService {
  private socket: Socket | null = null;

  // ── Socket lifecycle ────────────────────────────────────────────────────────

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(BASE_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[chat] connect error:', err.message);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ── Emit ────────────────────────────────────────────────────────────────────

  joinChannel(channelId: string): void {
    this.socket?.emit('join_channel', { channelId });
  }

  sendMessage(channelId: string, text: string): void {
    this.socket?.emit('send_message', { channelId, text });
  }

  // ── Subscribe ───────────────────────────────────────────────────────────────

  onMessage(cb: (msg: ChatMessage) => void): () => void {
    this.socket?.on('new_message', cb);
    return () => this.socket?.off('new_message', cb);
  }

  onError(cb: (e: { message: string }) => void): () => void {
    this.socket?.on('error', cb);
    return () => this.socket?.off('error', cb);
  }

  // ── REST ────────────────────────────────────────────────────────────────────

  getChats() {
    return api.get<ChatSummary[]>('/me/chats');
  }

  getRoomDetail(roomId: string) {
    return api.get<RoomDetail>(`/rooms/${roomId}`);
  }

  acknowledgeDisclosure(roomId: string) {
    return api.post(`/rooms/${roomId}/disclosure-ack`);
  }

  getMessages(channelId: string, before?: string) {
    const query = before ? `?before=${before}&limit=50` : '?limit=50';
    return api.get<ChatMessage[]>(`/channels/${channelId}/messages${query}`);
  }
}

export default new ChatService();
