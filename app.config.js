export default {
  expo: {
    name: 'Lejerli',
    slug: 'lejerli-frontend',
    version: '1.0.0',
    scheme: 'lejerli',
    orientation: 'portrait',
    icon: './assets/logo.png',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: {
      image: './assets/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#0a0a0a',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.lejerli.app',
      icon: './assets/logo.png',
    },
    android: {
      package: 'com.lejerli.app',
      adaptiveIcon: {
        foregroundImage: './assets/logo.png',
        backgroundColor: '#0a0a0a',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      bundler: 'metro',
      favicon: './assets/logo.png',
      name: 'Lejerli',
      shortName: 'Lejerli',
      description: 'Unified crypto portfolio tracker',
      themeColor: '#0a0a0a',
      backgroundColor: '#0a0a0a',
    },
    plugins: ['expo-router', 'expo-secure-store', 'expo-font'],
    experiments: {
      typedRoutes: true,
    },
  },
};
