import React, { useRef, useEffect } from 'react'

import { Player } from '@lottiefiles/react-lottie-player'
import sparksLottie from '../assets/lottie/sparks.json'
import { motion, AnimatePresence } from 'motion/react'

function ContentPreview({ document }) {
  console.log(document)
  const playerRef = useRef(null)
  const isFirstRender = useRef(true)
  const prevFingerprintRef = useRef('')

  const bigThingsFingerprint = JSON.stringify(
    document.map((l) => ({ id: l.id, font: l.font, symbolName: l.symbol?.name }))
  )

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      prevFingerprintRef.current = bigThingsFingerprint
      return
    }

    const prevFingerprint = JSON.parse(prevFingerprintRef.current || '[]')
    const currentFingerprint = JSON.parse(bigThingsFingerprint)

    const hasFontOrSymbolChanged = currentFingerprint.some((curr) => {
      const prev = prevFingerprint.find((p) => p.id === curr.id)
      if (!prev) return false
      return curr.font !== prev.font || curr.symbolName !== prev.symbolName
    })

    if (hasFontOrSymbolChanged) {
      if (playerRef.current) {
        playerRef.current.stop()
        playerRef.current.play()
      }
    }

    prevFingerprintRef.current = bigThingsFingerprint
  }, [bigThingsFingerprint])
  return (
    <>
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden position-relative"
        style={{
          pointerEvents: 'none'
        }}
      >
        <Player
          ref={playerRef}
          autoplay={false}
          loop={false}
          controls={false}
          src={sparksLottie}
          style={{ height: '1000px', width: '1000px', position: 'absolute', top: 220, right: -150 }}
        ></Player>

        <ContentRenderer document={document} />
      </div>
    </>
  )
}

function ContentRenderer({ document }) {
  return (
    <>
      <div
        className="w-full h-full flex flex-col items-center justify-center position-relative overflow-hidden"
        style={{
          // mask all borders
          maskImage:
            'linear-gradient(0deg, rgba(255, 255, 255, 0.00) 0%, #FFF 20%, #FFF 80.29%, rgba(255, 255, 255, 0.00) 100%)'
        }}
      >
        <div
          className="w-full h-full flex flex-col items-center justify-center position-relative overflow-hidden"
          style={{
            // mask all borders
            maskImage:
              'linear-gradient(270deg, rgba(255, 255, 255, 0.00) 0%, #FFF 20%, #FFF 80.29%, rgba(255, 255, 255, 0.00) 100%)'
          }}
        >
          {document.map((layer) => {
            if (layer.type == 'text') {
              return (
                <React.Fragment key={layer.id}>
                  <div
                    style={{
                      position: 'absolute',
                      transform: `scaleX(${layer.width / 100}) rotate(${layer.rotation ?? 0}deg) translateX(${layer.x ?? 0}px) translateY(${layer.y ?? 0}px)`
                    }}
                  >
                    <AnimatePresence>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.7, duration: 0.7 }}
                        key={layer.font}
                      >
                        <p
                          style={{
                            fontFamily: layer.font ?? '',
                            color: layer.textColor ?? '#fff',
                            fontSize: layer.size ? `${layer.size}px` : '48px',
                            filter: `drop-shadow(0px 0px ${layer.shadow}px rgba(0, 0, 0, 0.8))`,
                            letterSpacing: `${layer.letterSpacing / 1000}em`,
                            maxWidth: '100%',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            textAlign: 'center',
                            WebkitTextStrokeWidth: `${layer.border}px`,
                            WebkitTextStrokeColor: '#000',
                            lineHeight: layer.size ? `${layer.size}px` : '48px'
                          }}
                        >
                          {layer.content}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </React.Fragment>
              )
            } else if (layer.type == 'symbols') {
              const Icon = layer.symbol.svg
              return (
                <React.Fragment key={layer.id}>
                  <div
                    style={{
                      transform: `rotate(${layer.rotation ?? 0}deg) translateX(${layer.x ?? 0}px) translateY(${layer.y ?? 0}px)`,
                      position: 'absolute'
                    }}
                  >
                    <AnimatePresence>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.7, duration: 0.7 }}
                        key={layer.symbol.name}
                      >
                        <Icon
                          width={layer.size}
                          height={layer.size}
                          fill={layer.color}
                          strokeWidth={layer.border / 10}
                          stroke="#000"
                          style={{
                            filter: `drop-shadow(0px 0px ${layer.shadow}px rgba(0, 0, 0, 0.8))`,
                            overflow: 'visible'
                          }}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </React.Fragment>
              )
            }
          })}
        </div>
      </div>
    </>
  )
}

export default ContentPreview
