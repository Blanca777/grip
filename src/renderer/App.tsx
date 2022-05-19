import React, {useReducer} from 'react'
import {MemoryRouter, Routes, Route} from 'react-router-dom'
import Home from './component/Home/Home'
import VideoRoom from './component/VideoRoom/VideoRoom'
import StoreContext from './state/context'
import {reducer, defaultState} from './state/reducer'
const App: React.FC = () => {
  const store = useReducer(reducer, defaultState)
  
  return (
    <StoreContext.Provider value={store}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/videoRoom" element={<VideoRoom />} />
        </Routes>
      </MemoryRouter>
    </StoreContext.Provider>
  )
}
export default App
