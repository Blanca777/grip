export interface IElectronAPI {
  getLocalChannel: () => Promise<string>
  callerToCall: (remoteChannel: any, callerToCallResultCallback: any) => void
  addWhoCallListener: (callback: any) => VoidFunction
  acceptCall: (remoteChannel: any, calleeAcceptCallResultCallback: any) => Promise<void>
  callerSendOffer: (offer: any) => Promise<void>
  calleeSendAnswer: (answer: any) => Promise<void>
  addTrackCallback: (callback: any) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
