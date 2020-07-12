const webpack = require('webpack');	

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
	  rules: [
		{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader", include: __dirname + "/src" }
	  ]
  }
};
