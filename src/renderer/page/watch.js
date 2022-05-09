// let {getScreenSources} = window.electronAPI
function play(stream) {
  let video = document.getElementById('video')
  video.srcObject = stream
  video.onloadedmetadata = function () {
    video.play()
  }
}

async function getStream() {
  // let sources = await getScreenSources()
  // console.log(sources)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      // audio: true,
    })
    return stream
  } catch (err) {
    console.log(err)
  }
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
