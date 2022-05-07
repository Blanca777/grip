export interface IElectronAPI {
  getLocalChannel: () => Promise<string>
  toWatch: (remoteChannel: string) => Promise<any>
  toShare: (localChannel: string) => Promise<any>
  addWatchListener: (
    toWatchSuccessHandle: (...args: any[]) => void,
    toWatchFailHandle: (...args: any[]) => void,
  ) => void
  removeWatchListener: (
    toWatchSuccessHandle: (...args: any[]) => void,
    toWatchFailHandle: (...args: any[]) => void,
  ) => void
  addShareListener: (
    toShareSuccessHandle: (...args: any[]) => void,
    toShareFailHandle: (...args: any[]) => void,
  ) => void
  removeShareListener: (
    toShareSuccessHandle: (...args: any[]) => void,
    toShareFailHandle: (...args: any[]) => void,
  ) => void
  addWhoIntoChannelListener: (callback: any) => void
  removeWhoIntoChannelListener: (callback: any) => void
  getScreenStream: () => Promise<Electron.DesktopCapturerSource[]>
  setRemoteAnswer: (answer: any) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
