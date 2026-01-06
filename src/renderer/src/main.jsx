import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ClickEffect from './effects/ClickEffect'
import DevTools from './effects/DevTools'
import Keyboard from './effects/Keyboard'

import ScaleContainer from './components/ScaleContainer'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScaleContainer>
      <App />
      <ClickEffect />
      <DevTools />
      <Keyboard />
    </ScaleContainer>
  </StrictMode>
)
