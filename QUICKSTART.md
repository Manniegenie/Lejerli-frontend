# Lejerli Frontend - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Ensure Backend is Running

Make sure your Lejerli backend is running at `http://localhost:3000`:

```bash
cd ../Lejerli
npm start
```

You should see: `Server running on port 3000`

### 2. Start the Frontend

```bash
cd Lejerli-frontend
npm start
```

### 3. Choose Your Platform

Once Expo DevTools opens, choose your platform:

- **Web Browser** (Easiest): Press `w`
- **Android**: Press `a` (requires Android Studio)
- **iOS**: Press `i` (requires Xcode on Mac)
- **Expo Go App**: Scan the QR code with Expo Go app

## 📱 Testing the App

### Create an Account
1. Open the app
2. Click "Sign up"
3. Enter email, username, and password
4. Click "Sign Up"
5. You'll be automatically logged in

### Connect an Exchange
1. After login, you'll see the Dashboard
2. Tap on any exchange card (Binance, Kraken, or Coinbase)
3. Enter your API Key and API Secret
4. Click "Connect Wallet"

**⚠️ Important**: Make sure your API keys have ONLY read permissions!

### Test Accounts

You can create test accounts with any email/password combination:

```
Email: test@example.com
Username: testuser
Password: password123
```

## 🔧 Troubleshooting

### "Network Error" when logging in

Make sure:
1. Backend is running at `http://localhost:3000`
2. MongoDB is running
3. Check `src/services/api.ts` has correct `API_BASE_URL`

### Metro Bundler Issues

Clear cache and restart:
```bash
npm start -- --clear
```

### Package Issues

Reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

## 📁 Project Structure

```
src/
├── features/           # Feature-based modules
│   ├── auth/          # Login & Signup screens
│   ├── dashboard/     # Main dashboard
│   └── wallet/        # Wallet connection
├── services/          # API services
│   ├── api.ts         # Axios instance
│   ├── authService.ts # Auth API calls
│   └── walletService.ts # Wallet API calls
├── store/             # Redux store
├── navigation/        # Navigation setup
└── constants/         # Configuration
```

## 🎯 Key Features

✅ Email/password authentication
✅ JWT token management
✅ Connect Binance, Kraken, Coinbase
✅ View wallet connection status
✅ Auto-login on app restart
✅ Secure API key handling
✅ Pull-to-refresh dashboard

## 📝 Next Steps

1. **Add Profile Screen**: Create user profile management
2. **Add Transactions View**: Display synced transaction data
3. **Add Charts**: Visualize portfolio performance
4. **Add Notifications**: Real-time sync updates
5. **Add Settings**: Theme, language, preferences

## 🆘 Need Help?

Check the full [README.md](./README.md) for detailed documentation.

## 📱 Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in browser
npm test           # Run tests (when added)
```

Enjoy building with Lejerli! 🚀
