export {}
const {ipcMain, desktopCapturer} = require('electron')
const {send: sendMainWindow} = require('./home')
const {create: createControlWindow, send: sendControlWindow} = require('./watch')
const signal = require('./signal')

const ipcinit = function () {
  ipcMain.handle('getLocalChannel', function () {
    return signal.invoke('getLocalChannel', null, 'getLocalChannel')
  })
  ipcMain.on('toWatch', async (e, remoteChannel) => {
    let result = await signal.invoke('toWatch', {remoteChannel}, 'toWatchResult')
    if (result.code === 1) {
      sendMainWindow('toWatchSuccess', result.remoteChannel)
      // createControlWindow()
    } else if (result.code === 0) {
      sendMainWindow('toWatchFail', result.message)
    }
  })
  ipcMain.on('toShare', async function (e, localChannel) {
    let result = await signal.invoke('toShare', {localChannel}, 'toShareResult')
    if (result.code === 1) {
      sendMainWindow('toShareSuccess', result.message)
    } else if (result.code === 0) {
      sendMainWindow('toShareFail', result.message)
    }
  })
  ipcMain.on('closeShare', async function (e, localChannel) {
    let result = await signal.invoke('closeShare', {localChannel}, 'closeShareResult')
    if (result.code === 1) {
      sendMainWindow('closeShareSuccess', result.message)
    } else {
      sendMainWindow('closeShareFail', result.message)
    }
  })
  ipcMain.on('addWhoIntoChannelListener', e => {
    signal.on('whoIntoChannel', ({channel}) => {
      sendMainWindow('whoIntoChannel', channel)
      console.log(channel + '进入频道')
    })
  })
  ipcMain.on('addCurChannelCloselListener', e => {
    signal.on('curChannelCloseShare', ({channel}) => {
      sendMainWindow('curChannelCloseShare', channel)
      console.log('当前观看的' + channel + '关闭共享了，展示共享结束')
    })
  })
  ipcMain.handle('getVideoSources', async function () {
    return await desktopCapturer.getSources({types: ['window', 'screen']})
  })
}
module.exports = ipcinit
