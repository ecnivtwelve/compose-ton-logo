import CtlToolbar from './components/CtlToolbar/CtlToolbar'
import GalleryManager from './components/GalleryManager'
import LayersEditor from './editors/LayersEditor'
import ContentEditor from './editors/ContentEditor'
import ContentPreview, { ContentRenderer } from './editors/ContentPreview'
import { useMemo, useRef, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import { Airplay, ArrowLeft, Mail, XIcon } from 'lucide-react'
import { defaultState, symbolDefaultState, textDefaultState } from './utils/consts'
import Alert from './effects/Alert'
import { ErrorBoundary } from 'react-error-boundary'
import { AnimatePresence, motion } from 'motion/react'
import Button from './components/Button'
import Typography from './components/Typography'
import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import timerSound from './assets/sounds/timer.ogg'
import doneSound from './assets/sounds/ctl_done.ogg'
import aboutEndSound from './assets/sounds/about_end.ogg'
import { tabs } from './utils/tabs'
import upLight from './assets/img/up_light.png'
import consts from './consts.json'

import WelcomeScreen from './components/App/WelcomeScreen'
import RecapModal from './components/App/RecapModal'
import EmailModal from './components/App/EmailModal'
import AppAlerts from './components/App/AppAlerts'

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
  const [sendError, setSendError] = useState(null)

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
        const item = updatedLogos.splice(index, 1)[0]
        item.data = doc
        item.timestamp = timestamp
        updatedLogos.unshift(item)
      } else {
        const newLogo = { id: currentLogoId, timestamp, data: doc }
        updatedLogos.unshift(newLogo)
      }
    } else {
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
    // Check for duplicates (only check against the very last sent logo, which represents what's on screen)
    if (savedLogos.length > 0) {
      const lastSentLogo = savedLogos[0]
      // We check if the data is identical to the last sent logo
      if (JSON.stringify(lastSentLogo.data) === JSON.stringify(document)) {
        setSendError("Ce logo est déjà à l'écran.")
        return
      }
    }

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
        if (challengeMode) {
          setChallengeRecapVisible(true)
        }
        setAboutToSave(false)
        setSending(false)
        quitLogo()
      }, 3000)
    }, 100)
  }

  const [emailPopupShown, setEmailPopupShown] = useState(false)
  const emailPopup = () => {
    setEmailPopupShown(true)
  }

  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState('')
  // eslint-disable-next-line no-unused-vars
  const emailInputRef = useRef(null)
  const [emailInputFocus, setEmailInputFocus] = useState(false)
  const captureRef = useRef(null)
  const [mailError, setMailError] = useState(null)

  const sendEmail = async () => {
    const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!mailRegex.test(email)) {
      setMailError("Email invalide. Assurez-vous d'avoir indiqué un email valide.")
      return
    }

    const mailgun = new Mailgun(FormData)
    const mg = mailgun.client({
      username: 'api',
      key: consts.mailgun_api_key,
      url: 'https://api.eu.mailgun.net'
    })
    try {
      let attachment = undefined
      if (captureRef.current) {
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
      console.log(error)
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
    setEmail('')
    setEmailInputFocus(false)
    setAboutToSave(false)
    setChallengeMode(false)
    setChallengeTimeLeft(180)
    setResetConfirmVisible(false)
    setChallengeFinishConfirmVisible(false)
    setChallengeRecapVisible(false)
  }

  const [editingMode, setEditingMode] = useState(false)
  const [inactivityAlertVisible, setInactivityAlertVisible] = useState(false)
  const [inactivityCount, setInactivityCount] = useState(10)

  // Challenge Mode Logic
  const [challengeMode, setChallengeMode] = useState(false)
  const [challengeExplainerVisible, setChallengeExplainerVisible] = useState(false)
  const [challengeFinishConfirmVisible, setChallengeFinishConfirmVisible] = useState(false)
  const [challengeRecapVisible, setChallengeRecapVisible] = useState(false)
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(180) // 3 minutes

  const timerAudio = useMemo(() => new Audio(timerSound), [])

  const stopTimerAudio = () => {
    timerAudio.pause()
    timerAudio.currentTime = 0
  }

  const startEditing = () => {
    resetLogo()
    setEditingMode(true)
  }

  const startChallenge = () => {
    resetLogo()
    setChallengeMode(true)
    setChallengeTimeLeft(180)
    setEditingMode(true)
    setChallengeExplainerVisible(false)
    stopTimerAudio()
    timerAudio.play()
  }

  useEffect(() => {
    if (
      !challengeMode ||
      !editingMode ||
      aboutToSave ||
      challengeFinishConfirmVisible ||
      challengeRecapVisible
    )
      return

    if (challengeTimeLeft <= 0) {
      const doneAudio = new Audio(doneSound)
      doneAudio.play()
      setAboutToSave(true)
      return
    }

    const timer = setInterval(() => {
      setChallengeTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [
    challengeMode,
    editingMode,
    aboutToSave,
    challengeTimeLeft,
    challengeFinishConfirmVisible,
    challengeRecapVisible
  ])

  const inactivityTimerRef = useRef(null)
  const resetLogoRef = useRef(resetLogo)
  useEffect(() => {
    resetLogoRef.current = resetLogo
  })

  useEffect(() => {
    if (!editingMode || inactivityAlertVisible || challengeMode) return

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
  }, [editingMode, inactivityAlertVisible, challengeMode])

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
    stopTimerAudio()
  }

  const [addNewCurrentLayerCount, setAddNewCurrentLayerCount] = useState(0)

  const addNewCurrentLayer = () => {
    setAddNewCurrentLayerCount((prev) => prev + 1)
  }

  const runsInElectron = navigator.userAgent.toLowerCase().includes('electron')

  const [isIntro, setIsIntro] = useState(!runsInElectron)
  const [waitsForInput, setWaitsForInput] = useState(!runsInElectron)

  if (!editingMode) {
    return (
      <WelcomeScreen
        showRestrictedControls={showRestrictedControls}
        startEditing={startEditing}
        setChallengeExplainerVisible={setChallengeExplainerVisible}
        challengeExplainerVisible={challengeExplainerVisible}
        startChallenge={startChallenge}
        isIntro={isIntro}
        setIsIntro={setIsIntro}
        waitsForInput={waitsForInput}
        setWaitsForInput={setWaitsForInput}
      />
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
      <AppAlerts
        inactivityAlertVisible={inactivityAlertVisible}
        inactivityCount={inactivityCount}
        setInactivityAlertVisible={setInactivityAlertVisible}
        setInactivityCount={setInactivityCount}
        setMailError={setMailError}
        setEditingMode={setEditingMode}
        resetLogo={resetLogo}
        mailError={mailError}
        resetConfirmVisible={resetConfirmVisible}
        setResetConfirmVisible={setResetConfirmVisible}
        stopTimerAudio={stopTimerAudio}
        challengeMode={challengeMode}
        startChallenge={startChallenge}
        quitConfirmVisible={quitConfirmVisible}
        setQuitConfirmVisible={setQuitConfirmVisible}
        quitLogo={quitLogo}
        emailSent={emailSent}
        setEmailSent={setEmailSent}
        challengeFinishConfirmVisible={challengeFinishConfirmVisible}
        setChallengeFinishConfirmVisible={setChallengeFinishConfirmVisible}
        setAboutToSave={setAboutToSave}
        sendError={sendError}
        setSendError={setSendError}
      />

      <RecapModal
        visible={challengeRecapVisible}
        challengeTimeLeft={challengeTimeLeft}
        document={document}
        onQuit={() => {
          setChallengeRecapVisible(false)
          quitLogo()
        }}
      />

      <EmailModal
        visible={emailPopupShown}
        email={email}
        setEmail={setEmail}
        onCancel={() => setEmailPopupShown(false)}
        onSend={sendEmail}
        emailInputFocus={emailInputFocus}
        setEmailInputFocus={setEmailInputFocus}
      />

      <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
        <div ref={captureRef} style={{ width: 1000, height: 1000, backgroundColor: 'transparent' }}>
          <ContentRenderer document={document} animated={false} simplified={false} />
        </div>
      </div>

      {sending && aboutToSave && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            objectFit: 'cover',
            zIndex: 9999,
            backgroundColor: 'green',
            maskImage:
              'radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.00) 0%, #FFF 100%)'
          }}
          animate={sending && aboutToSave ? { opacity: [0, 0.7, 0, 0] } : { opacity: 0 }}
          transition={
            sending && aboutToSave
              ? {
                duration: 2,
                ease: 'easeInOut',
                times: [0, 0.003, 0.2, 1]
              }
              : { duration: 0 }
          }
        />
      )}

      {sending && aboutToSave && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            objectFit: 'cover',
            zIndex: 9999,
            backgroundColor: 'black'
          }}
          animate={sending && aboutToSave ? { opacity: [0, 0, 0, 1] } : { opacity: 0 }}
          transition={
            sending && aboutToSave
              ? {
                duration: 3,
                ease: 'easeInOut',
                times: [0, 0.5, 0.85, 1]
              }
              : { duration: 0 }
          }
        />
      )}

      <motion.img
        src={upLight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          objectFit: 'cover',
          zIndex: 99999
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
                challengeMode={challengeMode}
                challengeTimeLeft={challengeTimeLeft}
                addNewCurrentLayerCount={addNewCurrentLayerCount}
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
              <ContentPreview
                document={document}
                setDocument={setDocument}
                layer={layer}
                setLayer={setLayer}
                setTab={setTab}
                interactive={!aboutToSave}
              />
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
                  {!challengeMode && (
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
                  )}

                  {challengeMode && (
                    <Button
                      tint={!sending && '#C52E2E'}
                      onClick={() => {
                        resetLogo()
                        setEditingMode(false)
                      }}
                      style={{
                        opacity: sending ? 0.5 : 1
                      }}
                    >
                      <XIcon size={28} strokeWidth={2.5} className="ts" />
                      <Typography className="font-semibold text-xl">
                        Abandonner / Recommencer
                      </Typography>
                    </Button>
                  )}
                  {runsInElectron && (
                    <Button tint="#0055FF" onClick={() => emailPopup()}>
                      <Mail size={28} strokeWidth={2.5} className="ts" />
                      <Typography className="font-semibold text-xl">Recevoir par e-mail</Typography>
                    </Button>
                  )}
                  <Button tint="#12C958" onClick={() => startSending()} customSound={aboutEndSound}>
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
              if (type == tab && tab !== 'background') {
                addNewCurrentLayer()
              }

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
            done={() => {
              if (challengeMode) {
                setChallengeFinishConfirmVisible(true)
              } else {
                setAboutToSave(true)
              }
            }}
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
