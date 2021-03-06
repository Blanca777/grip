const path = require('path')
const {srcMainPath, distMainPath} = require('./webpack.paths')
const {merge} = require('webpack-merge')
const webpackBase = require('./webpack.base')
module.exports = merge(webpackBase, {
  mode: 'production',
  target: 'electron-main',
  entry: {
    main: path.join(srcMainPath, 'main.ts'),
    preload: path.join(srcMainPath, 'preload.ts'),
  },

  output: {
    filename: '[name].js',
    path: distMainPath,
  },
  node: {
    __dirname: false,
    __filename: false,
  },
})
