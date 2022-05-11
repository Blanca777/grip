export interface IElectronAPI {
  getLocalChannel: () => Promise<string>
  callerToCall: (remoteChannel: any, callerToCallResultCallback: any, callerOpenVideo: any) => void
  addWhoCallListener: (callback: any) => VoidFunction
  acceptCall: (remoteChannel: any, calleeAcceptCallResultCallback: any) => Promise<void>
  callerSendOffer: (offer: any) => Promise<void>
  calleeSendAnswer: (answer: any) => Promise<void>
  addTrackCallback: () => Promise<void>
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
