import CtlToolbar from './components/CtlToolbar/CtlToolbar'
import LayersEditor from './editors/LayersEditor'
import ContentEditor from './editors/ContentEditor'
import ContentPreview from './editors/ContentPreview'
import { useState } from 'react'
import { ImagesIcon, ShapesIcon, TypeIcon } from 'lucide-react'
import { defaultState, symbolDefaultState, textDefaultState } from './utils/consts'
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
  const [document, setDocument] = useState(() =>
    defaultState.map((s) => ({ ...s, id: Math.random().toString(36).substr(2, 9) }))
  )
  const [tab, setTab] = useState('text')

  const [layer, setLayer] = useState(1)

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
          setDocument(
            defaultState.map((s) => ({ ...s, id: Math.random().toString(36).substr(2, 9) }))
          )
          setLayer(1)
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
        <ContentEditor document={document} setDocument={setDocument} layer={layer} tab={tab} />
        <ContentPreview document={document} />
      </div>
      <CtlToolbar
        selectedTab={tab}
        setSelectedTab={(type) => {
          if (type === 'background') {
            setTab(type)
            const bgIndex = document.findIndex((l) => l.type === 'background')
            if (bgIndex !== -1) {
              setLayer(bgIndex)
            }
            return
          }

          const availableLayers = document
            .map((l, i) => ({ ...l, index: i }))
            .filter((l) => l.type === type)

          if (availableLayers.length === 0) {
            const newLayer = {
              ...(type === 'text' ? textDefaultState : symbolDefaultState),
              id: Math.random().toString(36).substr(2, 9)
            }
            const newDocument = [...document, newLayer]
            setDocument(newDocument)
            setLayer(newDocument.length - 1)
          } else {
            const nearest = availableLayers.reduce((prev, curr) => {
              return Math.abs(curr.index - layer) < Math.abs(prev.index - layer) ? curr : prev
            })
            setLayer(nearest.index)
          }

          setTab(type)
        }}
        tabs={tabs}
        reset={() => setResetConfirmVisible(true)}
      />
    </ErrorBoundary>
  )
}

export default App
