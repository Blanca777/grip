import React, {memo, useEffect, useState} from 'react'
import css from './index.module.css'
const {closeConnect, addReadyRemoteVideoCallback} = window.electronAPI

const VideoCall: React.FC<{
  remoteChannel: number
  setCalling: React.Dispatch<React.SetStateAction<boolean>>
}> = ({remoteChannel, setCalling}) => {
  const [loading, setLoading] = useState<boolean>(true)
  const closeBtnHandle = () => {
    closeConnect(remoteChannel)
    setCalling(false)
  }
  const showVideo = () => {
    setLoading(false)
  }
  useEffect(() => {
    addReadyRemoteVideoCallback(showVideo)
  }, [])
  return (
    <>
      {loading && <div className={css.loadingBox}>正在拼命加载...</div>}
      <div className={css.closeBtn} onClick={closeBtnHandle}>
        Close
      </div>
      <video id="remoteVideo" className={css.remoteVideo}></video>
      <video id="localVideo" className={css.localVideo}></video>
    </>
  )
}

export default memo(VideoCall)
