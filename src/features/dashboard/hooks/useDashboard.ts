import { useState, useEffect, useCallback } from 'react';
import walletService from '../../../services/walletService';
import treeService from '../../../services/treeService';
import channelService, { ChannelRow } from '../../../services/channelService';
import { useNews } from '../../../hooks/useNews';
import { useClocks } from '../../../hooks/useClocks';

export interface DashboardSummary {
  cryptoTotal: number;
  fiatTotal: number;
  profitNet: number;
  connectedCount: number;
  recentChannels: ChannelRow[];
}

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    cryptoTotal: 0,
    fiatTotal: 0,
    profitNet: 0,
    connectedCount: 0,
    recentChannels: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { newsItem, newsOpacity } = useNews();
  const clocks = useClocks();

  const fetchAll = useCallback(async () => {
    try {
      const [walletStatus, trees, channels] = await Promise.all([
        walletService.getStatus(),
        treeService.getTrees(),
        channelService.getChannels(),
      ]);

      let cryptoTotal = 0;
      Object.values(walletStatus).forEach((entry) => {
        if (entry.connected && entry.snapshot?.totalUSD) {
          cryptoTotal += parseFloat(entry.snapshot.totalUSD);
        }
      });

      const profitNet = trees.reduce((sum, t) => sum + (t.profitNet || 0), 0);
      const connected = channels.filter((c) => c.snapshot || c.connectedAt);

      setSummary({
        cryptoTotal,
        fiatTotal: 0,
        profitNet,
        connectedCount: connected.length,
        recentChannels: connected.slice(0, 3),
      });
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
  }, [fetchAll]);

  return { summary, loading, refreshing, refresh, newsItem, newsOpacity, clocks };
}
