import { PlayIcon, Timer } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Button from '../Button'
import Typography from '../Typography'
import packageJson from '../../../../../package.json'
import background from '../../assets/img/background.svg'
import logo from '../../assets/img/logo.png'
import credits from '../../assets/img/credits.svg'
import upDoneSound from '../../assets/sounds/updone.ogg'
import { useState } from 'react'
import Intro from '../Intro'

function WelcomeScreen({
  showRestrictedControls,
  startEditing,
  setChallengeExplainerVisible,
  challengeExplainerVisible,
  startChallenge,
  isIntro,
  setIsIntro,
  waitsForInput,
  setWaitsForInput
}) {
  const runsInElectron = navigator.userAgent.toLowerCase().includes('electron')

  if (waitsForInput && !runsInElectron) {
    return (
      <div
        className="w-full h-full flex items-center justify-center bg-black"
        onClick={() => setWaitsForInput(false)}
      >
        <div className='w-48 h-48 flex items-center justify-center bg-[#FFFFFF45] rounded-full hover:bg-[#FFFFFF77] transition-colors cursor-pointer active:bg-[#FFFFFF99]'>
          <PlayIcon size={128} fill='white' stroke='none' />
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center bg-black"
    // onClick={() => startEditing()}
    >
      {!runsInElectron && (
        <AnimatePresence>
          {isIntro &&
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 99999999,
                width: '100%',
                height: '100%',
                backgroundColor: 'black'
              }}
            >
              <Intro onEnd={() => setIsIntro(false)} />
            </div>
          }
        </AnimatePresence>
      )}

      <div
        className="flex flex-row gap-4 items-center justify-center"
        style={{
          position: 'absolute',
          zIndex: 20,
          bottom: 120
        }}
      >
        <motion.div
          initial={{ y: 400 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.2, delay: 0.1 }}
        >
          <Button tint="#12C958" onClick={() => startEditing()} customSound={upDoneSound}>
            <PlayIcon className="ts" size={32} fill="#FFF" />
            <p className="ts text-3xl font-semibold">Créer mon logo</p>
          </Button>
        </motion.div>

        <motion.div
          initial={{ y: 400 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.2, delay: 0.2 }}
        >
          <Button
            tint="#D946EF"
            onClick={() => setChallengeExplainerVisible(true)}
            customSound={upDoneSound}
          >
            <Timer className="ts" size={32} />
            <p className="ts text-3xl font-semibold">Mode Challenge</p>
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {challengeExplainerVisible && (
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
            <div className="p-10 rounded-3xl w-326 flex flex-col gap-4 items-center">
              <Timer size={64} className="text-[#D946EF] mb-2" />
              <p className="ts text-5xl text-center font-semibold">Mode Challenge</p>
              <p className="ts text-3xl text-center mb-4">
                Vous avez 3 minutes pour réaliser le meilleur logo possible !<br />
                Une fois le temps écoulé, le logo est automatiquement terminé.
              </p>

              <div className="flex flex-row items-center justify-center w-full gap-4 mt-2">
                <Button onClick={() => setChallengeExplainerVisible(false)}>
                  <p className="ts text-3xl font-semibold">Annuler</p>
                </Button>
                <Button tint={'#D946EF'} onClick={() => startChallenge()}>
                  <p className="ts text-3xl font-semibold">C&apos;est parti !</p>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          objectFit: 'cover',
          zIndex: 9999,
          backgroundColor: 'black',
          pointerEvents: 'none'
        }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />

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
        <span className="font-semibold">© 2026 IUT de Lannion — Département MMI — SAÉ 3.ALT</span>
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

      <motion.img
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 1, bounce: 0.5 }}
        src={logo}
        style={{
          position: 'absolute',
          zIndex: 2,
          height: 300,
          filter: 'drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.5))'
        }}
      />

      {runsInElectron || !isIntro && (
        <motion.img
          src={background}
          alt=""
          style={{
            position: 'absolute',
            zIndex: 1
          }}
          className="ctl-rotateForever"
        />
      )}
    </div>
  )
}

export default WelcomeScreen
