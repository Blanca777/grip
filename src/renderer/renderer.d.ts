export interface IElectronAPI {
  getLocalChannel: () => Promise<string>
  toWatch: (remoteChannel: string) => Promise<any>
  toShare: (localChannel: string) => Promise<any>
  closeShare: (localChannel: string) => Promise<any>

  
  addWatchListener: (
    toWatchSuccessHandle: (...args: any[]) => void,
    toWatchFailHandle: (...args: any[]) => void,
  ) => void
  addShareListener: (
    toShareSuccessHandle: (...args: any[]) => void,
    toShareFailHandle: (...args: any[]) => void,
  ) => void
  addCloseShareListener: (
    CloseShareSuccessHandle: (...args: any[]) => void,
    CloseShareFailHandle: (...args: any[]) => void,
  ) => void


  addWhoIntoChannelListener: (callback: any) => void
  removeWhoIntoChannelListener: (callback: any) => void

  addCurChannelCloseListener: (callback: any) => void

  getScreenStream: () => Promise<Electron.DesktopCapturerSource[]>
  setRemoteAnswer: (answer: any) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
