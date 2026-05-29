import api from './api';

const tokenService = {
  getIcons: () => api.get<Record<string, string>>('/tokens/icons'),
};

export default tokenService;
