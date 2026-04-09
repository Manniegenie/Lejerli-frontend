import { useState, useEffect } from 'react';
import tokenService from '../services/tokenService';

export function useTokenIcons() {
  const [tokenIcons, setTokenIcons] = useState<Record<string, string>>({});

  useEffect(() => {
    tokenService.getIcons()
      .then(setTokenIcons)
      .catch(() => {});
  }, []);

  return tokenIcons;
}
