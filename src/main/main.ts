const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const {isDev, isProd} = require('./lib/env')
const ipcinit = require('./ipcinit')
const {create: createMainWindow} = require('./home')
app.whenReady().then(() => {
  // createControlWindow()
  createMainWindow()
  ipcinit()
})
