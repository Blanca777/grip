const {contextBridge, ipcRenderer, desktopCapturer} = require('electron')

let pc = new RTCPeerConnection()
let candidates: any[] = []
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
const getMediaScreen = async isLocal => {
  console.log('准备获取本地流')
  let gumStream = await navigator.mediaDevices.getUserMedia({audio: !isLocal, video: true})
  console.log('成功设置流，等待发送')
  return gumStream
}
const addVideoSrcObjec = (remoteStream, localStream) => {
  let remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement
  let localvideo = document.getElementById('localVideo') as HTMLVideoElement
  remoteVideo.srcObject = remoteStream
  localvideo.srcObject = localStream
  remoteVideo.onloadedmetadata = function () {
    console.log('播放remoteVideo')
    remoteVideo.play()
  }
  localvideo.onloadedmetadata = function () {
    console.log('播放localvideo')
    localvideo.play()
  }
}
const addTrackCallback = async function () {
  pc.ontrack = async ev => {
    console.log('ontrack：有媒体流进入')
    let streams = await getMediaScreen(true)
    if (ev.streams && ev.streams[0]) {
      console.log(ev.streams[0], streams)
      console.log('ontrack：streams[0]存在,直接使用')
      addVideoSrcObjec(ev.streams[0], streams)
    } else {
      console.log('ontrack：streams[0]不存在，使用track自建媒体流')
      let inboundStream = new MediaStream()
      inboundStream.addTrack(ev.track)
      addVideoSrcObjec(inboundStream, streams)
    }
  }
}
addTrackCallback()
const callerSendOffer = async () => {
  console.log('呼叫人 send offer')
  pc.onicecandidate = function (e) {
    ipcRenderer.send('forward', 'callerSendCandidate', JSON.stringify(e.candidate))
  }
  let streams = await getMediaScreen(false)
  for (let mst of streams.getTracks()) {
    pc.addTrack(mst, streams)
  }

  let offer = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  })
  await pc.setLocalDescription(offer)
  ipcRenderer.send('forward', 'callerSendOffer', {type: pc.localDescription.type, sdp: pc.localDescription.sdp})
}
const calleeSetOfferAndSendAnswer = async (e, offer) => {
  console.log('被呼叫人：设置offer并发送answer')
  console.log('收到的offer:' + typeof offer + ':' + offer)
  pc.onicecandidate = e => {
    ipcRenderer.send('forward', 'calleeSendCandidate', JSON.stringify(e.candidate))
  }

  pc.setRemoteDescription(offer)
  let streams = await getMediaScreen(false)
  for (let mst of streams.getTracks()) {
    pc.addTrack(mst, streams)
  }
  let answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  console.log('被呼叫人创建的answer:', JSON.stringify(answer))
  ipcRenderer.send('forward', 'calleeSendAnswer', {type: pc.localDescription.type, sdp: pc.localDescription.sdp})
}
const callerSetAnswer = async (e, answer) => {
  console.log('呼叫人：收到answer并设置,answer:' + typeof answer + ':' + answer)
  pc.setRemoteDescription(answer) //出错
}

contextBridge.exposeInMainWorld('electronAPI', {
  getLocalChannel: async function () {
    let result = await ipcRenderer.invoke('getLocalChannel')
    return result
  },
  callerToCall: function (remoteChannel, callerToCallResultCallback, calleeAcceptCall, calleeRejectCall) {
    ipcRenderer.send('callerToCall', remoteChannel)
    ipcRenderer.once('callerToCallResult', (e, result) => {
      callerToCallResultCallback(result)
      if (result.code === 0) {
        ipcRenderer.once('calleeAcceptCall', (e, remoteChannel) => {
          callerSendOffer()
          calleeAcceptCall(remoteChannel)
        })
        ipcRenderer.once('calleeRejectCall', (e, remoteChannel) => {
          calleeRejectCall(remoteChannel)
        })
        ipcRenderer.once('calleeSendAnswer', callerSetAnswer)
        ipcRenderer.on('calleeSendCandidate', addIceCandidate)
      }
    })
  },
  addWhoCallListener: function (callback) {
    ipcRenderer.on('whoCall', (e, channel) => {
      callback(channel)
    })
  },
  addCloseConnectionListener: function (callback) {
    ipcRenderer.on('closeConnect', callback)
  },
  acceptCall: async function (remoteChannel, calleeAcceptCallResultCallback) {
    ipcRenderer.send('calleeAcceptCall', remoteChannel)
    ipcRenderer.once('calleeAcceptCallResult', (e, result) => {
      calleeAcceptCallResultCallback(result)
      if (result.code === 0) {
        ipcRenderer.once('callerSendOffer', calleeSetOfferAndSendAnswer)
        ipcRenderer.on('callerSendCandidate', addIceCandidate)
      }
    })
  },
  rejectCall: async function (remoteChannel) {
    ipcRenderer.send('calleeRejectCall', remoteChannel)
  },
  closeConnect: async function (remoteChannel) {
    pc.close()
    ipcRenderer.send('closeConnect', remoteChannel)
  },
})
