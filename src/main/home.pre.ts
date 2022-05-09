const {contextBridge, ipcRenderer, desktopCapturer} = require('electron')

let pc = new RTCPeerConnection()
let candidates = []
let gumStream
async function addIceCandidate(candidate) {
  // candidate = JSON.parse(candidate)
  if (candidate) {
    candidates.push(candidate)
  }
  if (pc?.remoteDescription && pc?.remoteDescription?.type) {
    console.log(pc.remoteDescription.type)
    console.log('当前已经添加远程端信息，将candidate加入pc');
    console.log('remoteDescription:'+pc.remoteDescription)
    console.log('remoteDescriptionType:'+pc.remoteDescription.type)
    for (let i = 0; i < candidates.length; i++) {
      await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
    }
    candidates = []
  }else{
    console.log('当前还未添加远程端信息，将candidate放入数组');
    
  }
}
const getMediaScreen = async () => {
  console.log('准备获取本地流')
  gumStream = await navigator.mediaDevices.getUserMedia({audio: false, video: true})
  console.log('成功设置流，等待发送')
  return gumStream
}
getMediaScreen()
const callerSendOffer = async () => {
  console.log('呼叫人 send offer')
  pc.onicecandidate = function (e) {
    ipcRenderer.send('callerSendCandidate', JSON.stringify(e.candidate))
  }
  // const mst = new MediaStreamTrack()
  for (let mst of gumStream.getTracks()) {
    pc.addTrack(mst, gumStream)
  }

  let offer = await pc.createOffer()
  pc.setLocalDescription(offer)
  ipcRenderer.send('callerSendOffer', JSON.stringify(offer))
}
const calleeSetOfferAndSendAnswer = async (e, offer) => {
  console.log('被呼叫人：设置offer并发送answer')
  console.log('收到的offer:' + offer)
  pc.onicecandidate = e => {
    ipcRenderer.send('calleeSendCandidate', JSON.stringify(e.candidate))
  }
  pc.setRemoteDescription(offer)

  for (let mst of gumStream.getTracks()) {
    pc.addTrack(mst, gumStream)
  }

  const answer = await pc.createAnswer()
  pc.setLocalDescription(answer)
  ipcRenderer.send('calleeSendAnswer', JSON.stringify(answer))
}
const callerSetAnswer = async (e, answer) => {
  console.log('呼叫人：收到answer并设置,answer:'+answer)
  pc.setRemoteDescription(answer)
}
const callerAddIceCandidate = (e, candidate) => {
  console.log('呼叫人：收到candidate并添加上')
  console.log('收到的candidate:' + candidate)
  addIceCandidate(candidate)
}
const calleeAddIceCandidate = (e, candidate) => {
  console.log('被呼叫人：收到candidate并添加上')
  console.log('收到的candidate:' + candidate)
  addIceCandidate(candidate)
}
const addVideoSrcObjec = (remoteStream, localStream) => {
  let remoteVideo = document.getElementById('remoteVideo')
  let localvideo = document.getElementById('localVideo')
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
contextBridge.exposeInMainWorld('electronAPI', {
  getLocalChannel: async function () {
    let localChannel = await ipcRenderer.invoke('getLocalChannel')
    return localChannel
  },
  callerToCall: function (remoteChannel, callerToCallResultCallback, callerOpenVideo) {
    ipcRenderer.send('callerToCall', remoteChannel)
    ipcRenderer.once('callerToCallResult', (e, result) => {
      callerToCallResultCallback(result)
      if (result.code === 1) {
        ipcRenderer.on('calleeAcceptCall', (e, remoteChannel) => {
          callerSendOffer()
          callerOpenVideo(remoteChannel)
        })
        ipcRenderer.on('calleeSendAnswer', callerSetAnswer)
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
  addTrackCallback: async function () {
    pc.ontrack = async ev => {
      console.log('ontrack：有媒体流进入')

      if (ev.streams && ev.streams[0]) {
        console.log(ev.streams[0], gumStream)
        console.log('ontrack：streams[0]存在,直接使用')
        addVideoSrcObjec(ev.streams[0], gumStream)
      } else {
        console.log('ontrack：streams[0]不存在，使用track自建媒体流')
        let inboundStream = new MediaStream()
        inboundStream.addTrack(ev.track)
        addVideoSrcObjec(inboundStream, gumStream)
      }
    }
  },
})
