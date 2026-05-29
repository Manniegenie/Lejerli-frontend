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
  getTrees: () => api.get<Tree[]>('/trees'),
  createTree: (payload: CreateTreePayload) => api.post<Tree>('/trees', payload),
  updateTree: (id: string, payload: CreateTreePayload) => api.put<Tree>(`/trees/${id}`, payload),
};

export default treeService;
