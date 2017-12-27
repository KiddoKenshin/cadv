'use strict';

const env = process.env.NODE_ENV;
const compressOpt = {
  drop_console: true,
  warnings: false
};
const webpack = require('webpack');
module.exports = {

  entry: {
    'cadv': './src/cadv.js',
    'cadv.min': './src/cadv.js'
  },
  output: {
    path: __dirname,
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true,
      sourceMap: true,
      compress: env === 'production' ? compressOpt : {}
    })
  ]
};
