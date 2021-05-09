const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    // host: '0.0.0.0',
    // https: true,
    // disableHostCheck: true,
    // useLocalIp: true,
    compress: true,
    hot: true,
    open: true,
    quiet: true,
    overlay: {
      warnings: false,
      errors: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
            },
          },
        ],
      },
    ],
  },
})
