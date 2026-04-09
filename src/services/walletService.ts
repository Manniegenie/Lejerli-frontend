import api from './api';

export interface WalletSnapshot {
  totalUSD: string | null;
  assetCount: number;
  canTrade: boolean | null;
  lastUpdated: string | null;
}

export interface WalletStatusEntry {
  connected: boolean;
  connectedAt: string | null;
  lastSynced: string | null;
  snapshot: WalletSnapshot | null;
}

export interface BalanceEntry {
  asset: string;
  free: string;
  locked: string;
  usdValue: string;
}

const walletService = {
  async getStatus(): Promise<Record<string, WalletStatusEntry>> {
    const res = await api.get('/wallet/status');
    return res.data.data;
  },

  async getBalances(exchange: string): Promise<BalanceEntry[]> {
    const res = await api.get(`/wallet/balances/${exchange}`);
    return res.data.data;
  },

  async connect(exchange: string, apiKey: string, apiSecret: string): Promise<void> {
    await api.post(`/wallet/${exchange}`, { apiKey, apiSecret });
  },

  async connectDex(exchange: string, walletAddress: string): Promise<void> {
    await api.post(`/wallet/${exchange}`, { walletAddress });
  },

  async disconnect(exchange: string): Promise<void> {
    await api.delete(`/wallet/${exchange}`);
  },
};

export default walletService;
