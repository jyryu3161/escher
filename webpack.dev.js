const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge.smart(common, {
  mode: 'development',
  entry: './dev-server/index.js',
  output: {
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './dev-server',
    open: false,
    port: 5000,
    host: '0.0.0.0',
    disableHostCheck: true
  }
})
