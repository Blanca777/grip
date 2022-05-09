// let {getScreenSources} = window.electronAPI
function play(stream) {
  let video = document.getElementById('video')
  if('srcObjec' in video){
    console.log('srcObjec in')
  }else{
    console.log('noin');
  }
  video.srcObject = stream
  video.onloadedmetadata = function () {
    video.play()
  }
}

async function getStream() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  })
  console.log(stream, typeof stream)
  return stream
}

// const pc = new window.RTCPeerConnection({})
// async function createAnswer(offer) {
//   let screenStream = await getStream()
//   pc.addTrack(screenStream)
//   await pc.setRemoteDescription(offer)
//   await pc.setLocalDescription(await pc.createAnswer())
//   console.log('answer+++:', JSON.stringify(pc.localDescription))
//   return pc.localDescription
// }
// window.createAnswer = createAnswer
async function init() {
  play(await getStream())
}
init()
// getStream()
