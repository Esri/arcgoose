const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'arcgoose.js',
    library: 'arcgoose',
    libraryTarget: 'umd',
  },
});
