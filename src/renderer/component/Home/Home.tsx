import React, {useState, useRef, useEffect, useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import StoreContext from '../../state/context'
import {ActionType} from '../../state/reducer'
import css from './home.module.css'
import RoomItem, {IroomItem} from '../RoomItem/RoomItem'
import throttle from '../../lib/throttle'

const {getLocalChannel, addWhoCallListener, acceptCall, rejectCall, getAllChannel, changeLocalChannelMsg} =
  window.electronAPI
const Home: React.FC = () => {
  const navigate = useNavigate()
  const [state, dispatch] = useContext(StoreContext)
  const [beCalling, setBeCalling] = useState<boolean>(false)
  const [channels, setChannels] = useState<IroomItem[]>([])
  const [isShowWriteBox, setIsShowWriteBox] = useState<boolean>(false)
  const [nicknameInputValue, setNicknameInputValue] = useState<string>('')
  const [callInfoInputValue, setCallInfoInputValue] = useState<string>('')
  useEffect(() => {
    init()
  }, [])

  return (
    <div className={css.homeBox}>
      <div className={css.mainBox}>
        <div className={css.roomBox}>
          {channels.map(item => {
            return (
              <RoomItem
                key={item.channel}
                callInfo={item.callInfo}
                nickname={item.nickname}
                channel={item.channel}
                inCalling={item.inCalling}
              />
            )
          })}
        </div>
        <div className={css.refash} onClick={throttle(refashHandle, 1000)}>
          <svg viewBox="0 0 1024 1024" version="1.1">
            <path
              d="M456.095759 890.332674c-134.644583 0.007163-265.168312-71.92103-333.536422-198.451818-48.044226-88.925309-58.588373-191.242625-29.686113-288.094464s93.793176-176.646186 182.711322-224.698598c183.593412-99.162464 413.593759-30.524201 512.785899 153.024186 48.613184 89.979314 35.982516 189.096752 22.25384 255.828596l-30.000268-6.176676c12.764722-62.034868 24.661679-153.906276-19.202341-235.085156-91.145883-168.70533-302.571177-231.80239-471.269343-140.641157-81.731466 44.155662-141.366681 117.498064-167.927617 206.512401-26.568099 89.007173-16.877389 183.039803 27.28646 264.764106 91.15407 168.720679 302.586526 231.795227 471.269343 140.641157l14.566764 26.949792C578.312288 875.713722 516.777817 890.332674 456.095759 890.332674z"
              p-id="3031"></path>
            <path d="M795.624662 584.850192" p-id="3032"></path>
            <path
              d="M795.322787 618.628506 681.295777 452.331016 706.555068 435.012581 801.096281 572.894905 926.94657 462.8373 947.106726 485.898529Z"
              p-id="3033"></path>
          </svg>
        </div>
      </div>
      <div className={css.infoBox}>
        <div className={css.leftBtnBox}>
          <div className={css.writeBtn} onClick={showWriteBox}>
            <svg viewBox="0 0 1024 1024" version="1.1">
              <path
                d="M355.697371 736.029257l36.253258-131.477943c3.035429-11.008 13.366857-28.759771 21.438171-36.827428L831.305143 149.803886a1.839543 1.839543 0 0 1 2.592914-0.0256l114.666057 114.669714a1.8432 1.8432 0 0 1-0.0256 2.592914L530.622171 684.957257c-7.753143 7.753143-25.183086 17.3568-35.84 19.755886l-139.081142 31.316114z m18.900115-207.096686c-14.782171 14.782171-29.973943 40.872229-35.5328 61.037715l-48.4096 175.572114c-5.504 19.968 12.2624 38.601143 32.468114 34.048l183.7056-41.358629c20.790857-4.681143 47.488-19.390171 62.584686-34.486857L987.326171 305.832229c22.133029-22.133029 22.162286-58.038857 0.0256-80.171886L872.682057 110.994286c-22.129371-22.133029-58.031543-22.114743-80.171886 0.0256L374.601143 528.932571z"
                p-id="3055"
                fill="#515151"></path>
              <path
                d="M744.788114 228.128914l127.901257 127.681829a27.428571 27.428571 0 1 0 38.7584-38.820572L783.542857 189.304686a27.428571 27.428571 0 1 0-38.754743 38.824228zM389.412571 594.066286l112.164572 112.164571a27.428571 27.428571 0 1 0 38.791314-38.791314l-112.164571-112.164572a27.428571 27.428571 0 1 0-38.791315 38.791315z"
                p-id="3056"
                fill="#515151"></path>
              <path
                d="M747.885714 702.208V778.971429c0 104.020114-84.319086 188.342857-188.342857 188.342857H76.803657c-1.013029 0-1.832229-908.767086-1.832228-908.767086 0-1.034971 671.082057-1.861486 671.082057-1.861486a27.428571 27.428571 0 1 0 0-54.857143H76.803657C45.483886 1.828571 20.114286 27.227429 20.114286 58.5472v906.9056c0 31.330743 25.373257 56.718629 56.689371 56.718629h482.742857c134.319543 0 243.196343-108.880457 243.196343-243.2v-76.763429a27.428571 27.428571 0 0 0-54.857143 0z"
                p-id="3057"
                fill="#515151"></path>
              <path
                d="M208.457143 257.828571h290.742857a27.428571 27.428571 0 1 0 0-54.857142H208.457143a27.428571 27.428571 0 0 0 0 54.857142zM208.457143 418.742857h170.057143a27.428571 27.428571 0 1 0 0-54.857143H208.457143a27.428571 27.428571 0 1 0 0 54.857143z"
                p-id="3058"
                fill="#515151"></path>
            </svg>
          </div>

          <div className={css.confirmWriteBtn} onClick={confirmWriteHandle}>
            {isShowWriteBox && (
              <svg viewBox="0 0 1024 1024" version="1.1">
                <path
                  d="M953.472 174.976L385.152 759.168l-275.328-282.794667-53.290667 50.346667L385.194667 857.6l616.021333-632.32z"
                  fill="#1afa29"
                  p-id="3041"></path>
              </svg>
            )}
          </div>

          <div className={css.closeWriteBoxBtn} onClick={closeWriteBox}>
            {isShowWriteBox && (
              <svg viewBox="0 0 1024 1024" version="1.1">
                <path
                  d="M557.3 512l329.3-329.4a32 32 0 1 0-45.2-45.2L512 466.7 182.6 137.4a32 32 0 1 0-45.2 45.2L466.7 512 137.4 841.4a31.9 31.9 0 0 0 0 45.2 31.9 31.9 0 0 0 45.2 0L512 557.3l329.4 329.3a31.9 31.9 0 0 0 45.2 0 31.9 31.9 0 0 0 0-45.2z"
                  fill="#d81e06"
                  p-id="3955"></path>
              </svg>
            )}
          </div>
        </div>

        <div className={css.nickname}>{state.localMsg.nickname}</div>
        <div className={css.channel}>channel: {state.localMsg.channel}</div>
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
        {isShowWriteBox && ( 
          <div className={css.writeBox}>
            <input
              type="text"
              maxLength={20}
              value={nicknameInputValue}
              onChange={e => setNicknameInputValue(e.target.value)}
              placeholder="nickname"
            />
            <input
              type="text"
              maxLength={200}
              value={callInfoInputValue}
              onChange={e => setCallInfoInputValue(e.target.value)}
              placeholder="Please write the call information"
            />
          </div>
        )}
      </div>
    </div>
  )
  function showWriteBox() {
    setIsShowWriteBox(true)
    setNicknameInputValue(state.localMsg.nickname)
    setCallInfoInputValue(state.localMsg.callInfo)
  }
  async function confirmWriteHandle() {
    const result = await changeLocalChannelMsg({
      nickname: nicknameInputValue,
      callInfo: callInfoInputValue,
    })
    if (result.code === 0) {
      setIsShowWriteBox(false)
      dispatch({
        type: ActionType.ChangeLocalMsg,
        localMsg: result.data,
      })
    } else {
      //todo
      console.log('change fail')
    }
  }
  function closeWriteBox() {
    setIsShowWriteBox(false)
  }
  async function refashHandle() {
    let getAllChannelResult = await getAllChannel()
    if (getAllChannelResult.code === 0) {
      setChannels(getAllChannelResult.data)
    }
  }
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
