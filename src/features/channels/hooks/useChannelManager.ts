import { useState, useCallback } from 'react';
import channelService, { ChannelRow } from '../../../services/channelService';

export function useChannelManager() {
  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState<Set<string>>(new Set());

  const fetchChannels = useCallback(async () => {
    try {
      const data = await channelService.getChannels();
      setChannels(data);
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChannels();
  }, [fetchChannels]);

  const syncChannel = useCallback(async (
    exchange: string,
    permissions: { trades: boolean; deposits: boolean; withdrawals: boolean }
  ): Promise<void> => {
    setSyncing((prev) => new Set(prev).add(exchange));
    try {
      await channelService.syncChannel(exchange, permissions);
      await fetchChannels();
    } finally {
      setSyncing((prev) => {
        const next = new Set(prev);
        next.delete(exchange);
        return next;
      });
    }
  }, [fetchChannels]);

  return {
    channels,
    loading,
    refreshing,
    refresh,
    fetchChannels,
    syncing,
    syncChannel,
  };
}
