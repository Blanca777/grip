export {}
const {BrowserWindow} = require('electron')
const {isDev} = require('./lib/env')
const path = require('path')
let mainWindow: Electron.CrossProcessExports.BrowserWindow
function create() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 720,
    // resizable: false,
    webPreferences: {
      preload: path.resolve(__dirname, isDev ? 'home.pre.ts' : 'home.pre.js'),
    },
  })
  mainWindow.menuBarVisible = false
  mainWindow.webContents.openDevTools()
  isDev
    ? mainWindow.loadURL('http://localhost:8080')
    : mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
}
function send(channel, ...args) {
  mainWindow.webContents.send(channel, ...args)
}
module.exports = {
  create,
  send,
}
