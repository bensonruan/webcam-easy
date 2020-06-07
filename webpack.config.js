var webpack = require('webpack');
var path = require('path');
var paths = {
	src: path.join(__dirname, 'src'),
	dist: path.join(__dirname, 'dist'),
};
module.exports = {
	entry: ['@babel/polyfill', paths.src + '/webcam-easy.js'],
	output: {
		path: paths.dist,
		filename: 'webcam-easy.js'
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ["@babel/preset-env"],
					plugins: [
						"@babel/plugin-syntax-class-properties",
						"@babel/plugin-proposal-class-properties",
						"@babel/plugin-proposal-object-rest-spread"
					]
				}
			}
		}]
	}
};
