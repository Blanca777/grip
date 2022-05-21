export enum ActionType {
  ChangeLocalMsg = 'ChangeLocalMsg',
  ChangeRemoteMsg = 'ChangeRemoteMsg',
  ChangeIsClientInToCalling = 'ChangeIsClientInToCalling',
}
export interface IuserMsg {
  channel: number
  nickname: string
  callInfo: string
  inCalling: boolean
}
export interface Istate {
  localMsg: IuserMsg
  remoteMsg: IuserMsg
  isClientInToCalling: boolean
}
export interface Iaction {
  type: ActionType
  [key: string]: any
}

export const defaultState: Istate = {
  localMsg: {channel: 0, nickname: '', callInfo: ''},
  remoteMsg: {channel: 0, nickname: '', callInfo: ''},
  isClientInToCalling: false,
}
export const reducer: (state: Istate, action: Iaction) => Istate = (state, action) => {
  switch (action.type) {
    case ActionType.ChangeLocalMsg:
      return changeLocalMsg(state, action)
    case ActionType.ChangeRemoteMsg:
      return changeRemoteMsg(state, action)
    case ActionType.ChangeIsClientInToCalling:
      return ChangeIsClientInToCalling(state, action)
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
function ChangeIsClientInToCalling(state: Istate, action: Iaction): Istate {
  return {
    ...state,
    isClientInToCalling: action.isClientInToCalling,
  }
}
