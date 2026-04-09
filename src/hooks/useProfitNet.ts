import { useState, useEffect } from 'react';
import treeService from '../services/treeService';

export function useProfitNet() {
  const [profitNet, setProfitNet] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const trees = await treeService.getTrees();
        const total = trees.reduce((s, t) => s + (t.profitNet || 0), 0);
        setProfitNet(total);
      } catch (_) {}
    };
    load();
  }, []);

  return { profitNet };
}
