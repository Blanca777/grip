export {}
const {BrowserWindow} = require('electron')
const {isDev} = require('./lib/env')
const path = require('path')
let win: Electron.CrossProcessExports.BrowserWindow
function create() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.resolve(__dirname, isDev ? 'watch.pre.ts' : 'watch.pre.js'),
    },
  })
  // win.menuBarVisible = false
  win.webContents.openDevTools()

  win.loadFile(path.join(__dirname, '../renderer/page/watch.html'))
}
function send(channel, ...args) {
  win.webContents.send(channel, ...args)
}
module.exports = {
  create,
  send,
}
