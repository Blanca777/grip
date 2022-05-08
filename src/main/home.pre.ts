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
  closeShare: function (localChannel){
    ipcRenderer.send('closeShare', localChannel)
  },
  // 观看端：监听是否成功进入频道
  addWatchListener: (toWatchSuccessHandle, toWatchFailHandle) => {
    ipcRenderer.once('toWatchSuccess', toWatchSuccessHandle)
    ipcRenderer.once('toWatchFail', toWatchFailHandle)
  },
  //共享端：开启共享
  addShareListener: (toShareSuccessHandle, toShareFailHandle) => {
    ipcRenderer.once('toShareSuccess', toShareSuccessHandle)
    ipcRenderer.once('toShareFail', toShareFailHandle)
  },
  //共享端：关闭共享
  addCloseShareListener: (closeShareSuccessHandle, closeShareFailHandle) => {
    ipcRenderer.once('closeShareSuccess', closeShareSuccessHandle)
    ipcRenderer.once('closeShareFail', closeShareFailHandle)
  },
  //共享端：监听谁进入频道
  addWhoIntoChannelListener: callback => {
    ipcRenderer.send('addWhoIntoChannelListener')
    ipcRenderer.on('whoIntoChannel', callback)
  },
  removeWhoIntoChannelListener: () => {
    ipcRenderer.removeAllListeners('whoIntoChannel')
  },
  //观看端 监听当前频道是否关闭
  addCurChannelCloseListener: callback => {
    ipcRenderer.send('addCurChannelCloselListener')
    ipcRenderer.once('curChannelCloseShare', callback)
  },


  getScreenSources: async function () {
    let sources = await ipcRenderer.invoke('getVideoSources')
    return sources
  },
  setRemoteAnswer: setRemoteAnswer,
})
