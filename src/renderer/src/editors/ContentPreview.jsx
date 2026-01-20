import { useRef, useEffect } from 'react'

import { Player } from '@lottiefiles/react-lottie-player'
import sparksLottie from '../assets/lottie/sparks.json'
import { ContentRenderer } from '../components/ContentRenderer'

export { ContentRenderer }

function ContentPreview({ document }) {
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

export default ContentPreview
