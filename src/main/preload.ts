const {contextBridge, ipcRenderer, desktopCapturer} = require('electron')

let pc: RTCPeerConnection = new RTCPeerConnection()
// let remoteSenders: RTCRtpSender[] = []
let candidates: any[] = []
let mediaScreen: MediaStream | null
let isInitGetMediaScreen: boolean = true
let readyRemoteVideo
const ipcChannels: string[] = [
  'callerToCallResult',
  'callerToCallResult',
  'calleeAcceptCall',
  'calleeRejectCall',
  'calleeSendAnswer',
  'calleeSendCandidate',
  'calleeAcceptCallResult',
  'callerSendOffer',
  'callerSendCandidate',
]
contextBridge.exposeInMainWorld('electronAPI', {
  changeLocalChannelMsg: async function (localMsg) {
    let result = await ipcRenderer.invoke('changeLocalChannelMsg', localMsg)
    return result
  },
  getAllChannel: async function () {
    let channels = await ipcRenderer.invoke('getAllChannel')
    return channels
  },
  addWhoCallListener: function (callback) {
    ipcRenderer.removeAllListeners('whoCall')
    ipcRenderer.on('whoCall', (e, channel) => {
      callback(channel)
    })
  },
  addCloseConnectionListener: function (callback) {
    ipcRenderer.on('closeConnect', async () => {
      // for (let i = 0; i < remoteSenders.length; i++) {
      //   pc.removeTrack(remoteSenders[i])
      // }
      initEnv()
      callback()
    })
  },
  addReadyRemoteVideoCallback: function (callback) {
    readyRemoteVideo = callback
  },
  getLocalChannel: async function () {
    let result = await ipcRenderer.invoke('getLocalChannel')
    return result
  },

  callerToCall: function (remoteChannel, callerToCallResultCallback, calleeAcceptCall, calleeRejectCall) {
    ipcRenderer.send('callerToCall', remoteChannel)
    ipcRenderer.once('callerToCallResult', (e, result) => {
      callerToCallResultCallback(result)
      if (result.code === 0) {
        ipcRenderer.once('calleeAcceptCall', (e, userMsg) => {
          addLocalVideoSrcObject()
          callerSendOffer()
          calleeAcceptCall(userMsg)
          removerIpcRendererListener('calleeRejectCall')
        })
        ipcRenderer.once('calleeRejectCall', (e, userMsg) => {
          calleeRejectCall(userMsg)
          removerIpcRendererListener('calleeAcceptCall', 'calleeSendAnswer', 'calleeSendCandidate')
        })
        ipcRenderer.once('calleeSendAnswer', callerSetAnswer)
        ipcRenderer.on('calleeSendCandidate', addIceCandidate)
      }
    })
  },

  acceptCall: async function (remoteChannel, calleeAcceptCallResultCallback) {
    ipcRenderer.send('calleeAcceptCall', remoteChannel)
    ipcRenderer.once('calleeAcceptCallResult', (e, result) => {
      calleeAcceptCallResultCallback(result)
      if (result.code === 0) {
        addLocalVideoSrcObject()
        ipcRenderer.once('callerSendOffer', calleeSetOfferAndSendAnswer)
        ipcRenderer.on('callerSendCandidate', addIceCandidate)
      }
    })
  },
  rejectCall: async function (remoteChannel) {
    ipcRenderer.send('calleeRejectCall', remoteChannel)
  },
  closeConnect: async function (remoteChannel) {
    // for (let i = 0; i < remoteSenders.length; i++) {
    //   pc.removeTrack(remoteSenders[i])
    // }
    initEnv()

    ipcRenderer.send('closeConnect', remoteChannel)
  },
})
function removerIpcRendererListener(...channels) {
  for (let i = 0; i < channels.length; i++) {
    ipcRenderer.removeAllListeners(channels[i])
  }
}
async function addIceCandidate(e, candidate) {
  try {
    let candi = JSON.parse(candidate)
    if (candi) {
      candidates.push(candi)
    }
  } catch (err) {}

  if (pc?.remoteDescription && pc?.remoteDescription?.type) {
    console.log('?????????????????????????????????????????????candidate??????pc')
    for (let i = 0; i < candidates.length; i++) {
      // console.log('candidate:', typeof candidates[i], candidates[i])
      await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
    }
    candidates = []
  } else {
    console.log('???????????????????????????????????????candidate????????????')
  }
}
function addRemoteVideoSrcObject(remoteStream) {
  console.log('????????????????????????remotevideo?????????', remoteStream)
  let remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement
  remoteVideo.srcObject = remoteStream
  remoteVideo.onloadedmetadata = function () {
    console.log('??????remoteVideo')
    if (readyRemoteVideo) {
      readyRemoteVideo()
    }
    remoteVideo.play()
  }
}
async function addLocalVideoSrcObject() {
  let stream = await getMediaScreen()
  console.log('????????????????????????localvideo?????????', stream)
  let newStream = new MediaStream(stream.getVideoTracks())
  let localvideo = document.getElementById('localVideo') as HTMLVideoElement
  localvideo.srcObject = newStream
  localvideo.onloadedmetadata = function () {
    console.log('??????localvideo')
    localvideo.play()
  }
}
async function getMediaScreen() {
  if (!mediaScreen || isInitGetMediaScreen) {
    isInitGetMediaScreen = false
    mediaScreen = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
  }
  return mediaScreen
}
function stopVideo() {
  if (mediaScreen) {
    mediaScreen.getVideoTracks().forEach(track => {
      track.stop()
      console.log(track.kind, '??????', '?????????', track.readyState)
    })
    mediaScreen.getAudioTracks().forEach(track => {
      track.stop()
      console.log(track.kind, '??????', '?????????', track.readyState)
    })
  }
}
async function initEnv() {
  stopVideo()
  pc = new RTCPeerConnection()
  addTrackCallback()
  candidates = []
  isInitGetMediaScreen = true
  mediaScreen = null
  removerIpcRendererListener(ipcChannels)
}

async function addTrackCallback() {
  pc.ontrack = async ev => {
    console.log('ontrack???????????????????????????')
    if (ev.streams && ev.streams[0]) {
      console.log('ontrack???streams[0]??????,????????????:', ev.streams[0])
      addRemoteVideoSrcObject(ev.streams[0])
    } else {
      console.log('ontrack?????????track???????????????')
      let inboundStream = new MediaStream()
      inboundStream.addTrack(ev.track)
      addRemoteVideoSrcObject(inboundStream)
    }
  }
}
addTrackCallback()
async function callerSendOffer() {
  console.log('????????? send offer')
  pc.onicecandidate = function (e) {
    if (e.candidate !== null) {
      ipcRenderer.send('forward', 'callerSendCandidate', JSON.stringify(e.candidate))
    }
  }
  let streams = await getMediaScreen()
  for (let mst of streams.getTracks()) {
    console.log('???????????????', mst)
    pc.addTrack(mst, streams)
    // let remoteSender = pc.addTrack(mst, streams)
    // remoteSenders.push(remoteSender)
  }

  let offer = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  })
  await pc.setLocalDescription(offer)
  ipcRenderer.send('forward', 'callerSendOffer', {type: pc.localDescription?.type, sdp: pc.localDescription?.sdp})
}
async function calleeSetOfferAndSendAnswer(e, offer) {
  console.log('?????????????????????offer?????????answer')
  console.log('?????????offer:' + typeof offer + ':' + offer)
  pc.onicecandidate = e => {
    ipcRenderer.send('forward', 'calleeSendCandidate', JSON.stringify(e.candidate))
  }

  pc.setRemoteDescription(offer)
  let streams = await getMediaScreen()
  for (let mst of streams.getTracks()) {
    pc.addTrack(mst, streams)
    // let remoteSender = pc.addTrack(mst, streams)
    // remoteSenders.push(remoteSender)
  }
  let answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  console.log('?????????????????????answer:', answer)
  ipcRenderer.send('forward', 'calleeSendAnswer', {type: pc.localDescription?.type, sdp: pc.localDescription?.sdp})
}
async function callerSetAnswer(e, answer) {
  console.log('??????????????????answer?????????,answer:' + typeof answer + ':' + answer)
  await pc.setRemoteDescription(answer)
  console.log('???????????????????????????????????????', pc.remoteDescription)

  //?????????candidate????????????????????????????????????????????????candidate????????????pc
  addIceCandidate(null, null)
}
