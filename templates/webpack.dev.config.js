const webpack = require('webpack');
const baseConfig = require('./webpack.config');

module.exports = Object.assign(baseConfig, {
  devServer: {
    host: '0.0.0.0',
    headers: { 'Access-Control-Allow-Origin': '*' },
    port: 5000,
    compress: true,
  },
  output: {
    path: '/',
    publicPath: 'http://localhost:5000/',
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
    devtoolModuleFilenameTemplate: '/[absolute-resource-path]',
  },
  devtool: 'eval-source-map',
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
});
