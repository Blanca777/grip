import React, {useContext, useState, useRef, useEffect} from 'react'
import StoreContext from '../../state/context'
import css from './index.css'
const {getLocalChannel, callerToCall, addWhoCallListener, acceptCall, addTrackCallback} = window.electronAPI
const Home: React.FC = () => {
  const [localChannel, setLocalChannel] = useState<string>('000000')
  const [remoteChannel, setRemoteChannel] = useState<string>('000000')
  const [calling, setCalling] = useState<boolean>(false)
  const [beCalling, setBeCalling] = useState<boolean>(false)
  const init = async function () {
    let channel = await getLocalChannel()
    setLocalChannel(channel)
  }

  const toCallClickHandle = () => {
    callerToCall(remoteChannel, result => {
      console.log(result.message)
    })
  }
  const whoCallHandle = (e, channel) => {
    console.log(channel + ' call you')
    setBeCalling(true)
    setRemoteChannel(channel + '')
  }
  const setVideStream = (remotestream, localStream) => {
    const remoteVideoEle = document.getElementById('remoteVideo') as HTMLVideoElement
    const localVideoEle = document.getElementById('localVideo') as HTMLVideoElement
    remoteVideoEle.srcObject = remotestream[0]
    localVideoEle.srcObject = localStream
    remoteVideoEle.onloadeddata = () => {
      remoteVideoEle.play()
    }
    localVideoEle.onloadeddata = () => {
      localVideoEle.play()
    }
  }
  const acceptHandle = () => {
    setCalling(true)
    setBeCalling(false)

    acceptCall(remoteChannel, result => {
      //已经建立连接，等待caller发offer
      console.log(result.message)
    })
  }
  const rejectHandle = () => {
    setBeCalling(false)
  }
  useEffect(() => {
    init()
    addWhoCallListener(whoCallHandle)
    addTrackCallback(setVideStream)
    return () => {}
  }, [])

  return (
    <div className={css.box}>
      {calling ? (
        <>
          <div>通话中。。:{remoteChannel}</div>
          <video id="remoteVideo"></video>
          <video id="localVideo"></video>
        </>
      ) : (
        <>
          <div className={css.state}>{`频道:${localChannel}`}</div>
          <input type="text" className={css.inputbox} onChange={e => setRemoteChannel(e.target.value)} />
          <div>
            <div className={css.callBtn} onClick={toCallClickHandle}>
              呼叫
            </div>
          </div>
          {beCalling && (
            <div className={css.chooseBox}>
              <div className={css.rejectBtn} onClick={rejectHandle}>
                拒绝
              </div>
              <div className={css.acceptBtn} onClick={acceptHandle}>
                接受
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Home
