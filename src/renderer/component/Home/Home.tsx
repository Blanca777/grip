import React, {useContext, useState, useRef, useEffect} from 'react'
import StoreContext from '../../state/context'
import css from './index.css'
const {getLocalChannel, callerToCall, addWhoCallListener, acceptCall, addTrackCallback} = window.electronAPI
const Home: React.FC = () => {
  const [localChannel, setLocalChannel] = useState<string>('000000')
  const [remoteChannel, setRemoteChannel] = useState<string>('000000')
  const [calling, setCalling] = useState<boolean>(false)
  const [beCalling, setBeCalling] = useState<boolean>(false)
  const remoteVideoEle = useRef(null)
  const localVideoEle = useRef(null)
  const init = async function () {
    let channel = await getLocalChannel()
    setLocalChannel(channel)
  }

  const toCallClickHandle = () => {
    callerToCall(
      remoteChannel,
      result => {
        console.log(result.message)
      },
      remoteChannel => {
        setCalling(true)
        setRemoteChannel(remoteChannel + '')
      },
    )
  }
  const whoCallHandle = (e, channel) => {
    console.log(channel + ' call you')
    setBeCalling(true)
    setRemoteChannel(channel + '')
  }
  const setVideStream = (remotestream, localStream) => {
    console.log('远程视频流：' + remotestream, '本地视频流：' + localStream)
    if (remoteVideoEle.current && localVideoEle.current) {
      remoteVideoEle.current.srcObject = remotestream
      localVideoEle.current.srcObject = localStream
      remoteVideoEle.current.onloadeddata = () => {
        remoteVideoEle.current.play()
      }
      localVideoEle.current.onloadeddata = () => {
        localVideoEle.current.play()
      }
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
          <video id="remoteVideo" ref={remoteVideoEle}></video>
          <video id="localVideo" ref={localVideoEle}></video>
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
