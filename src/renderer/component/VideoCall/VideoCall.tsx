import React, {memo} from 'react'
import css from './index.module.css'
const {closeConnect} = window.electronAPI

const VideoCall: React.FC<{
  remoteChannel: number
  setCalling: React.Dispatch<React.SetStateAction<boolean>>
}> = ({remoteChannel, setCalling}) => {
  const closeBtnHandle = () => {
    closeConnect(remoteChannel)
    setCalling(false)
  }
  return (
    <>
      <div className={css.closeBtn} onClick={closeBtnHandle}>
        Close
      </div>
      <video id="remoteVideo" className={css.remoteVideo}></video>
      <video id="localVideo" className={css.localVideo}></video>
    </>
  )
}

export default memo(VideoCall)
