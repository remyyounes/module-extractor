const rootPath = require('app-root-path').path;
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const CssModules = {
  loader: 'css-loader',
  options: {
    modules: true,
    importLoaders: 1,
    localIdentName: process.env.NODE_ENV === 'production' ? '[sha512:hash:base64:8]' : '[path]___[name]__[local]___[hash:base64:5]',
  },
};

const inlineSizeLimit = 25000;

const config = {
  // what exactly are you?
  context: `${rootPath}/src`,

  entry: {
    index: [
      path.resolve('src/index'),
    ],
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          plugins: ['transform-runtime', 'transform-decorators-legacy'],
          presets: [
            ['env', {
              targets: {
                forceAllTransforms: true,
              },
              modules: false,
            }],
            'react',
            'stage-0',
          ],
        },
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          CssModules,
          {
            loader: 'postcss-loader',
            options: {
              plugins() {
                return [
                  autoprefixer({ browsers: 'last 2 versions' }),
                ];
              },
            },
          },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: inlineSizeLimit,
          name: '[sha512:hash:base64:7].[ext]',
        },
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: inlineSizeLimit,
              name: '[sha512:hash:base64:7].[ext]',
            },
          },
        ],
      },
    ],
  },

  output: {
    path: `${__dirname}/build/`,
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
  },

  resolve: {
    modules: [
      `${rootPath}/src`,
      'node_modules',
      path.resolve('./src/_shared'),
    ],

    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'highcharts-more': 'highcharts/highcharts-more.src.js',
      'highcharts-exporting': 'highcharts/modules/exporting.src.js',
      'highcharts-offline-exporting': 'highcharts/modules/offline-exporting.src.js',
    },

    extensions: ['.js', '.jsx', '.json', '.css', '.scss'],
  },

  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.HashedModuleIdsPlugin({
      hashFunction: 'sha256',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ],
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
      drop_debugger: true,
      drop_console: true,
    },
    output: {
      comments: false,
    },
    sourceMap: false,
  }));
}

module.exports = config;
