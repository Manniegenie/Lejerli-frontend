import api from './api';

export interface ChannelRow {
  id: string;
  channel: string;
  type: string;
  assets: string;
  connection: string;
  balance: string;
  mode: string;
  margin: string;
  status: string;
  snapshot?: {
    totalUSD: string | null;
    assetCount: number;
    canTrade: boolean | null;
    lastUpdated: string | null;
  };
  connectedAt?: string | null;
  lastSynced?: string | null;
}

const channelService = {
  getChannels: () => api.get<ChannelRow[]>('/channels').then((res) => res.data),
  syncChannel: (
    exchange: string,
    permissions: { trades: boolean; deposits: boolean; withdrawals: boolean },
    importRange?: { from: string; to: string },
  ) => api.post(`/sync/${exchange}`, { permissions, importRange: importRange ?? {} }, { timeout: 180000 }),
};

export default channelService;
