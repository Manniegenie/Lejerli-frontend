import { io, Socket } from 'socket.io-client';
import api from './api';

const BASE_URL = 'https://piperpoloter.online';

export interface ChatRoom {
  _id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  isDefault: boolean;
  createdAt: string;
  preview: { text: string; username: string; createdAt: string } | null;
}

export interface ChatMessage {
  _id: string;
  room: string;
  senderId: string;
  username: string;
  text: string;
  createdAt: string;
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

  joinRoom(roomId: string): void {
    this.socket?.emit('join_room', { roomId });
  }

  sendMessage(roomId: string, text: string): void {
    this.socket?.emit('send_message', { roomId, text });
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

  getRooms() {
    return api.get<ChatRoom[]>('/chat/rooms');
  }

  getMessages(roomId: string, before?: string) {
    const query = before ? `?before=${before}&limit=50` : '?limit=50';
    return api.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages${query}`);
  }

  createRoom(name: string, description?: string) {
    return api.post<ChatRoom>('/chat/rooms', { name, description });
  }
}

export default new ChatService();
