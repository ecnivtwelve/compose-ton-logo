import background from '../assets/img/background.svg'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useState } from 'react'
import introVideo from '../assets/video/intro.webm'
import ctlRev from '../assets/video/ctl_REV.webm'
import { useRef } from 'react'

const Intro = ({ onEnd }) => {
  const [hasIntroStarted, setHasIntroStarted] = useState(false)

  const ctlRevRef = useRef()
  const introVideoRef = useRef()

  const hasStarted = useRef(false)
  const timeouts = useRef([])

  const handlePlay = () => {
    if (hasStarted.current) return
    hasStarted.current = true

    const t1 = setTimeout(() => {
      setHasIntroStarted(true)
    }, 3000)
    const t2 = setTimeout(() => {
      introVideoRef.current?.play()
    }, 4500)
    const t3 = setTimeout(() => {
      // setIsStartButtonVisible(true)
    }, 9000)
    const t4 = setTimeout(() => {
      onEnd()
    }, 15000)

    timeouts.current = [t1, t2, t3, t4]
  }

  useEffect(() => {
    ctlRevRef.current?.play()?.catch(() => { })
    return () => {
      timeouts.current.forEach(clearTimeout)
    }
  }, [])

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center bg-black"
      onClick={onEnd}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <video
        ref={ctlRevRef}
        src={ctlRev}
        onPlaying={handlePlay}
        style={{
          position: 'absolute',
          zIndex: 9,
          width: '100%',
          height: '100%',
          top: 0,
          left: 0
        }}
      />

      <video
        ref={introVideoRef}
        src={introVideo}
        style={{
          position: 'absolute',
          zIndex: 6,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          filter: 'drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.5))'
        }}
      />

      {hasIntroStarted && (
        <motion.img
          src={background}
          alt=""
          style={{
            position: 'absolute',
            zIndex: 1
          }}
          animate={{
            rotate: [0, 360],
            scale: [1.5]
          }}
          transition={{
            duration: 25,
            ease: 'linear',
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
      )}
    </motion.div>
  )
}

export default Intro
