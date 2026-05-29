import { useState, useEffect } from 'react';
import walletService from '../services/walletService';

export function useLiquidity() {
  const [cryptoLiquidity, setCryptoLiquidity] = useState(0);

  useEffect(() => {
    const load = async () => {
      const res = await walletService.getStatus();
      if (!res.success) return;
      let total = 0;
      Object.values(res.data).forEach((entry) => {
        if (entry.connected && entry.snapshot?.totalUSD) {
          total += parseFloat(entry.snapshot.totalUSD);
        }
      });
      setCryptoLiquidity(total);
    };
    load();
  }, []);

  return { cryptoLiquidity };
}
