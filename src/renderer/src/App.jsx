import CtlToolbar from './components/CtlToolbar/CtlToolbar'
import LayersEditor from './editors/LayersEditor'
import ContentEditor from './editors/ContentEditor'
import ContentPreview from './editors/ContentPreview'
import { useState } from 'react'
import { ImagesIcon, ShapesIcon, TypeIcon } from 'lucide-react'
import { defaultState } from './utils/consts'
import Alert from './effects/Alert'
import { ErrorBoundary } from 'react-error-boundary'

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
  const [document, setDocument] = useState(defaultState)
  const [tab, setTab] = useState('text')

  const [layer, setLayer] = useState(0)

  const [resetConfirmVisible, setResetConfirmVisible] = useState(false)

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
      <Alert
        visible={resetConfirmVisible}
        title="Recommencer à zéro ?"
        message="Voulez-vous vraiment recommencer à partir du début ?"
        onConfirm={() => {
          setDocument(defaultState)
          setLayer(0)
          setResetConfirmVisible(false)
        }}
        confirmText="Recommencer"
        onCancel={() => setResetConfirmVisible(false)}
      />

      <div className="flex flex-row w-full h-full p-12 gap-4">
        <LayersEditor
          document={document}
          setDocument={setDocument}
          layer={layer}
          setLayer={setLayer}
          tab={tab}
          setTab={setTab}
        />
        <ContentEditor document={document} setDocument={setDocument} layer={layer} />
        <ContentPreview document={document} />
      </div>
      <CtlToolbar
        selectedTab={tab}
        setSelectedTab={(type) => {
          setTab(type)
        }}
        tabs={tabs}
        reset={() => setResetConfirmVisible(true)}
      />
    </ErrorBoundary>
  )
}

export default App
