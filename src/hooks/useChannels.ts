import { useState, useCallback } from 'react';
import channelService, { ChannelRow } from '../services/channelService';

export interface ConnectedAccount {
  exchange: string;
  connectedAt: string | null;
  lastSynced: string | null;
  snapshot: {
    totalUSD: string | null;
    assetCount: number;
    canTrade: boolean | null;
    lastUpdated: string | null;
  } | null;
}

export function useChannels() {
  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);

  const fetchChannels = useCallback(async () => {
    try {
      const data = await channelService.getChannels();
      setChannels(data);
      const connected: ConnectedAccount[] = data
        .filter((r) => r.snapshot)
        .map((r) => ({
          exchange:    r.id,
          connectedAt: r.connectedAt ?? null,
          lastSynced:  r.lastSynced  ?? null,
          snapshot:    r.snapshot!,
        }));
      setConnectedAccounts(connected);
    } catch (_) {}
  }, []);

  return { channels, connectedAccounts, fetchChannels };
}
