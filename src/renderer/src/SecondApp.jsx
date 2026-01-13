import ContentPreview, { ContentRenderer } from './editors/ContentPreview'
import { useState, useEffect } from 'react'
import { symbols } from './utils/symbols'
import Alert from './effects/Alert'
import { ErrorBoundary } from 'react-error-boundary'
import { AnimatePresence, motion } from 'motion/react'
import downLight from './assets/img/down_light.png'
import overlay from './assets/img/projo_overlay.png'
import LogoGallery from './components/LogoGallery'

function App() {
  const [logoGallery, setLogoGallery] = useState([])
  const [logoData, setLogoData] = useState(null)
  const [currentLogoIncrement, setCurrentLogoIncrement] = useState(0)

  const addToLogoGallery = (logo) => {
    setTimeout(() => {
      setLogoGallery((prev) => [...prev, logo])
    }, 3000)
  }

  useEffect(() => {
    console.log('SecondApp mounted, setting up IPC listener')
    const handleDisplayLogo = (_, receivedDoc) => {
      console.log('SecondApp received display-logo event', receivedDoc)
      const hydratedDoc = receivedDoc.map((layer) => {
        if (layer.type === 'symbols' && layer.symbol) {
          // Find the symbol by name across all categories
          for (const category of symbols) {
            const foundSymbol = category.symbols.find((s) => s.name === layer.symbol.name)
            if (foundSymbol) {
              return { ...layer, symbol: { ...layer.symbol, svg: foundSymbol.svg } }
            }
          }
        }
        return layer
      })
      setLogoData(hydratedDoc)
      setCurrentLogoIncrement((prev) => prev + 1)
      addToLogoGallery(hydratedDoc)
    }

    if (window.electron && window.electron.ipcRenderer) {
      console.log('IPC Renderer found in SecondApp')
      window.electron.ipcRenderer.on('display-logo', handleDisplayLogo)
    } else {
      console.error('IPC Renderer NOT found in SecondApp')
    }

    return () => {
      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners('display-logo')
      }
    }
  }, [])

  useEffect(() => {
    if (logoData) {
      const timer = setTimeout(() => {
        setLogoData(null)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [logoData, currentLogoIncrement])

  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <Alert
          visible={true}
          title="Quelque chose s'est mal passé !"
          message={`Une erreur est survenue dans la seconde fenêtre. \n \n (Erreur : ${error.message})`}
          confirmText="Quitter"
          onConfirm={() => {
            window.electron.ipcRenderer.send('quit-app')
          }}
          hideCancel
        />
      )}
    >
      <LogoGallery logos={logoGallery} />

      <motion.img
        src={overlay}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          objectFit: 'cover',
          zIndex: 99999
        }}
      />

      {logoData && (
        <motion.img
          src={downLight}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            objectFit: 'cover',
            zIndex: 99
          }}
          animate={{ opacity: [0, 0, 1, 0] }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            times: [0, 0.4, 0.98, 1]
          }}
          key={currentLogoIncrement}
        />
      )}

      <div className="w-full h-full flex align-center justify-center">
        <AnimatePresence>
          {logoData && (
            <motion.div
              style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'absolute',
                filter: 'drop-shadow(0px 0px 100px rgba(0, 0, 0, 0.5))',
                zIndex: 9999
              }}
              initial={{
                y: 1000,
                scale: 0.8
              }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1.3,
                transition: { type: 'spring', duration: 1, delay: 1.5, bounce: 0.3 }
              }}
              exit={{
                opacity: 0,
                scale: 2,
                transition: { duration: 1, ease: 'easeInOut' }
              }}
              key={currentLogoIncrement}
            >
              <ContentRenderer document={logoData} animated={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}

export default App
