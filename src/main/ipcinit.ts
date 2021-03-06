export {}
const {ipcMain} = require('electron')
const {send: sendMainWindow} = require('./home')
const signal = require('./signal')
function removeOldListener(...events) {
  for (let i = 0; i < events.length; i++) {
    signal.removeAllListeners(events[i])
  }
}
const ipcinit = function () {
  ipcMain.handle('changeLocalChannelMsg', async function (e, localMsg){
    return await signal.invoke('changeLocalChannelMsg', localMsg, 'changeLocalChannelMsgResult')
  })
  ipcMain.handle('getAllChannel',async function(){
    return await signal.invoke('getAllChannel', null, 'getAllChannelResult')
  })
  signal.on('whoCall', ({userMsg}) => {
    sendMainWindow('whoCall', userMsg)
  })
  signal.on('closeConnect', () => {
    sendMainWindow('closeConnect')
    removeOldListener('callerSendCandidate', 'calleeSendCandidate')
  })
  ipcMain.handle('getLocalChannel', async function () {
    return await signal.invoke('getLocalChannel', null, 'getLocalChannelResult')
  })
  ipcMain.on('callerToCall', async (e, remoteChannel) => {
    let result = await signal.invoke('callerToCall', {remoteChannel}, 'callerToCallResult')
    sendMainWindow('callerToCallResult', result)
    if (result.code === 0) {
      signal.once('calleeAcceptCall', ({userMsg}) => {
        sendMainWindow('calleeAcceptCall', userMsg)
        removeOldListener('calleeRejectCall')
      })
      signal.once('calleeRejectCall', ({userMsg}) => {
        sendMainWindow('calleeRejectCall', userMsg)
        removeOldListener('calleeAcceptCall', 'calleeSendAnswer', 'calleeSendCandidate')
      })
      signal.once('calleeSendAnswer', answer => {
        sendMainWindow('calleeSendAnswer', answer)
      })
      signal.on('calleeSendCandidate', candidate => {
        sendMainWindow('calleeSendCandidate', candidate)
      })
    }
  })
  ipcMain.on('calleeAcceptCall', async (e, remoteChannel) => {
    console.log('εζθΏζ₯' + remoteChannel)
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
    removeOldListener('callerSendCandidate', 'calleeSendCandidate')
  })
}
module.exports = ipcinit
