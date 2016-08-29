var webpack = require('webpack');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = {
  target: 'web',
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist/',
    filename: 'validatex.min.js',
    library: 'validatex',
    libraryTarget: 'var'
  },
  externals: {
  },
  module: {
    loaders: [
      {test: /\.js/, loader: "babel", include: __dirname + "/src"}
    ]
  },
  plugins: [
    new UglifyJsPlugin()
  ]
};
