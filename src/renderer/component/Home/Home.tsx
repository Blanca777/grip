import React, {useState, useRef, useEffect} from 'react'
import css from './index.module.css'
import VideoCall from '../VideoCall/VideoCall'
import Tip from '../Tip/Tip'
const {getLocalChannel, callerToCall, addWhoCallListener, addCloseConnectionListener, acceptCall, rejectCall} =
  window.electronAPI
const Home: React.FC = () => {
  const [localChannel, setLocalChannel] = useState<number>(0)
  const [remoteChannel, setRemoteChannel] = useState<number>(0)
  const [calling, setCalling] = useState<boolean>(true)
  const [isShowTip, setIsShowTip] = useState<boolean>(false)
  const [tipText, setTipText] = useState<string>('')
  const [beCalling, setBeCalling] = useState<boolean>(false)
  const channelInputRef = useRef<HTMLInputElement>(null)

  const whoCallHandle = channel => {
    console.log(channel + ' call you')
    setBeCalling(true)
    setRemoteChannel(channel)
  }
  const closeConnectHandle = () => {
    setCalling(false)
  }
  const init = async function () {
    let result = await getLocalChannel()
    if (result.code === 0) {
      setLocalChannel(result.localChannel)
    } else {
      console.log(result.message)
    }
    addWhoCallListener(whoCallHandle)
    addCloseConnectionListener(closeConnectHandle)
  }

  const toCallClickHandle = () => {
    let remoteChannel = channelInputRef.current?.value === undefined ? 0 : +channelInputRef.current?.value
    if (remoteChannel === 0) {
      return console.log('请输入频道！')
    }
    const callerToCallResult = result => {
      setTipText(result.message)
      setIsShowTip(true)

      if (result.code === 0) {
      } else {
        setTimeout(() => {
          setIsShowTip(false)
        }, 3000)
      }
    }
    const succCall = remoteChannel => {
      setIsShowTip(false)
      setCalling(true)
      setRemoteChannel(remoteChannel)
    }
    const failCall = remoteChannel => {
      setCalling(false)
      setTipText(remoteChannel + '拒绝了通话！')
      setTimeout(() => {
        setIsShowTip(false)
      }, 3000)
    }
    callerToCall(remoteChannel, callerToCallResult, succCall, failCall)
  }

  const acceptHandle = () => {
    setBeCalling(false)
    acceptCall(remoteChannel, result => {
      //已经建立连接，等待caller发offer
      console.log(result.message)
      if (result.code === 0) {
        setCalling(true)
      }
    })
  }
  const rejectHandle = () => {
    setBeCalling(false)
    rejectCall(remoteChannel)
  }
  useEffect(() => {
    init()
    return () => {}
  }, [])

  return (
    <div className={css.box}>
      {calling ? (
        <VideoCall remoteChannel={remoteChannel} setCalling={setCalling} />
      ) : (
        <>
          <div className={css.callBox}>
            <div className={css.channel}>{`${localChannel}`}</div>
            <input type="text" className={css.inputbox} ref={channelInputRef} autoFocus placeholder="Channel" />
            <div>
              <div className={css.callBtn} onClick={toCallClickHandle}>
                CALL
              </div>
            </div>
          </div>
          {isShowTip && <Tip text={tipText} />}
          {beCalling && (
            <div className={css.chooseBox}>
              <div className={css.channel}>{remoteChannel}</div>
              <div className={css.rejectBtn} onClick={rejectHandle}>
                Reject
              </div>
              <div className={css.acceptBtn} onClick={acceptHandle}>
                Accept
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Home
