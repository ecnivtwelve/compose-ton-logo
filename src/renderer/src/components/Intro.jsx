import background from '../assets/img/background.svg'
import introVideo from '../assets/video/intro.webm'
import { motion } from 'motion/react'
import Typography from './Typography'
import Button from './Button'
import { useEffect } from 'react'
import { useState } from 'react'

const Intro = ({ onEnd }) => {
  const [isStartButtonVisible, setIsStartButtonVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setIsStartButtonVisible(true)
    }, 2000)
  }, [])

  return (
    <div className="w-full h-full flex items-center justify-center" onClick={onEnd}>
      <video
        src={introVideo}
        autoPlay
        style={{
          position: 'absolute',
          zIndex: -9,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          filter: 'drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.5))'
        }}
      />

      {isStartButtonVisible && (
        <Button
          style={{
            position: 'absolute',
            bottom: 80
          }}
          onClick={onEnd}
          tint={'var(--primary)'}
        >
          <Typography className="text-3xl font-semibold mx-3 my-1">Appuyez ici pour commencer</Typography>
        </Button>
      )}

      <motion.img
        src={background}
        alt=""
        style={{
          position: 'absolute',
          zIndex: -99
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
    </div>
  )
}

export default Intro
