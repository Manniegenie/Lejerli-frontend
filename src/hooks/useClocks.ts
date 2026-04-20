import { useState, useEffect } from 'react';
import clockService, { ClockEntry } from '../services/clockService';

export function useClocks(): ClockEntry[] {
  const [clocks, setClocks] = useState<ClockEntry[]>([]);

  useEffect(() => {
    const tick = async () => {
      try {
        const data = await clockService.getClocks();
        setClocks(data);
      } catch (_) {}
    };

    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return clocks;
}
