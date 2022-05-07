import React, {useContext, useState, useRef, useEffect} from 'react'
import StoreContext from '../../state/context'
import css from './index.css'
const {
  getLocalChannel,
  toShare,
  toWatch,
  addWatchListener,
  removeWatchListener,
  addShareListener,
  removeShareListener,
  addWhoIntoChannelListener,
  removeWhoIntoChannelListener,
} = window.electronAPI
const Home: React.FC = () => {
  // const [state, dispatch] = useContext(StoreContext)
  const [localChannel, setLocalChannel] = useState<string>('000000')
  const [remoteChannel, setRemoteChannel] = useState<string>('000000')
  const [shared, setShared] = useState<boolean>(false)
  const [watch, setWatch] = useState<boolean>(false)
  const init = async function () {
    let channel = await getLocalChannel()
    setLocalChannel(channel)
  }
  const endhandle = () => {
    setShared(false)
  }

  const watchhandle = () => {
    toWatch(remoteChannel)
  }
  const toShareSuccess = (e, message) => {
    console.log('共享成功:', message)
    setShared(true)
  }
  const toShareFail = (e, message) => {
    console.log('共享失败原因:', message)
  }
  const sharehandle = () => {
    toShare(localChannel)
    addShareListener(toShareSuccess, toShareFail)
  }
  const toWatchSuccess = (e, remoteChannel) => {
    console.log('进入频道:', remoteChannel)
    setWatch(true)
    setRemoteChannel(remoteChannel + '')
  }
  const toWatchFail = (e, message) => {
    console.log('失败原因:', message)
  }
  const whoIntoChannelHandle = (e, remoteChannel) => {
    console.log(remoteChannel + '进入频道')
  }
  useEffect(() => {
    init()
    addWatchListener(toWatchSuccess, toWatchFail)
    addWhoIntoChannelListener(whoIntoChannelHandle)
    return () => {
      removeWatchListener(toWatchSuccess, toWatchFail)
      removeWhoIntoChannelListener(whoIntoChannelHandle)
    }
  }, [])

  return (
    <div className={css.box}>
      {shared ? (
        <>
          <div className={css.endBtn} onClick={endhandle}>
            结束共享
          </div>
        </>
      ) : watch ? (
        <>
          <div>正在观看频道:{remoteChannel}</div>
        </>
      ) : (
        <>
          <div className={css.state}>{`频道:${localChannel}`}</div>
          <input type="text" className={css.inputbox} onChange={e => setRemoteChannel(e.target.value)} />
          <div>
            <div className={css.watchBtn} onClick={watchhandle}>
              观看
            </div>
            <div className={css.shareBtn} onClick={sharehandle}>
              共享
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Home
