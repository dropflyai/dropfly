module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@lib': './src/lib',
            '@shared': '../shared',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
