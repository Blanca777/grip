import React, {useState, useRef, useEffect, useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import StoreContext from '../../state/context'
import {ActionType} from '../../state/reducer'
import css from './home.module.css'
import RoomItem, {IroomItem} from '../RoomItem/RoomItem'
const {getLocalChannel, addWhoCallListener, acceptCall, rejectCall, getAllChannel} = window.electronAPI
const Home: React.FC = () => {
  const navigate = useNavigate()
  const [state, dispatch] = useContext(StoreContext)
  const [beCalling, setBeCalling] = useState<boolean>(false)
  const [channels, setChannels] = useState<IroomItem[]>([])
  useEffect(() => {
    init()
  }, [])

  return (
    <div className={css.homeBox}>
      <div className={css.mainBox}>
        <div className={css.roomBox}>
          {channels.map(item => {
            return <RoomItem key={item.channel} callInfo={item.callInfo} nickname={item.nickname} channel={item.channel} />
          })}
        </div>
      </div>
      <div className={css.infoBox}>
        <div className={css.nickname}>
          {state.localMsg.nickname}
          <span className={css.channel}>channel: {state.localMsg.channel}</span>
        </div>
        <div className={css.roomInfo}>{state.localMsg.callInfo}</div>
        {beCalling && (
          <div className={css.chooseBox}>
            <div className={css.chooseChannel}>{state.remoteMsg.nickname}</div>
            <div className={css.chooseBtnBox}>
              <div className={css.chooseBtnItem} onClick={acceptHandle}>
                <svg viewBox="0 0 1024 1024" version="1.1">
                  <path
                    d="M595.217636 1023.828705c-128.361921 0-300.095277-142.819066-421.009578-309.733374C24.817562 507.752447-65.868164 238.761936 60.741376 146.761924l87.619059-64.400009a111.7143 111.7143 0 0 1 89.809536-19.276192A100.761918 100.761918 0 0 1 307.389028 113.466681l81.485724 161.657164a43.80953 43.80953 0 0 1-77.980962 39.866672L228.531874 154.209544A12.704764 12.704764 0 0 0 219.769968 148.9524a24.095241 24.095241 0 0 0-19.276192 4.380953L112.436621 219.047648c-51.695245 37.676195-26.285718 224.742886 131.428589 444.666724s329.447662 302.285754 381.142906 262.857177l87.61906-64.400008a24.095241 24.095241 0 0 0 10.514287-17.085717 12.704764 12.704764 0 0 0-3.066667-10.514287L631.579546 744.762002a43.80953 43.80953 0 0 0-43.80953-11.390478l-61.333341 15.771431a131.428589 131.428589 0 0 1-131.428588-40.742863l-24.095242-28.038099a1011.123941 1011.123941 0 0 1-102.952394-142.380971L219.769968 459.123869a43.80953 43.80953 0 1 1 75.352391-43.809529l46.876197 78.419058a923.504882 923.504882 0 0 0 94.190488 131.428588l24.095242 28.038099a43.80953 43.80953 0 0 0 43.809529 13.580954l61.333341-16.209526a131.428589 131.428589 0 0 1 127.047636 34.609529l91.561917 92.438107a101.200013 101.200013 0 0 1 27.600003 79.295248 111.7143 111.7143 0 0 1-46.000006 79.733344l-87.619059 64.400008a137.123827 137.123827 0 0 1-82.800011 22.780956z m210.285742-598.438173A159.466687 159.466687 0 0 0 657.865264 210.723837a43.80953 43.80953 0 0 0-43.80953 43.809529 43.80953 43.80953 0 0 0 43.80953 43.80953A71.847628 71.847628 0 0 1 723.579558 394.285766a43.80953 43.80953 0 1 0 82.361915 30.228575zM998.703403 525.714354a389.904813 389.904813 0 0 0-359.238142-525.714354 43.80953 43.80953 0 0 0-43.809529 43.80953 43.80953 43.80953 0 0 0 43.809529 43.809529 302.285754 302.285754 0 0 1 278.628608 407.428625 43.80953 43.80953 0 1 0 82.361915 30.228575z"
                    fill="#1afa29"
                    p-id="3065"></path>
                </svg>
              </div>
              <div className={css.chooseBtnItem} onClick={rejectHandle}>
                <svg viewBox="0 0 1024 1024" version="1.1">
                  <path
                    d="M57.856 600.106667a52.394667 52.394667 0 0 1 0-73.813334c245.674667-246.613333 645.034667-246.613333 891.648 0 20.266667 20.394667 20.266667 53.333333 0 73.770667l-89.514667 89.557333a51.84 51.84 0 0 1-73.301333 0.426667 411.562667 411.562667 0 0 0-101.973333-74.24 51.584 51.584 0 0 1-28.373334-46.464l-0.512-100.693333c-99.413333-29.781333-205.354667-29.866667-304.810666-0.170667v100.138667c-0.128 19.626667-11.093333 37.589333-28.586667 46.634666a394.154667 394.154667 0 0 0-101.589333 74.069334c-20.48 20.224-53.376 20.224-73.813334-0.042667l-89.173333-89.173333z"
                    fill="#F5222D"
                    p-id="3413"></path>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  function whoCallHandle(userMsg) {
    console.log(userMsg + ' call you')
    dispatch({
      type: ActionType.ChangeRemoteMsg,
      remoteMsg: userMsg,
    })
    setBeCalling(true)
  }
  async function init() {
    let result = await getLocalChannel()
    if (result.code === 0) {
      dispatch({
        type: ActionType.ChangeLocalMsg,
        localMsg: result.data,
      })
    } else {
      console.log(result.message)
    }
    let getAllChannelResult = await getAllChannel()
    if (getAllChannelResult.code === 0) {
      setChannels(getAllChannelResult.data)
      // console.log(getAllChannelResult.data)
    }

    addWhoCallListener(whoCallHandle)
  }

  function acceptHandle() {
    setBeCalling(false)
    acceptCall(state.remoteMsg.channel, result => {
      console.log(result.message)
      if (result.code === 0) {
        navigate('/videoRoom')
      }
    })
  }
  function rejectHandle() {
    setBeCalling(false)
    rejectCall(state.remoteMsg.channel)
  }
}

export default Home
