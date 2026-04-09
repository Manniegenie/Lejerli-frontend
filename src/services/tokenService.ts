import api from './api';

const tokenService = {
  async getIcons(): Promise<Record<string, string>> {
    const res = await api.get('/tokens/icons');
    return res.data.data;
  },
};

export default tokenService;
