import CtlToolbar from './components/CtlToolbar/CtlToolbar'
import GalleryManager from './components/GalleryManager'
import LayersEditor from './editors/LayersEditor'
import ContentEditor from './editors/ContentEditor'
import ContentPreview from './editors/ContentPreview'
import { useState } from 'react'
import { Airplay, ArrowLeft } from 'lucide-react'
import { defaultState, symbolDefaultState, textDefaultState } from './utils/consts'
import Alert from './effects/Alert'
import { ErrorBoundary } from 'react-error-boundary'
import { AnimatePresence, motion } from 'motion/react'
import Button from './components/Button'
import Typography from './components/Typography'

import doneSound from './assets/sounds/ctl_done.ogg'
import upLight from './assets/img/up_light.png'

import { tabs } from './utils/tabs'

function App() {
  const [document, setDocument] = useState(() =>
    defaultState.map((s) => ({ ...s, id: Math.random().toString(36).substr(2, 9) }))
  )
  const [tab, setTab] = useState('text')

  const [layer, setLayer] = useState(1)

  const [resetConfirmVisible, setResetConfirmVisible] = useState(false)

  const [aboutToSave, setAboutToSave] = useState(false)
  const [sending, setSending] = useState(false)
  const [currentLogoId, setCurrentLogoId] = useState(null)

  const [galleryVisible, setGalleryVisible] = useState(false)

  const [savedLogos, setSavedLogos] = useState(() => {
    try {
      const loaded = JSON.parse(localStorage.getItem('sentLogos') || '[]')
      // Deduplicate by ID
      const unique = Array.from(new Map(loaded.map((item) => [item.id, item])).values())

      // Sort by timestamp if needed (already sorted by unshift, but good to be safe)
      unique.sort((a, b) => b.timestamp - a.timestamp)

      return unique
    } catch (e) {
      console.error('Failed to parse saved logos', e)
      return []
    }
  })

  const saveLogoToStorage = (doc) => {
    const timestamp = Date.now()
    const currentLogos = JSON.parse(localStorage.getItem('sentLogos') || '[]')
    let updatedLogos = [...currentLogos]

    if (currentLogoId) {
      const index = updatedLogos.findIndex((l) => l.id === currentLogoId)
      if (index !== -1) {
        // Update existing
        const item = updatedLogos.splice(index, 1)[0]
        item.data = doc
        item.timestamp = timestamp
        updatedLogos.unshift(item)
      } else {
        // ID not found (maybe deleted?), treat as new
        const newLogo = { id: currentLogoId, timestamp, data: doc }
        updatedLogos.unshift(newLogo)
      }
    } else {
      // New
      const newId = Math.random().toString(36).substr(2, 9)
      const newLogo = {
        id: newId,
        timestamp,
        data: doc
      }
      updatedLogos.unshift(newLogo)
      setCurrentLogoId(newId)
    }

    localStorage.setItem('sentLogos', JSON.stringify(updatedLogos))
    setSavedLogos(updatedLogos)
  }

  const handleDeleteLogo = (id) => {
    const updatedLogos = savedLogos.filter((l) => l.id !== id)
    localStorage.setItem('sentLogos', JSON.stringify(updatedLogos))
    setSavedLogos(updatedLogos)
  }

  const handleClearAll = () => {
    localStorage.removeItem('sentLogos')
    setSavedLogos([])
  }

  const handleReinject = (logo) => {
    setDocument(logo.data)
    setCurrentLogoId(logo.id)
    setGalleryVisible(false)
    setAboutToSave(true)
  }

  const startSending = () => {
    setSending(false)
    setTimeout(() => {
      const doneAudio = new Audio(doneSound)
      doneAudio.play()
      setSending(true)
      saveLogoToStorage(document)

      const serializableDoc = document.map((layer) => {
        if (layer.type === 'symbols' && layer.symbol) {
          // eslint-disable-next-line no-unused-vars
          const { svg, ...restSymbol } = layer.symbol
          return { ...layer, symbol: restSymbol }
        }
        return layer
      })
      window.electron.ipcRenderer.send('send-logo', serializableDoc)

      setTimeout(() => {
        setAboutToSave(false)
        setSending(false)
      }, 2000)
    }, 100)
  }

  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
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
          setCurrentLogoId(null)
          setAboutToSave(false)
          setResetConfirmVisible(false)
        }}
        confirmText="Recommencer"
        onCancel={() => setResetConfirmVisible(false)}
      />

      <motion.img
        src={upLight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          objectFit: 'cover',
          zIndex: 9999
        }}
        animate={sending && aboutToSave ? { opacity: [0, 0, 1, 0] } : { opacity: 0 }}
        transition={
          sending && aboutToSave
            ? {
              duration: 2,
              ease: 'easeInOut',
              times: [0, 0.5, 0.98, 1]
            }
            : { duration: 0 }
        }
      />

      <div className="flex flex-row w-full h-full p-12 gap-4">
        <AnimatePresence>
          {!aboutToSave && (
            <>
              <LayersEditor
                document={document}
                setDocument={setDocument}
                layer={layer}
                setLayer={setLayer}
                tab={tab}
                setTab={setTab}
              />
              <ContentEditor
                document={document}
                setDocument={setDocument}
                layer={layer}
                tab={tab}
              />
            </>
          )}
        </AnimatePresence>

        <div
          className="w-[680px]"
          style={{
            minWidth: 680
          }}
        />

        <motion.div
          style={{
            position: 'absolute',
            right: 50,
            top: 50,
            height: 'calc(100% - 100px)',
            width: aboutToSave ? 1820 : 680,
            transition: 'width 0.7s cubic-bezier(0.3, 0, 0, 1)'
          }}
        >
          <>
            <motion.div
              style={{
                width: '100%',
                height: '100%'
              }}
              animate={
                sending && aboutToSave
                  ? { y: [0, 300, -3000], scale: [1, 0.9, 3] }
                  : { y: 0, scale: 1 }
              }
              transition={
                sending && aboutToSave
                  ? {
                    duration: 2,
                    ease: 'easeInOut',
                    times: [0, 0.7, 1]
                  }
                  : { duration: 0 }
              }
            >
              <ContentPreview document={document} />
            </motion.div>

            <AnimatePresence>
              {aboutToSave && (
                <motion.div
                  className="flex w-full align-center justify-center p-0 gap-4"
                  style={{
                    position: 'absolute',
                    bottom: 0
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { delay: 0 } }}
                  transition={{ duration: 0.5, delay: 0.3, ease: [0.3, 0, 0, 1] }}
                >
                  <Button
                    tint={!sending && '#C52E2E'}
                    onClick={() => {
                      if (sending) return false
                      setAboutToSave(false)
                      setSending(false)
                    }}
                    style={{
                      opacity: sending ? 0.5 : 1
                    }}
                  >
                    <ArrowLeft size={28} strokeWidth={2.5} className="ts" />
                    <Typography className="font-semibold text-xl">
                      Revenir à l’écran précédent
                    </Typography>
                  </Button>
                  <Button tint="#12C958" onClick={() => startSending()}>
                    <Airplay size={28} strokeWidth={2.5} className="ts" />
                    <Typography className="font-semibold text-xl">Envoyer à l&apos;écran</Typography>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        </motion.div>
      </div>
      <AnimatePresence>
        {!aboutToSave && (
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
            done={() => setAboutToSave(true)}
            history={() => setGalleryVisible(true)}
          />
        )}
      </AnimatePresence>
      <GalleryManager
        visible={galleryVisible}
        onClose={() => setGalleryVisible(false)}
        savedLogos={savedLogos}
        onReinject={handleReinject}
        onDelete={handleDeleteLogo}
        onClearAll={handleClearAll}
      />
    </ErrorBoundary>
  )
}

export default App
