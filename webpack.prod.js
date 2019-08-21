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
    umdNamedDefine: true,
    globalObject: 'typeof self !== \'undefined\' ? self : this', // Required due to bug in Webpack 4: https://github.com/webpack/webpack/issues/6784
  },
});
