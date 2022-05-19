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
      <div className={css.mainBox}>
        <div className={css.roomBox}>
          <div className={css.roomItem}>
            <div className={css.roomItem_nickname}>bla111111111111111nca</div>
            <div className={css.roomItem_roomInfo}>roomInfosadsadasdasd asdas dasdadas da a a as a</div>
            <div className={css.roomItem_channel}>roomItem_channel</div>
            <div className={css.roomItem_callBtn}>
              <svg viewBox="0 0 1024 1024" version="1.1">
                <path
                  d="M595.217636 1023.828705c-128.361921 0-300.095277-142.819066-421.009578-309.733374C24.817562 507.752447-65.868164 238.761936 60.741376 146.761924l87.619059-64.400009a111.7143 111.7143 0 0 1 89.809536-19.276192A100.761918 100.761918 0 0 1 307.389028 113.466681l81.485724 161.657164a43.80953 43.80953 0 0 1-77.980962 39.866672L228.531874 154.209544A12.704764 12.704764 0 0 0 219.769968 148.9524a24.095241 24.095241 0 0 0-19.276192 4.380953L112.436621 219.047648c-51.695245 37.676195-26.285718 224.742886 131.428589 444.666724s329.447662 302.285754 381.142906 262.857177l87.61906-64.400008a24.095241 24.095241 0 0 0 10.514287-17.085717 12.704764 12.704764 0 0 0-3.066667-10.514287L631.579546 744.762002a43.80953 43.80953 0 0 0-43.80953-11.390478l-61.333341 15.771431a131.428589 131.428589 0 0 1-131.428588-40.742863l-24.095242-28.038099a1011.123941 1011.123941 0 0 1-102.952394-142.380971L219.769968 459.123869a43.80953 43.80953 0 1 1 75.352391-43.809529l46.876197 78.419058a923.504882 923.504882 0 0 0 94.190488 131.428588l24.095242 28.038099a43.80953 43.80953 0 0 0 43.809529 13.580954l61.333341-16.209526a131.428589 131.428589 0 0 1 127.047636 34.609529l91.561917 92.438107a101.200013 101.200013 0 0 1 27.600003 79.295248 111.7143 111.7143 0 0 1-46.000006 79.733344l-87.619059 64.400008a137.123827 137.123827 0 0 1-82.800011 22.780956z m210.285742-598.438173A159.466687 159.466687 0 0 0 657.865264 210.723837a43.80953 43.80953 0 0 0-43.80953 43.809529 43.80953 43.80953 0 0 0 43.80953 43.80953A71.847628 71.847628 0 0 1 723.579558 394.285766a43.80953 43.80953 0 1 0 82.361915 30.228575zM998.703403 525.714354a389.904813 389.904813 0 0 0-359.238142-525.714354 43.80953 43.80953 0 0 0-43.809529 43.80953 43.80953 43.80953 0 0 0 43.809529 43.809529 302.285754 302.285754 0 0 1 278.628608 407.428625 43.80953 43.80953 0 1 0 82.361915 30.228575z"
                  fill="#3E2AD1"
                  p-id="2409"></path>
              </svg>
            </div>
          </div>
          <div className={css.roomItem}></div>
        </div>
      </div>
      <div className={css.infoBox}>
        <div className={css.nickname}>
          blanca<span className={css.channel}>channel: 777</span>
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
