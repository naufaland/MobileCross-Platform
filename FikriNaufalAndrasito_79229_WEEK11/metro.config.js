// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

// Add Node.js module polyfills
const extraNodeModules = {
  stream: require.resolve("stream-browserify"),
  events: require.resolve("events"),
  crypto: require.resolve("crypto-browserify"),
  buffer: require.resolve("buffer"),
  process: require.resolve("process"),
  http: require.resolve("stream-http"),
  https: require.resolve("https-browserify"),
  net: require.resolve("react-native-tcp"),
  tls: require.resolve("react-native-tcp"),
  zlib: require.resolve("browserify-zlib"),
  path: require.resolve("path-browserify"),
  url: require.resolve("url"),
  assert: require.resolve("assert"),
};

// Merge configurations
module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    extraNodeModules,
  },
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
