import {memo, useEffect, useState, useContext} from 'react'
import css from './videoRoom.module.css'
import {useNavigate} from 'react-router-dom'
import StoreContext from '../../state/context'

const {closeConnect, addReadyRemoteVideoCallback, addCloseConnectionListener} = window.electronAPI

function Room() {
  const navigate = useNavigate()

  const [state, dispatch] = useContext(StoreContext)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    addReadyRemoteVideoCallback(showVideo)
    addCloseConnectionListener(closeConnectHandle)
  }, [])
  return (
    <div className={css.RoomBox}>
      {loading && <div className={css.loadingBox}>正在拼命加载...</div>}

      <div className={css.leftBox}>
        <video id="remoteVideo" className={css.remoteVideo}></video>
      </div>
      <div className={css.rightBox}>
        <video id="localVideo" className={css.localVideo}></video>
        <div className={css.btnBox}>
          <div className={css.btnItem} onClick={closeBtnHandle}>
            <svg viewBox="0 0 1024 1024" version="1.1" p-id="4181">
              <path
                d="M57.856 600.106667a52.394667 52.394667 0 0 1 0-73.813334c245.674667-246.613333 645.034667-246.613333 891.648 0 20.266667 20.394667 20.266667 53.333333 0 73.770667l-89.514667 89.557333a51.84 51.84 0 0 1-73.301333 0.426667 411.562667 411.562667 0 0 0-101.973333-74.24 51.584 51.584 0 0 1-28.373334-46.464l-0.512-100.693333c-99.413333-29.781333-205.354667-29.866667-304.810666-0.170667v100.138667c-0.128 19.626667-11.093333 37.589333-28.586667 46.634666a394.154667 394.154667 0 0 0-101.589333 74.069334c-20.48 20.224-53.376 20.224-73.813334-0.042667l-89.173333-89.173333z"
                fill="#F5222D"
                p-id="4182"></path>
            </svg>
          </div>
          <div className={css.btnItem} onClick={cutPicHandle}>
            <svg viewBox="0 0 1024 1024" version="1.1" p-id="5895">
              <path d="M128 512h768v320H128V512z" fill="#2D8DFE" opacity=".1" p-id="5896"></path>
              <path
                d="M896 864H128c-19.2 0-32-12.8-32-32V256c0-19.2 12.8-32 32-32h768c19.2 0 32 12.8 32 32v576c0 19.2-12.8 32-32 32z m-736-64h704v-512h-704v512z"
                fill="#2D8DFE"
                p-id="5897"></path>
              <path
                d="M768 288H256c-12.8 0-19.2-6.4-25.6-12.8s-6.4-19.2 0-32l64-128c0-12.8 12.8-19.2 25.6-19.2h384c12.8 0 25.6 6.4 25.6 19.2l64 128c6.4 12.8 6.4 19.2 0 32-6.4 6.4-12.8 12.8-25.6 12.8z m-460.8-64h409.6l-32-64H339.2l-32 64zM512 736c-108.8 0-192-83.2-192-192s83.2-192 192-192 192 83.2 192 192-83.2 192-192 192z m0-320c-70.4 0-128 57.6-128 128s57.6 128 128 128 128-57.6 128-128-57.6-128-128-128z"
                fill="#2D8DFE"
                p-id="5898"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
  function closeBtnHandle() {
    closeConnect(state.remoteMsg.channel)
    navigate('/')
  }
  function cutPicHandle() {
    console.log('截图')
  }
  function showVideo() {
    setLoading(false)
  }
  function closeConnectHandle() {
    navigate('/')
  }
}

export default memo(Room)
