interface Iresult {
  /** 0=成功，1=失败 */
  code: number
  /** 结果信息 */
  message: string
  localChannel?: number
  remoteChannel?: number
}
export interface IElectronAPI {
  getLocalChannel: () => Promise<Iresult & {localChannel: number}>
  /**
   * 呼叫方发起通话
   * @param remoteChannel 呼叫频道号 string
   * @param callerToCallResultCallback 发起通话后的回调函数 (result: Iresult) => void
   * @param calleeAcceptCall 被呼叫方接受通话的回调 (remoteChannel: number) => void
   * @param calleeRejectCall 被呼叫方拒绝通话的回调 (remoteChannel: number) => void
   * @result void
   */
  callerToCall: (
    remoteChannel: number,
    callerToCallResultCallback: (result: Iresult) => void,
    calleeAcceptCall: (remoteChannel: number) => void,
    calleeRejectCall: (remoteChannel: number) => void,
  ) => void
  addWhoCallListener: (callback: (channel: number) => void) => void
  addCloseConnectionListener: (callback: any) => void
  acceptCall: (remoteChannel: number, calleeAcceptCallResultCallback: (result: Iresult) => void) => Promise<void>
  rejectCall: (remoteChannel: number) => void
  closeConnect: (remoteChannel: number) => void
  addReadyRemoteVideoCallback: (callback: any) => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

declare module '*.module.css' {
  const classes: {readonly [key: string]: string}
  export default classes
}
