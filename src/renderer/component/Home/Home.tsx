import React, {useState, useRef, useEffect, useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import StoreContext from '../../state/context'
import {ActionType} from '../../state/reducer'
import css from './home.module.css'
import VideoCall from '../VideoCall/VideoCall'
import Tip from '../Tip/Tip'
const {getLocalChannel, callerToCall, addWhoCallListener, addCloseConnectionListener, acceptCall, rejectCall} =
  window.electronAPI
const Home: React.FC = () => {
  const [state, dispatch] = useContext(StoreContext)
  const navigate = useNavigate()
  const [isShowTip, setIsShowTip] = useState<boolean>(false)
  const [tipText, setTipText] = useState<string>('')
  const [beCalling, setBeCalling] = useState<boolean>(false)
  const channelInputRef = useRef<HTMLInputElement>(null)

  const whoCallHandle = channel => {
    console.log(channel + ' call you')
    setBeCalling(true)
    dispatch({
      type: ActionType.ChangeRemoteChannel,
      remoteChannel: channel,
    })
  }
  const closeConnectHandle = () => {
    navigate('/')
  }
  const init = async function () {
    let result = await getLocalChannel()
    if (result.code === 0) {
      dispatch({
        type: ActionType.ChangeLocalChannel,
        localChannel: result.localChannel,
      })
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

      if (result.code !== 0) {
        setTimeout(() => {
          setIsShowTip(false)
        }, 3000)
      }
    }
    const succCall = remoteChannel => {
      setIsShowTip(false)
      navigate('/room')

      dispatch({
        type: ActionType.ChangeRemoteChannel,
        remoteChannel: remoteChannel,
      })
    }
    const failCall = remoteChannel => {
      navigate('/')
      setTipText(remoteChannel + '拒绝了通话！')
      setTimeout(() => {
        setIsShowTip(false)
      }, 3000)
    }
    callerToCall(remoteChannel, callerToCallResult, succCall, failCall)
  }

  const acceptHandle = () => {
    setBeCalling(false)
    acceptCall(state.remoteChannel, result => {
      //已经建立连接，等待caller发offer
      console.log(result.message)
      if (result.code === 0) {
        navigate('/room')
      }
    })
  }
  const rejectHandle = () => {
    setBeCalling(false)
    rejectCall(state.remoteChannel)
  }
  useEffect(() => {
    init()
    return () => {}
  }, [])

  return (
    <div className={css.homeBox}>
      <div className={css.mainBox}></div>
      <div className={css.infoBox}>
        <div className={css.nickname}>
          blanca<span className={css.localChannel}>channel: 777</span>
        </div>
        <div className={css.roomInfo}>roomInfo</div>
      </div>
      {/* <div className={css.callBox}>
        <div className={css.channel} onClick={() => navigate('/room')}>{`${state.localChannel}`}</div>
        <input type="text" className={css.inputbox} ref={channelInputRef} autoFocus placeholder="Channel" />
        <div>
          <div className={css.callBtn} onClick={toCallClickHandle}>
            CALL
          </div>
        </div>
      </div> */}
      {isShowTip && <Tip text={tipText} />}
      {beCalling && (
        <div className={css.chooseBox}>
          <div className={css.channel}>{state.remoteChannel}</div>
          <div className={css.rejectBtn} onClick={rejectHandle}>
            Reject
          </div>
          <div className={css.acceptBtn} onClick={acceptHandle}>
            Accept
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
