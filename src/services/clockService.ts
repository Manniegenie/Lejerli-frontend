import api from './api';

export interface ClockEntry {
  label: string;
  tz: string;
  time: string;
}

const clockService = {
  getClocks: () => api.get<ClockEntry[]>('/clocks'),
};

export default clockService;
