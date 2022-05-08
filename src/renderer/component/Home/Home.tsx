import React, {useContext, useState, useRef, useEffect} from 'react'
import StoreContext from '../../state/context'
import css from './index.css'
const {
  getLocalChannel,
  toShare,
  toWatch,
  closeShare,

  addWatchListener,
  addShareListener,
  addCloseShareListener,

  addWhoIntoChannelListener,
  removeWhoIntoChannelListener,

  addCurChannelCloseListener,
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

  const closeShareSuccess = (e, message) => {
    console.log('关闭共享成功:', message)
    setShared(false)
  }
  const closeShareFail = (e, message) => {
    console.log('关闭共享失败:', message)
  }
  const closeSharehandle = () => {
    closeShare(localChannel)
    removeWhoIntoChannelListener(whoIntoChannelHandle)
  }

  const toWatchhandle = () => {
    toWatch(remoteChannel)
    addWatchListener(toWatchSuccess, toWatchFail)
  }
  const toShareSuccess = (e, message) => {
    console.log('共享成功:', message)
    addWhoIntoChannelListener(whoIntoChannelHandle)
    addCloseShareListener(closeShareSuccess, closeShareFail)
    setShared(true)
  }
  const toShareFail = (e, message) => {
    console.log('共享失败原因:', message)
  }
  const toSharehandle = () => {
    toShare(localChannel)
    addShareListener(toShareSuccess, toShareFail)
  }
  const curChannelCloseShareHandle = (e, channel) => {
    console.log('当前频道结束共享了')
    setWatch(false)
  }
  const toWatchSuccess = (e, remoteChannel) => {
    console.log('进入频道:', remoteChannel)
    setWatch(true)
    setRemoteChannel(remoteChannel + '')
    addCurChannelCloseListener(curChannelCloseShareHandle)
  }
  const toWatchFail = (e, message) => {
    console.log('失败原因:', message)
  }
  const whoIntoChannelHandle = (e, remoteChannel) => {
    console.log(remoteChannel + '进入频道')
  }
  useEffect(() => {
    init()

    return () => {}
  }, [])

  return (
    <div className={css.box}>
      {shared ? (
        <>
          <div className={css.endBtn} onClick={closeSharehandle}>
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
            <div className={css.watchBtn} onClick={toWatchhandle}>
              观看
            </div>
            <div className={css.shareBtn} onClick={toSharehandle}>
              共享
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Home
