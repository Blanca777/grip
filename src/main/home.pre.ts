const {contextBridge, ipcRenderer, desktopCapturer} = require('electron')

let pc = new RTCPeerConnection()
let candidates = []
async function addIceCandidate(candidate) {
  if (candidate) {
    candidates.push(JSON.parse(candidate))
  }
  if (pc?.remoteDescription && pc?.remoteDescription?.type) {
    for (let i = 0; i < candidates.length; i++) {
      await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
    }
    candidates = []
  }
}
const getMediaScreen = async () => {
  const gumStream = await navigator.mediaDevices.getUserMedia({audio: false, video: true})
  return gumStream
}
const callerSendOffer = async () => {
  console.log('send offer')
  pc.onicecandidate = function (e) {
    ipcRenderer.send('callerSendCandidate', JSON.stringify(e.candidate))
  }
  console.log(111)
  let gumStream = await getMediaScreen()

  console.log(gumStream)

  for (const track of gumStream.getTracks()) {
    pc.addTrack(track)
  }
  let offer = await pc.createOffer()
  pc.setLocalDescription(offer)
  ipcRenderer.send('callerSendOffer', JSON.stringify(offer))
}
const calleeSetOfferAndSendAnswer = async (e, offer) => {
  pc.onicecandidate = e => {
    ipcRenderer.send('calleeSendCandidate', e.candidate)
  }
  pc.setRemoteDescription(JSON.parse(offer))
  let gumStream = await getMediaScreen()
  for (const track of gumStream.getTracks()) {
    pc.addTrack(track)
  }
  const answer = await pc.createAnswer()
  pc.setLocalDescription(answer)
  ipcRenderer.send('calleeSendAnswer', JSON.stringify(answer))
}
const callerSetAnswer = async (e, answer) => {
  pc.setRemoteDescription(JSON.parse(answer))
}
const callerAddIceCandidate = (e, candidate) => {
  addIceCandidate(candidate)
}
const calleeAddIceCandidate = (e, candidate) => {
  addIceCandidate(candidate)
}
contextBridge.exposeInMainWorld('electronAPI', {
  getLocalChannel: async function () {
    let localChannel = await ipcRenderer.invoke('getLocalChannel')
    return localChannel
  },
  callerToCall: function (remoteChannel, callerToCallResultCallback) {
    ipcRenderer.send('callerToCall', remoteChannel)
    ipcRenderer.once('callerToCallResult', (e, result) => {
      callerToCallResultCallback(result)
      if (result.code === 1) {
        ipcRenderer.once('calleeAcceptCall', callerSendOffer)
        ipcRenderer.once('calleeSendAnswer', callerSetAnswer)
        ipcRenderer.on('calleeSendCandidate', callerAddIceCandidate)
      }
    })
  },
  addWhoCallListener: function (callback) {
    ipcRenderer.send('addWhoCallListener')
    ipcRenderer.once('whoCall', callback)
  },
  acceptCall: async function (remoteChannel, calleeAcceptCallResultCallback) {
    console.log('acceptCall' + remoteChannel)
    ipcRenderer.send('calleeAcceptCall', remoteChannel)
    ipcRenderer.once('calleeAcceptCallResult', (e, result) => {
      calleeAcceptCallResultCallback(result)
      if (result.code === 1) {
        ipcRenderer.once('callerSendOffer', calleeSetOfferAndSendAnswer)
        ipcRenderer.on('callerSendCandidate', calleeAddIceCandidate)
      }
    })
  },
  addTrackCallback: async function (callback) {
    let localStream = await getMediaScreen()
    pc.ontrack = async e => {
      callback(e.streams, localStream)
    }
  },
})
