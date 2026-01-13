import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SecondApp from './SecondApp'
import ClickEffect from './effects/ClickEffect'
import DevTools from './effects/DevTools'
import Keyboard from './effects/Keyboard'

import ScaleContainer from './components/ScaleContainer'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScaleContainer>
      <SecondApp />
      <ClickEffect />
      <DevTools />
      <Keyboard />
    </ScaleContainer>
  </StrictMode>
)
