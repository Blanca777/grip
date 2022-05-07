const {contextBridge, ipcRenderer} = require('electron')

const pc_main = new RTCPeerConnection({})
async function createOffer() {
  const offer = await pc_main.createOffer({
    offerToReceiveAudio: false,
    offerToReceiveVideo: true,
  })
  await pc_main.setLocalDescription(offer)
  console.log('pc_main.offer:', JSON.stringify(offer))
  return pc_main.localDescription
}
async function setRemoteAnswer(answer) {
  await pc_main.setRemoteDescription(answer)
}
pc_main.ontrack = function (e) {
  console.log('ontrack:', JSON.stringify(e.streams[0]))
}
createOffer()
contextBridge.exposeInMainWorld('electronAPI', {
  getLocalChannel: async function () {
    let localChannel = await ipcRenderer.invoke('getLocalChannel')
    return localChannel
  },
  toWatch: function (remoteChannel) {
    ipcRenderer.send('toWatch', remoteChannel)
  },
  toShare: function (localChannel) {
    ipcRenderer.send('toShare', localChannel)
  },

  addWatchListener: (toWatchSuccessHandle, toWatchFailHandle) => {
    ipcRenderer.on('toWatchSuccess', toWatchSuccessHandle)
    ipcRenderer.on('toWatchFail', toWatchFailHandle)
  },
  removeWatchListener: (toWatchSuccessHandle, toWatchFailHandle) => {
    ipcRenderer.removeListener('toWatchSuccess', toWatchSuccessHandle)
    ipcRenderer.removeListener('toWatchFail', toWatchFailHandle)
  },

  addShareListener: (toShareSuccessHandle, toShareFailHandle) => {
    ipcRenderer.on('toShareSuccess', toShareSuccessHandle)
    ipcRenderer.on('toShareFail', toShareFailHandle)
  },
  removeShareListener: (toShareSuccessHandle, toShareFailHandle) => {
    ipcRenderer.removeListener('toShareSuccess', toShareSuccessHandle)
    ipcRenderer.removeListener('toShareFail', toShareFailHandle)
  },

  addWhoIntoChannelListener: callback => {
    ipcRenderer.send('addWhoIntoChannelListener')
    ipcRenderer.on('whoIntoChannel', callback)
  },
  removeWhoIntoChannelListener: callback => {
    ipcRenderer.removeListener('addWhoIntoChannelListener', callback)
  },
  getScreenSources: async function () {
    let sources = await ipcRenderer.invoke('getVideoSources')
    return sources
  },
  setRemoteAnswer: setRemoteAnswer,
})
