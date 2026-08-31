import api from './api';

export interface Desk {
  _id: string;
  name: string;
  principalUserId: string;
  verificationTier: number;
  createdAt: string;
}

export interface Invite {
  id: string;
  type: 'FLOOR' | 'PARTNER';
  targetEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
}

export interface InviteDetail {
  type: 'FLOOR' | 'PARTNER';
  targetEmail: string;
  deskName: string;
  inviterName: string | null;
}

export interface PartnerRoom {
  _id: string;
  lineChannelId: string;
  backstageChannelId: string;
  [key: string]: any;
}

export interface AcceptInviteResult {
  type: 'FLOOR' | 'PARTNER';
  membership?: any;
  partner?: any;
  room?: PartnerRoom;
}

export type RoomRoleAssignment = 'LEAD' | 'TRADER' | 'OBSERVER';

class DesksService {
  getMyDesks() {
    return api.get<Desk[]>('/desks/mine');
  }

  createDesk(name: string) {
    return api.post<Desk>('/desks', { name });
  }

  inviteFloorMember(deskId: string, email: string) {
    return api.post<Invite>(`/desks/${deskId}/floor-invites`, { email });
  }

  invitePartner(deskId: string, email: string) {
    return api.post<Invite>(`/desks/${deskId}/partner-invites`, { email });
  }

  getInvite(token: string) {
    return api.get<InviteDetail>(`/invites/${token}`);
  }

  acceptInvite(token: string) {
    return api.post<AcceptInviteResult>(`/invites/${token}/accept`);
  }

  assignRoomRole(roomId: string, userId: string, role: RoomRoleAssignment) {
    return api.post(`/rooms/${roomId}/roles`, { userId, role });
  }
}

export default new DesksService();
