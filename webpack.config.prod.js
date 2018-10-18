const path = require('path');
const webpack = require('webpack');

const MinifyPlugin = require('babel-minify-webpack-plugin');


module.exports = {
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react'],
        },
      },
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, '/src/'), 'node_modules/'],
    descriptionFiles: ['package.json'],
    extensions: ['.js', '.jsx'],
  },
  entry: {
    'feature-layer': [
      'idempotent-babel-polyfill',
      './src/feature-layer.js',
    ],
    'feature-layer.min': [
      'idempotent-babel-polyfill',
      './src/feature-layer.js',
    ],
    'feature-service': [
      'idempotent-babel-polyfill',
      './src/feature-layer.js',
    ],
    'feature-service.min': [
      'idempotent-babel-polyfill',
      './src/feature-layer.js',
    ],
    'feature-table': [
      'idempotent-babel-polyfill',
      './src/feature-layer.js',
    ],
    'feature-table.min': [
      'idempotent-babel-polyfill',
      './src/feature-layer.js',
    ],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    library: 'arcgoose',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new MinifyPlugin({}, {
      include: /\.min\.js$/,
    }),
  ],
};
