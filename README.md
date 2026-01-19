# Lejerli Frontend

React Native Expo app for the Lejerli Crypto Exchange Aggregator.

## Features

- **Authentication**: Email/password signup and login
- **Dashboard**: Overview of connected exchange wallets
- **Wallet Management**: Connect Binance, Kraken, and Coinbase wallets
- **Real-time Status**: View connection status and last sync times
- **Secure Storage**: API keys stored securely on the backend

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **React Navigation** for routing
- **Axios** for API calls
- **AsyncStorage** for local data persistence

## Project Structure

```
Lejerli-frontend/
├── src/
│   ├── features/
│   │   ├── auth/           # Authentication screens
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── dashboard/      # Dashboard screens
│   │   │   └── DashboardScreen.tsx
│   │   └── wallet/         # Wallet management screens
│   │       └── ConnectWalletScreen.tsx
│   ├── services/          # API service layers
│   │   ├── api.ts         # Axios instance with interceptors
│   │   ├── authService.ts # Authentication API calls
│   │   └── walletService.ts # Wallet API calls
│   ├── store/             # Redux store
│   │   ├── index.ts       # Store configuration
│   │   └── authSlice.ts   # Auth state management
│   └── navigation/        # Navigation setup
│       └── AppNavigator.tsx
├── App.tsx               # Root component
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- Backend server running at http://localhost:3000

### Installation

1. Install dependencies:
```bash
cd Lejerli-frontend
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your platform:
- **iOS**: Press `i` or `npm run ios`
- **Android**: Press `a` or `npm run android`
- **Web**: Press `w` or `npm run web`

## API Configuration

The API base URL is configured in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000';
```

Update this to match your backend server URL.

## Available Routes

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Wallet Management
- `POST /wallet/binance` - Connect Binance wallet
- `POST /wallet/kraken` - Connect Kraken wallet
- `POST /wallet/coinbase` - Connect Coinbase wallet
- `GET /wallet/status` - Get all wallet statuses
- `DELETE /wallet/:exchange` - Disconnect wallet

## Screens

### Auth Screens
- **Login**: Email/password authentication
- **Signup**: User registration with email, username, password

### Main Screens
- **Dashboard**: Shows connected exchanges and status
- **Connect Wallet**: Form to connect exchange API keys

## Security Notes

- API keys are never stored on the device
- All keys are encrypted on the backend
- JWT tokens used for authentication
- Only read-only API permissions should be enabled on exchanges

## Development

### Adding New Exchanges

1. Add service method in `src/services/walletService.ts`
2. Update wallet status types
3. Add exchange card in `DashboardScreen.tsx`
4. Update navigation params if needed

### State Management

The app uses Redux Toolkit for global state. Current slices:
- `authSlice`: User authentication state

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --clear
```

### Package Installation Issues
```bash
rm -rf node_modules
npm install
```

### iOS Build Issues
```bash
cd ios && pod install && cd ..
npm run ios
```

## License

MIT
