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
    console.log('当前已经添加远程端信息，将所有candidate加入pc')
    for (let i = 0; i < candidates.length; i++) {
      console.log('candidate:', typeof candidates[i], candidates[i])
      await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
    }
    candidates = []
  } else {
    console.log('当前还未添加远程端信息，将candidate放入数组')
  }
}
function addRemoteVideoSrcObject(remoteStream) {
  console.log('添加远程媒体流到remotevideo标签：', remoteStream)
  let remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement
  remoteVideo.srcObject = remoteStream
  remoteVideo.onloadedmetadata = function () {
    console.log('播放remoteVideo')
    if (readyRemoteVideo) {
      readyRemoteVideo()
    }
    remoteVideo.play()
  }
}
async function addLocalVideoSrcObject() {
  let stream = await getMediaScreen()
  console.log('添加本地媒体流到localvideo标签：', stream)
  let newStream = new MediaStream(stream.getVideoTracks())
  let localvideo = document.getElementById('localVideo') as HTMLVideoElement
  localvideo.srcObject = newStream
  localvideo.onloadedmetadata = function () {
    console.log('播放localvideo')
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
  console.log('start 关闭摄像头,mediaScreen:', mediaScreen)
  if (mediaScreen) {
    mediaScreen.getTracks().forEach(track => {
      track.stop()
      console.log(track.kind, '关闭', '状态：', track.readyState)
    })
  }
  console.log('end 关闭摄像头,mediaScreen:', mediaScreen)
}
function initEnv() {
  stopVideo()
  pc = new RTCPeerConnection()
  addTrackCallback()
  candidates = []
  isInitGetMediaScreen = true
  mediaScreen = null
  removerIpcRendererListener(ipcChannels)
}

async function addTrackCallback() {
  let inboundStream = new MediaStream()
  pc.ontrack = async ev => {
    console.log('ontrack：使用track自建媒体流,track:', ev.track)
    inboundStream.addTrack(ev.track)
    if (inboundStream.getTracks().length < 2) {
      addRemoteVideoSrcObject(inboundStream)
    }

    // if (ev.streams && ev.streams[0]) {
    //   console.log('ontrack：streams[0]存在,直接使用:', ev.streams[0])
    //   addRemoteVideoSrcObject(ev.streams[0])
    // } else {
    //   console.log('ontrack：使用track自建媒体流')
    //   let inboundStream = new MediaStream()
    //   inboundStream.addTrack(ev.track)
    //   addRemoteVideoSrcObject(inboundStream)
    // }
  }
}
addTrackCallback()
async function callerSendOffer() {
  console.log('呼叫人 send offer')
  pc.onicecandidate = function (e) {
    if (e.candidate !== null) {
      ipcRenderer.send('forward', 'callerSendCandidate', JSON.stringify(e.candidate))
    }
  }
  let streams = await getMediaScreen()
  for (let mst of streams.getTracks()) {
    console.log('推送轨道：', mst)
    pc.addTrack(mst)
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
  console.log('被呼叫人：设置offer并发送answer')
  console.log('收到的offer:' + typeof offer + ':' + offer)
  pc.onicecandidate = e => {
    ipcRenderer.send('forward', 'calleeSendCandidate', JSON.stringify(e.candidate))
  }

  pc.setRemoteDescription(offer)
  let streams = await getMediaScreen()
  for (let mst of streams.getTracks()) {
    pc.addTrack(mst)
    // let remoteSender = pc.addTrack(mst, streams)
    // remoteSenders.push(remoteSender)
  }
  let answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  console.log('被呼叫人创建的answer:', JSON.stringify(answer))
  ipcRenderer.send('forward', 'calleeSendAnswer', {type: pc.localDescription?.type, sdp: pc.localDescription?.sdp})
}
async function callerSetAnswer(e, answer) {
  console.log('呼叫人：收到answer并设置,answer:' + typeof answer + ':' + answer)
  await pc.setRemoteDescription(answer)
  console.log('呼叫人已经设置上远程描述：', pc.remoteDescription)

  //未避免candidate传输完，远程描述还未设置上，导致candidate没能加入pc
  addIceCandidate(null, null)
}
