import { useState, useEffect } from 'react';
import treeService from '../services/treeService';

export function useProfitNet() {
  const [profitNet, setProfitNet] = useState(0);

  useEffect(() => {
    const load = async () => {
      const res = await treeService.getTrees();
      if (!res.success) return;
      const total = res.data.reduce((s, t) => s + (t.profitNet || 0), 0);
      setProfitNet(total);
    };
    load();
  }, []);

  return { profitNet };
}
