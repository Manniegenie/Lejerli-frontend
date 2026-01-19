import api from './api';

export interface ConnectWalletData {
  apiKey: string;
  apiSecret: string;
}

export interface WalletStatus {
  connected: boolean;
  connectedAt: string | null;
  lastSynced: string | null;
}

export interface WalletStatusResponse {
  success: boolean;
  data: {
    binance: WalletStatus;
    kraken: WalletStatus;
    coinbase: WalletStatus;
  };
}

class WalletService {
  async connectBinance(data: ConnectWalletData) {
    const response = await api.post('/wallet/binance', data);
    return response.data;
  }

  async connectKraken(data: ConnectWalletData) {
    const response = await api.post('/wallet/kraken', data);
    return response.data;
  }

  async connectCoinbase(data: ConnectWalletData) {
    const response = await api.post('/wallet/coinbase', data);
    return response.data;
  }

  async getWalletStatus(): Promise<WalletStatusResponse> {
    const response = await api.get('/wallet/status');
    return response.data;
  }

  async disconnectWallet(exchange: 'binance' | 'kraken' | 'coinbase') {
    const response = await api.delete(`/wallet/${exchange}`);
    return response.data;
  }
}

export default new WalletService();
