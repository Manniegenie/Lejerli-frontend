const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];
config.resolver.unstable_enableSymlinks = false;

// Enable polling for WSL/Windows cross-filesystem watching
config.watcher = {
  ...config.watcher,
  watchman: {
    deferStates: ['hg.update'],
  },
  additionalExts: ['mjs', 'cjs'],
};

module.exports = config;
