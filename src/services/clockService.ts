import api from './api';

export interface ClockEntry {
  label: string;
  tz: string;
  time: string;
}

const clockService = {
  async getClocks(): Promise<ClockEntry[]> {
    const res = await api.get('/clocks');
    return res.data.data;
  },
};

export default clockService;
