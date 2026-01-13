import CtlToolbar from './components/CtlToolbar/CtlToolbar'
import LayersEditor from './editors/LayersEditor'
import ContentEditor from './editors/ContentEditor'
import ContentPreview from './editors/ContentPreview'
import { useState } from 'react'
import { Airplay, ArrowLeft, ImagesIcon, ShapesIcon, TypeIcon } from 'lucide-react'
import { defaultState, symbolDefaultState, textDefaultState } from './utils/consts'
import Alert from './effects/Alert'
import { ErrorBoundary } from 'react-error-boundary'
import { AnimatePresence, motion } from 'motion/react'
import Button from './components/Button'
import Typography from './components/Typography'

import doneSound from './assets/sounds/ctl_done.ogg'
import upLight from './assets/img/up_light.png'
import Intro from './components/Intro'

export const tabs = [
  {
    key: 'text',
    title: 'Texte',
    icon: <TypeIcon size={28} strokeWidth={2.5} className="ts" />
  },
  {
    key: 'symbols',
    title: 'Symboles',
    icon: <ShapesIcon size={28} strokeWidth={2.5} className="ts" />
  },
  {
    key: 'background',
    title: 'Arrière-plan',
    icon: <ImagesIcon size={28} strokeWidth={2.5} className="ts" />
  }
]

function App() {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <Alert
          visible={true}
          title="Quelque chose s'est mal passé !"
          message={`Une erreur est survenue et Compose Ton Logo à planté. Veuillez relancer l'application. \n \n (Erreur : ${error.message})`}
          confirmText="Quitter"
          onConfirm={() => {
            window.electron.ipcRenderer.send('quit-app')
          }}
          hideCancel
        />
      )}
    >
    </ErrorBoundary>
  )
}

export default App
