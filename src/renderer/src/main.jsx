import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ClickEffect from './effects/ClickEffect'
import DevTools from './effects/DevTools'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div id="app">
      <App />
      <ClickEffect />
      <DevTools />
    </div>
  </StrictMode>
)
