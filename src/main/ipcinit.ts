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
      console.log('intochannel:', result.remoteChannel)
      sendMainWindow('toWatchSuccess', result.remoteChannel)
      // createControlWindow()
    } else if (result.code === 0) {
      sendMainWindow('toWatchFail', result.message)
    }
  })
  ipcMain.on('toShare', async function (e, localChannel) {
    let result = await signal.invoke('toShare', {localChannel},'toShareResult')
    if (result.code === 1) {
      sendMainWindow('toShareSuccess', result.message)
    } else if (result.code === 0) {
      sendMainWindow('toShareFail', result.message)
    }
  })
  ipcMain.on('addWhoIntoChannelListener',(e)=>{
    console.log('addWhoIntoChannelListener')
    signal.on('whoIntoChannel', ({channel}) => {
      sendMainWindow('whoIntoChannel', channel)
      console.log(channel + '进入频道')
    })
  })
  ipcMain.handle('getVideoSources', async function () {
    return await desktopCapturer.getSources({types: ['window', 'screen']})
  })
}
module.exports = ipcinit
