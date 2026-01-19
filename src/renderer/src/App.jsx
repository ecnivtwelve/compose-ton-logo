import CtlToolbar from './components/CtlToolbar/CtlToolbar'
import GalleryManager from './components/GalleryManager'
import LayersEditor from './editors/LayersEditor'
import ContentEditor from './editors/ContentEditor'
import ContentPreview, { ContentRenderer } from './editors/ContentPreview'
import { useMemo, useRef, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import { Airplay, ArrowLeft, AtSignIcon, Mail, PlayIcon, XIcon } from 'lucide-react'
import { defaultState, symbolDefaultState, textDefaultState } from './utils/consts'
import Alert from './effects/Alert'
import { ErrorBoundary } from 'react-error-boundary'
import { AnimatePresence, motion } from 'motion/react'
import Button from './components/Button'
import Typography from './components/Typography'
import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import background from './assets/img/background.svg'
import logo from './assets/img/logo.png'
import credits from './assets/img/credits.svg'

import doneSound from './assets/sounds/ctl_done.ogg'
import upLight from './assets/img/up_light.png'

import { tabs } from './utils/tabs'

import packageJson from '../../../package.json'

function App() {
  const [showRestrictedControls, setShowRestrictedControls] = useState(false)

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const config = await window.api.getAppConfig()
        setShowRestrictedControls(config.isDev || config.isAdmin)
      } catch (error) {
        console.error('Failed to get app config:', error)
      }
    }
    checkConfig()
  }, [])

  const [document, setDocument] = useState(() =>
    defaultState.map((s) => ({ ...s, id: Math.random().toString(36).substr(2, 9) }))
  )
  const [tab, setTab] = useState('text')

  const [layer, setLayer] = useState(1)

  const [resetConfirmVisible, setResetConfirmVisible] = useState(false)
  const [quitConfirmVisible, setQuitConfirmVisible] = useState(false)

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

  const [emailPopupShown, setEmailPopupShown] = useState(false)

  const emailPopup = () => {
    setEmailPopupShown(true)
  }

  const closeEmailPopup = () => {
    setEmailPopupShown(false)
  }

  const [emailSent, setEmailSent] = useState(false)

  const [email, setEmail] = useState('')
  const emailInputRef = useRef(null)
  const [emailInputFocus, setEmailInputFocus] = useState(false)
  const captureRef = useRef(null)
  const [mailError, setMailError] = useState(null)

  const sendEmail = async () => {
    // check if mail is valid
    const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!mailRegex.test(email)) {
      setMailError("Email invalide. Assurez-vous d'avoir indiqué un email valide.")
      return
    }

    const mailgun = new Mailgun(FormData)
    const mg = mailgun.client({
      username: 'api',
      key: 'dd835a51f28fb48c03778236ee6975a3-42b8ce75-0de63f49',
      // When you have an EU-domain, you must specify the endpoint:
      url: 'https://api.eu.mailgun.net'
    })
    try {
      let attachment = undefined
      if (captureRef.current) {
        // Wait a bit for images to load if needed, but usually they are preloaded.
        // Also, might want to show a loading state in the UI.
        const dataUrl = await toPng(captureRef.current, { cacheBust: true, pixelRatio: 1 })
        const blob = await (await fetch(dataUrl)).blob()
        attachment = new File([blob], 'logo.png', { type: 'image/png' })
      }

      const data = await mg.messages.create('compose-ton-logo.vincelinise.com', {
        from: 'MMI IUT de Lannion <noreply@compose-ton-logo.vincelinise.com>',
        to: [email],
        subject: 'Compose ton logo - Votre logo est prêt !',
        template: 'LogoReady',
        attachment
      })

      console.log(data)
      setEmailPopupShown(false)
      setEmailSent(true)
    } catch (error) {
      console.log(error) //logs any error
      setMailError(error.message)
    }
  }

  const hasLogoBeenEdited = useMemo(() => {
    const currentContent = document.map((layer) => {
      // eslint-disable-next-line no-unused-vars
      const { id, ...rest } = layer
      return rest
    })
    return JSON.stringify(currentContent) !== JSON.stringify(defaultState)
  }, [document])

  const resetLogo = () => {
    setDocument(defaultState.map((s) => ({ ...s, id: Math.random().toString(36).substr(2, 9) })))
    setLayer(1)
    setTab('text')
    setCurrentLogoId(null)
    setAboutToSave(false)
    setResetConfirmVisible(false)
  }

  const [editingMode, setEditingMode] = useState(false)
  const [inactivityAlertVisible, setInactivityAlertVisible] = useState(false)
  const [inactivityCount, setInactivityCount] = useState(10)

  const startEditing = () => {
    resetLogo()
    setEditingMode(true)
  }

  const inactivityTimerRef = useRef(null)
  const resetLogoRef = useRef(resetLogo)
  useEffect(() => {
    resetLogoRef.current = resetLogo
  })

  useEffect(() => {
    if (!editingMode || inactivityAlertVisible) return

    const resetTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = setTimeout(() => {
        setInactivityAlertVisible(true)
        setInactivityCount(10)
      }, 30000)
    }

    resetTimer()

    const handleActivity = () => {
      resetTimer()
    }

    const events = ['mousedown', 'mousemove', 'click', 'scroll', 'touchstart', 'keydown']
    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [editingMode, inactivityAlertVisible])

  useEffect(() => {
    if (!inactivityAlertVisible) return

    const timer = setInterval(() => {
      setInactivityCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setInactivityAlertVisible(false)
          setEditingMode(false)
          resetLogoRef.current()
          return 10
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [inactivityAlertVisible])

  const quitLogo = () => {
    resetLogo()
    setEditingMode(false)
    setQuitConfirmVisible(false)
  }

  if (!editingMode) {
    return (
      <div
        className="w-full h-full flex items-center justify-center bg-black"
        onClick={() => startEditing()}
      >
        <Button
          tint="#12C958"
          onClick={() => startEditing()}
          style={{
            position: 'absolute',
            zIndex: 2,
            bottom: 120
          }}
        >
          <PlayIcon className="ts" size={32} fill="#FFF" />
          <p className="ts text-3xl font-semibold">Créer mon logo</p>
        </Button>

        <Typography
          style={{
            position: 'absolute',
            zIndex: 3,
            left: 20,
            bottom: 20
          }}
          className="font-regular text-md"
        >
          Version {packageJson.version} {showRestrictedControls && '(admin)'}
        </Typography>

        <Typography
          style={{
            position: 'absolute',
            zIndex: 2,
            bottom: 40,
            textAlign: 'center'
          }}
          className="font-regular text-md"
        >
          <span className="font-semibold">© 2025 IUT de Lannion — Département MMI — SAÉ 3.ALT</span>
          <br />
          Roxane OMNES et Vince LINISE
        </Typography>

        <img
          src={credits}
          style={{
            position: 'absolute',
            zIndex: 4,
            bottom: 20,
            right: 20,
            height: 50,
            filter: 'drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.5))'
          }}
        />

        <img
          src={logo}
          style={{
            position: 'absolute',
            zIndex: 2,
            height: 300,
            filter: 'drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.5))'
          }}
        />

        <motion.img
          src={background}
          alt=""
          style={{
            position: 'absolute',
            zIndex: 1,
          }}
          className="ctl-rotateForever"
        />
      </div>
    )
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
        visible={inactivityAlertVisible}
        title="Es-tu encore là ?"
        message="Tu es inactif depuis un moment. Veux-tu continuer à composer ton logo ?"
        cancelText={`Supprimer (${inactivityCount})`}
        confirmText="Oui, je suis encore là"
        cancelTint="#C52E2E"
        confirmTint="#12C958"
        onConfirm={() => {
          setInactivityAlertVisible(false)
          setInactivityCount(10)
          setMailError(null)
        }}
        onCancel={() => {
          setInactivityAlertVisible(false)
          setInactivityCount(10)
          setEditingMode(false)
          resetLogo()
        }}
      />

      <Alert
        visible={mailError}
        title="Impossible d'envoyer le mail"
        message={mailError}
        confirmText="OK"
        onConfirm={() => {
          setMailError(null)
        }}
        hideCancel
      />

      <Alert
        visible={resetConfirmVisible}
        title="Recommencer à zéro ?"
        message="Voulez-vous vraiment recommencer à partir du début ?"
        onConfirm={() => {
          resetLogo()
        }}
        confirmText="Recommencer"
        onCancel={() => setResetConfirmVisible(false)}
      />



      <Alert
        visible={quitConfirmVisible}
        title="Quitter la création du logo ?"
        message="Voulez-vous vraiment quitter la création du logo ? Votre travail sera perdu."
        onConfirm={() => {
          quitLogo()
        }}
        confirmText="Quitter"
        onCancel={() => setQuitConfirmVisible(false)}
      />

      <Alert
        visible={emailSent}
        title="E-mail envoyé !"
        message="Vous avez reçu votre logo sur votre boîte mail !"
        onConfirm={() => {
          setEmailSent(false)
        }}
        confirmText="OK"
        hideCancel
      />

      <AnimatePresence>
        {emailPopupShown && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99,
              backdropFilter: 'blur(5px)'
            }}
            initial={{ opacity: 0, scale: 1.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-10 rounded-3xl w-326 flex flex-col gap-4">
              <p className="ts text-5xl text-center font-semibold">Recevoir le logo par e-mail</p>
              <p className="ts text-3xl text-center mb-4">
                Indiquez votre adresse e-mail pour recevoir le logo que vous venez de créer !
              </p>

              <div className="ctl-pressable ctl-bw px-6 rounded-2xl flex items-center gap-4">
                <AtSignIcon size={28} strokeWidth={2.5} className="ts" />

                <input
                  ref={emailInputRef}
                  type="text"
                  placeholder="Votre adresse e-mail"
                  className="ts color-white text-2xl font-medium py-4 w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailInputFocus(true)}
                  onBlur={() => setEmailInputFocus(false)}
                />

                {email.length > 1 && (
                  <XIcon size={32} strokeWidth={2.5} className="ts" onClick={() => setEmail('')} />
                )}
              </div>

              <div className="flex flex-row items-center justify-center w-full gap-4 mt-2">
                <Button onClick={() => setEmailPopupShown(false)}>
                  <p className="ts text-3xl font-semibold">Annuler</p>
                </Button>
                <Button tint={'#0055FF'} onClick={() => sendEmail()}>
                  <p className="ts text-3xl font-semibold">Recevoir un e-mail</p>
                </Button>
              </div>

              {emailInputFocus && <div className="h-42" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
        <div ref={captureRef} style={{ width: 1000, height: 1000, backgroundColor: 'transparent' }}>
          <ContentRenderer document={document} animated={false} simplified={false} />
        </div>
      </div>

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
                  <Button tint="#0055FF" onClick={() => emailPopup()}>
                    <Mail size={28} strokeWidth={2.5} className="ts" />
                    <Typography className="font-semibold text-xl">Recevoir par e-mail</Typography>
                  </Button>
                  <Button tint="#12C958" onClick={() => startSending()}>
                    <Airplay size={28} strokeWidth={2.5} className="ts" />
                    <Typography className="font-semibold text-xl">
                      Envoyer à l&apos;écran
                    </Typography>
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
            hasLogoBeenEdited={hasLogoBeenEdited}
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
            quit={() => {
              setQuitConfirmVisible(true)
            }}
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
