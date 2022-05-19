export enum ActionType {
  ChangeLocalMsg = 'ChangeLocalMsg',
  ChangeRemoteMsg = 'ChangeRemoteMsg',
}
export interface IuserMsg {
  channel: number
  nickname: string
  callInfo: string
}
export interface Istate {
  localMsg: IuserMsg
  remoteMsg: IuserMsg
}
export interface Iaction {
  type: ActionType
  [key: string]: any
}

export const defaultState: Istate = {
  localMsg: {channel: 0, nickname: '', callInfo: ''},
  remoteMsg: {channel: 0, nickname: '', callInfo: ''},
}
export const reducer: (state: Istate, action: Iaction) => Istate = (state, action) => {
  switch (action.type) {
    case ActionType.ChangeLocalMsg:
      return changeLocalMsg(state, action)
    case ActionType.ChangeRemoteMsg:
      return changeRemoteMsg(state, action)
    default:
      return state
  }
}
function changeLocalMsg(state: Istate, action: Iaction): Istate {
  return {
    ...state,
    localMsg: action.localMsg,
  }
}
function changeRemoteMsg(state: Istate, action: Iaction): Istate {
  return {
    ...state,
    remoteMsg: action.remoteMsg,
  }
}
