import api from './api';

export interface TreeAsset {
  asset: string;
  margin: number;
  priceAtCreation: number;
  entryPrice: number;
  profitGross: number;
}

export interface Tree {
  _id: string;
  channelId: string;
  name: string | null;
  assets: TreeAsset[];
  totalProfitGross: number;
  profitNet: number;
  createdAt: string;
}

export interface CreateTreePayload {
  channelId: string;
  assets: { asset: string; margin: number; priceAtCreation: number }[];
  name?: string;
}

const treeService = {
  async getTrees(): Promise<Tree[]> {
    const res = await api.get('/trees');
    return res.data.data;
  },

  async createTree(payload: CreateTreePayload): Promise<Tree> {
    const res = await api.post('/trees', payload);
    return res.data.data;
  },

  async updateTree(id: string, payload: CreateTreePayload): Promise<Tree> {
    const res = await api.put(`/trees/${id}`, payload);
    return res.data.data;
  },
};

export default treeService;
