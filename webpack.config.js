const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');


const hotReplacementPlugin = new webpack.HotModuleReplacementPlugin();
const loaderOptionsPlugin = new webpack.LoaderOptionsPlugin({ debug: true });

module.exports = {
	entry: ['./src/main.js'],
	output: {
		path: path.join(__dirname, './build/temp'),
		filename: 'diplom.js',
	},
	module: {
		rules: [{
			test: /\.js$/,
			loader: 'babel-loader',
			exclude: /node_modules/,
		}, {
			test: /\.html$/,
			loader: 'file-loader',
			options: {
				name: '[path][name].[ext]',
				context: './src',
			},
		}, {
			test: /\.css$/,
			use: [
				'style-loader',
				'css-loader?sourceMap',
				'resolve-url-loader',
			],
		}, {
			test: /\.(png|jpg|woff|ttf|woff2)$/,
			loader: 'url-loader',
			options: {
				limit: 100000,
			},
		}],
	},
	devtool: 'source-map',
	stats: {
		colors: true,
	},
	plugins: [
		hotReplacementPlugin,
		loaderOptionsPlugin,
	],
	devServer: {
		headers: { 'Access-Control-Allow-Origin': '*' },
		historyApiFallback: {
			rewrites: [
				{ from: /./, to: '/' },
			],
		},
	},
};
