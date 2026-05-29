import { useState, useEffect } from 'react';
import clockService, { ClockEntry } from '../services/clockService';

export function useClocks(): ClockEntry[] {
  const [clocks, setClocks] = useState<ClockEntry[]>([]);

  useEffect(() => {
    const tick = async () => {
      const res = await clockService.getClocks();
      if (res.success) setClocks(res.data);
    };

    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return clocks;
}
