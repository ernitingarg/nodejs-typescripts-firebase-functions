const nodeExternals = require('webpack-node-externals');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const path = require('path');

module.exports = {
  target: 'node',
  mode: process.env.NODE_ENV,
  entry: {
    index: './index.ts',
  },
  output: {
    filename: '[name].js',
    path: `${__dirname}/dist`,
    libraryTarget: 'commonjs',
  },
  plugins: [
    // firebaseは各種jsonをfunctions内に入れないといけないのでコピー
    new GenerateJsonPlugin('package.json', require('./package'), (key, value) => {
      // cloud function環境でのデプロイ時間を短くするために、不要な依存関係は追加しない
      if (key === 'devDependencies') {
        return {};
      }
      return value;
    }),
    // cfデプロイ時に必要なfileをコピーする設定
    new CopyPlugin({
      patterns: [
        { from: './yarn.lock', to: './yarn.lock', toType: 'file' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      root: __dirname,
      src: path.resolve(__dirname, 'src'),
      funcs: path.resolve(__dirname, 'funcs'),
    },
  },
  externals: [nodeExternals()],
};
