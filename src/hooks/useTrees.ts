import { useState, useCallback } from 'react';
import treeService, { Tree } from '../services/treeService';

export function useTrees() {
  const [trees, setTrees] = useState<Tree[]>([]);

  const fetchTrees = useCallback(async () => {
    try {
      const data = await treeService.getTrees();
      setTrees(data);
    } catch (_) {}
  }, []);

  return { trees, fetchTrees };
}
