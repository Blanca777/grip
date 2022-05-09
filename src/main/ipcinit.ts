export {}
const {ipcMain, desktopCapturer} = require('electron')
const {send: sendMainWindow} = require('./home')
const {create: createControlWindow, send: sendControlWindow} = require('./watch')
const signal = require('./signal')

const ipcinit = function () {
  ipcMain.handle('getLocalChannel', async function () {
    return await signal.invoke('getLocalChannel', null, 'getLocalChannel')
  })
  ipcMain.on('callerToCall', async (e, remoteChannel) => {
    let result = await signal.invoke('callerToCall', {remoteChannel}, 'callerToCallResult')
    sendMainWindow('callerToCallResult', result)
    if (result.code === 1) {
      signal.once('calleeAcceptCall', async () => {
        sendMainWindow('calleeAcceptCall')
      })
      signal.once('calleeSendAnswer', async ({answer}) => {
        sendMainWindow('calleeSendAnswer', answer)
      })
      signal.once('calleeSendCandidate', async ({candidate}) => {
        sendMainWindow('calleeSendCandidate', candidate)
      })
    }
  })
  ipcMain.on('addWhoCallListener', async () => {
    signal.once('whoCall', ({channel}) => {
      sendMainWindow('whoCall', channel)
    })
  })
  ipcMain.on('calleeAcceptCall', async (e, remoteChannel) => {
    console.log('calleeAcceptCall:同意连接' + remoteChannel)
    let result = await signal.invoke('calleeAcceptCall', {remoteChannel}, 'calleeAcceptCallResult')
    sendMainWindow('calleeAcceptCallResult', result)
    if (result.code === 1) {
      signal.once('callerSendOffer', ({offer}) => {
        sendMainWindow('callerSendOffer', offer)
      })
      signal.on('callerSendCandidate', ({candidate}) => {
        sendMainWindow('callerSendCandidate', candidate)
      })
    }
  })
  ipcMain.on('callerSendOffer', (e, offer) => {
    signal.send('forwrad', {event: 'callerSendOffer', data: {offer}})
  })
  ipcMain.on('calleeSendAnswer', (e, answer) => {
    signal.send('forwrad', {event: 'calleeSendAnswer', data: {answer}})
  })
  ipcMain.on('callerSendCandidate', (e, candidate) => {
    signal.send('forwrad', {event: 'callerSendCandidate', data: {candidate}})
  })
  ipcMain.on('calleeSendCandidate', (e, candidate) => {
    signal.send('forwrad', {event: 'calleeSendCandidate', data: {candidate}})
  })
}
module.exports = ipcinit
