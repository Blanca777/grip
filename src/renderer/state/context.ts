import {createContext, Context, Dispatch} from 'react'
import {Istate, Iaction, defaultState} from './reducer'
let initDispatch
const StoreContext = createContext<[Istate, React.Dispatch<Iaction>]>([
  defaultState,
  initDispatch as React.Dispatch<Iaction>,
])

export default StoreContext
