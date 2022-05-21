import css from './roomItem.module.css'
import StoreContext from '../../state/context'
import {useNavigate} from 'react-router-dom'
import {ActionType} from '../../state/reducer'
import React, {useContext, useState, useEffect} from 'react'
const {callerToCall} = window.electronAPI

export interface IroomItem {
  channel: number
  nickname: string
  callInfo: string
  inCalling: boolean
}
const RoomItem: React.FC<IroomItem> = ({nickname, callInfo, channel, inCalling}) => {
  const [isShowTip, setIsShowTip] = useState<boolean>(false)
  const [tipText, setTipText] = useState<string>('calling')
  const navigate = useNavigate()
  const [state, dispatch] = useContext(StoreContext)
  return (
    <div className={css.roomItem}>
      <div className={css.roomItem_nickname}>{nickname}</div>
      <div className={css.roomItem_roomInfo}><abbr title={callInfo}>{callInfo}</abbr></div>
      <div className={css.roomItem_channel}>channel:{channel}</div>
      <div className={`${css.roomItem_curtain} ${isShowTip ? css.roomItem_calling : ''}`}>
        <svg viewBox="0 0 1024 1024" version="1.1" onClick={toCallClickHandle}>
          <path
            d="M595.217636 1023.828705c-128.361921 0-300.095277-142.819066-421.009578-309.733374C24.817562 507.752447-65.868164 238.761936 60.741376 146.761924l87.619059-64.400009a111.7143 111.7143 0 0 1 89.809536-19.276192A100.761918 100.761918 0 0 1 307.389028 113.466681l81.485724 161.657164a43.80953 43.80953 0 0 1-77.980962 39.866672L228.531874 154.209544A12.704764 12.704764 0 0 0 219.769968 148.9524a24.095241 24.095241 0 0 0-19.276192 4.380953L112.436621 219.047648c-51.695245 37.676195-26.285718 224.742886 131.428589 444.666724s329.447662 302.285754 381.142906 262.857177l87.61906-64.400008a24.095241 24.095241 0 0 0 10.514287-17.085717 12.704764 12.704764 0 0 0-3.066667-10.514287L631.579546 744.762002a43.80953 43.80953 0 0 0-43.80953-11.390478l-61.333341 15.771431a131.428589 131.428589 0 0 1-131.428588-40.742863l-24.095242-28.038099a1011.123941 1011.123941 0 0 1-102.952394-142.380971L219.769968 459.123869a43.80953 43.80953 0 1 1 75.352391-43.809529l46.876197 78.419058a923.504882 923.504882 0 0 0 94.190488 131.428588l24.095242 28.038099a43.80953 43.80953 0 0 0 43.809529 13.580954l61.333341-16.209526a131.428589 131.428589 0 0 1 127.047636 34.609529l91.561917 92.438107a101.200013 101.200013 0 0 1 27.600003 79.295248 111.7143 111.7143 0 0 1-46.000006 79.733344l-87.619059 64.400008a137.123827 137.123827 0 0 1-82.800011 22.780956z m210.285742-598.438173A159.466687 159.466687 0 0 0 657.865264 210.723837a43.80953 43.80953 0 0 0-43.80953 43.809529 43.80953 43.80953 0 0 0 43.80953 43.80953A71.847628 71.847628 0 0 1 723.579558 394.285766a43.80953 43.80953 0 1 0 82.361915 30.228575zM998.703403 525.714354a389.904813 389.904813 0 0 0-359.238142-525.714354 43.80953 43.80953 0 0 0-43.809529 43.80953 43.80953 43.80953 0 0 0 43.809529 43.809529 302.285754 302.285754 0 0 1 278.628608 407.428625 43.80953 43.80953 0 1 0 82.361915 30.228575z"
            fill="#3E2AD1"
            p-id="2409"></path>
        </svg>
        {isShowTip && <div>{tipText}</div>}
      </div>
      <div className={css.callingState}></div>
    </div>
  )

  function toCallChannel(channel) {
    const callerToCallResult = result => {
      setTipText(result.message)
      setIsShowTip(true)

      if (result.code !== 0) {
        setTimeout(() => {
          setIsShowTip(false)
          dispatch({
            type: ActionType.ChangeIsClientInToCalling,
            isClientInToCalling: false,
          })
        }, 3000)
      }
    }
    const succCall = userMsg => {
      setIsShowTip(false)
      navigate('/videoRoom')

      dispatch({
        type: ActionType.ChangeRemoteMsg,
        remoteMsg: userMsg,
      })
      dispatch({
        type: ActionType.ChangeIsClientInToCalling,
        isClientInToCalling: false,
      })
    }
    const failCall = userMsg => {
      setTipText(userMsg.nickname + '拒绝了通话！')
      setTimeout(() => {
        setIsShowTip(false)
      }, 3000)
      dispatch({
        type: ActionType.ChangeIsClientInToCalling,
        isClientInToCalling: false,
      })
    }
    callerToCall(channel, callerToCallResult, succCall, failCall)
  }

  function toCallClickHandle() {
    if (!state.isClientInToCalling) {
      dispatch({
        type: ActionType.ChangeIsClientInToCalling,
        isClientInToCalling: true,
      })
      setIsShowTip(true)
      setTipText('等待...')
      toCallChannel(channel)
    }
  }
}

export default RoomItem
