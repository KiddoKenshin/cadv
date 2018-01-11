'use strict';

const webpack = require('webpack');
module.exports = {
  entry: {
    'cadv': './src/cadv.js',
    'cadv.min': './src/cadv.js'
  },
  output: {
    path: __dirname,
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'cadv'
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
    new webpack.BannerPlugin({
      banner: new Date().toString()
    }),
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true,
      sourceMap: true,
      compress: {
        drop_console: true,
        warnings: false
      }
    })
  ]
};
