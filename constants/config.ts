// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Lejerli',
  VERSION: '1.0.0',
};

// Supported Exchanges
export const EXCHANGES = {
  BINANCE: {
    id: 'binance',
    name: 'Binance',
    description: 'Connect your Binance account',
  },
  KRAKEN: {
    id: 'kraken',
    name: 'Kraken',
    description: 'Connect your Kraken account',
  },
  COINBASE: {
    id: 'coinbase',
    name: 'Coinbase',
    description: 'Connect your Coinbase account',
  },
};
