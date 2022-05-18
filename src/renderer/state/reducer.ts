export enum ActionType {
  ChangeLocalChannel = 'ChangeLocalChannel',
  ChangeRemoteChannel = 'ChangeRemoteChannel',
}
export interface Istate {
  localChannel: number
  remoteChannel: number
}
export interface Iaction {
  type: ActionType
  [key: string]: any
}
export const defaultState: Istate = {
  localChannel: 0,
  remoteChannel: 0,
}
export const reducer: (state: Istate, action: Iaction) => Istate = (state, action) => {
  switch (action.type) {
    case ActionType.ChangeLocalChannel:
      return changeLocalChannel(state, action)
    case ActionType.ChangeRemoteChannel:
      return ChangeRemoteChannel(state, action)
    default:
      return state
  }
}
function changeLocalChannel(state: Istate, action: Iaction): Istate {
  return {
    ...state,
    localChannel: action.localChannel,
  }
}
function ChangeRemoteChannel(state: Istate, action: Iaction): Istate {
  return {
    ...state,
    remoteChannel: action.remoteChannel,
  }
}
