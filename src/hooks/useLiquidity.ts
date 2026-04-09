import { useState, useEffect } from 'react';
import walletService from '../services/walletService';

export function useLiquidity() {
  const [cryptoLiquidity, setCryptoLiquidity] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await walletService.getStatus();
        let total = 0;
        Object.values(data).forEach((entry) => {
          if (entry.connected && entry.snapshot?.totalUSD) {
            total += parseFloat(entry.snapshot.totalUSD);
          }
        });
        setCryptoLiquidity(total);
      } catch (_) {}
    };
    load();
  }, []);

  return { cryptoLiquidity };
}
