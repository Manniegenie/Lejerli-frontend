export default {
  expo: {
    name: 'Lejerli',
    slug: 'lejerli-frontend',
    version: '1.0.0',
    scheme: 'lejerli',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0a0a0a',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.lejerli.app',
      icon: './assets/icon.png',
    },
    android: {
      package: 'com.lejerli.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0a0a0a',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
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
    extra: {
      eas: {
        projectId: 'c309040f-5e51-4a7f-acc6-73311aebd3b5',
      },
    },
  },
};
