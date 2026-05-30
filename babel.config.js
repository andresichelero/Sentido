// babel.config.js — Sentido
// IMPORTANT: react-native-reanimated/plugin must be the LAST plugin
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
