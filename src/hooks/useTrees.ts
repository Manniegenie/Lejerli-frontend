import { useState, useCallback } from 'react';
import treeService, { Tree } from '../services/treeService';

export function useTrees() {
  const [trees, setTrees] = useState<Tree[]>([]);

  const fetchTrees = useCallback(async () => {
    const res = await treeService.getTrees();
    if (res.success) setTrees(res.data);
  }, []);

  return { trees, fetchTrees };
}
