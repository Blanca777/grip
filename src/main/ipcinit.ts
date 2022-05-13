export {}
const {ipcMain} = require('electron')
const {send: sendMainWindow} = require('./home')
const signal = require('./signal')

const ipcinit = function () {
  signal.once('whoCall', ({channel}) => {
    sendMainWindow('whoCall', channel)
  })
  signal.once('closeConnect', () => {
    sendMainWindow('closeConnect')
  })
  ipcMain.handle('getLocalChannel', async function () {
    return await signal.invoke('getLocalChannel', null, 'getLocalChannelResult')
  })
  ipcMain.on('callerToCall', async (e, remoteChannel) => {
    let result = await signal.invoke('callerToCall', {remoteChannel}, 'callerToCallResult')
    sendMainWindow('callerToCallResult', result)
    if (result.code === 0) {
      signal.once('calleeAcceptCall', async ({remoteChannel}) => {
        sendMainWindow('calleeAcceptCall', remoteChannel)
      })
      signal.once('calleeRejectCall', async ({remoteChannel}) => {
        sendMainWindow('calleeRejectCall', remoteChannel)
      })
      signal.once('calleeSendAnswer', async answer => {
        sendMainWindow('calleeSendAnswer', answer)
      })
      signal.on('calleeSendCandidate', async candidate => {
        sendMainWindow('calleeSendCandidate', candidate)
      })
    }
  })
  ipcMain.on('calleeAcceptCall', async (e, remoteChannel) => {
    console.log('同意连接' + remoteChannel)
    let result = await signal.invoke('calleeAcceptCall', {remoteChannel}, 'calleeAcceptCallResult')
    sendMainWindow('calleeAcceptCallResult', result)
    if (result.code === 0) {
      signal.once('callerSendOffer', offer => {
        sendMainWindow('callerSendOffer', offer)
      })
      signal.on('callerSendCandidate', candidate => {
        sendMainWindow('callerSendCandidate', candidate)
      })
    }
  })
  ipcMain.on('calleeRejectCall', (e, remoteChannel) => {
    signal.send('calleeRejectCall', {remoteChannel})
  })
  ipcMain.on('forward', (e, event, data) => {
    signal.send('forward', {event, data})
  })
  ipcMain.on('closeConnect', (e, remoteChannel) => {
    signal.send('closeConnect', {remoteChannel})
  })
}
module.exports = ipcinit
