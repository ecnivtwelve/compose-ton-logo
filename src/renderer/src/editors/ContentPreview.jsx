import { useRef, useEffect, useState } from 'react'

import { Player } from '@lottiefiles/react-lottie-player'
import sparksLottie from '../assets/lottie/sparks.json'
import { ContentRenderer } from '../components/ContentRenderer'

export { ContentRenderer }

function ContentPreview({ document, setDocument, setLayer, setTab, interactive = true }) {
  const playerRef = useRef(null)
  const isFirstRender = useRef(true)
  const prevFingerprintRef = useRef('')
  const dragRef = useRef(null)
  const [previewSelectedLayerIndex, setPreviewSelectedLayerIndex] = useState(null)

  const bigThingsFingerprint = JSON.stringify(
    document.map((l) => ({ id: l.id, font: l.font, symbolName: l.symbol?.name }))
  )
  const activePreviewSelectedLayerIndex =
    interactive &&
    previewSelectedLayerIndex !== null &&
    previewSelectedLayerIndex >= 0 &&
    previewSelectedLayerIndex < document.length
      ? previewSelectedLayerIndex
      : null

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

  function handlePointerMove(event) {
    if (!dragRef.current) return

    const { index, startX, startY, originX, originY } = dragRef.current
    const deltaX = event.clientX - startX
    const deltaY = event.clientY - startY

    setDocument((prev) => {
      const current = prev[index]
      if (!current || current.type === 'background') return prev

      const nextX = Math.round(originX + deltaX)
      const nextY = Math.round(originY + deltaY)

      if ((current.x ?? 0) === nextX && (current.y ?? 0) === nextY) return prev

      const updated = [...prev]
      updated[index] = {
        ...current,
        x: nextX,
        y: nextY
      }
      return updated
    })
  }

  function handlePointerUp() {
    dragRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  const handleLayerPointerDown = (event, item, index) => {
    if (!interactive) return

    setPreviewSelectedLayerIndex(index)
    setLayer(index)
    setTab(item.type)

    if (item.type === 'background' || event.button !== 0) return

    event.preventDefault()

    dragRef.current = {
      index,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x ?? 0,
      originY: item.y ?? 0
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handlePreviewPointerDown = (event) => {
    if (!interactive) return

    const target = event.target
    if (!(target instanceof Element)) return
    if (!target.closest('[data-preview-layer="true"]')) {
      setPreviewSelectedLayerIndex(null)
    }
  }

  return (
    <>
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden position-relative"
        onPointerDown={handlePreviewPointerDown}
      >
        <Player
          ref={playerRef}
          autoplay={false}
          loop={false}
          controls={false}
          src={sparksLottie}
          style={{
            height: '1000px',
            width: '1000px',
            position: 'absolute',
            top: 220,
            right: -150,
            pointerEvents: 'none'
          }}
        ></Player>

        <ContentRenderer
          document={document}
          editable={interactive}
          selectedLayerIndex={activePreviewSelectedLayerIndex}
          onLayerPointerDown={handleLayerPointerDown}
        />
      </div>
    </>
  )
}

export default ContentPreview
