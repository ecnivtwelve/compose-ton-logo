import { useRef, useEffect, useState } from 'react'

import { Player } from '@lottiefiles/react-lottie-player'
import sparksLottie from '../assets/lottie/sparks.json'
import { ContentRenderer } from '../components/ContentRenderer'

export { ContentRenderer }

function ContentPreview({ document, setDocument, setLayer, setTab, interactive = true }) {
  const playerRef = useRef(null)
  const isFirstRender = useRef(true)
  const prevFingerprintRef = useRef('')
  const previewRef = useRef(null)
  const dragRef = useRef(null)
  const resizeRef = useRef(null)
  const rotateRef = useRef(null)
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

    const {
      index,
      pointerId,
      startX,
      startY,
      originX,
      originY,
      minDeltaX,
      maxDeltaX,
      minDeltaY,
      maxDeltaY
    } = dragRef.current
    if (event.pointerId !== pointerId) return
    const rawDeltaX = event.clientX - startX
    const rawDeltaY = event.clientY - startY
    const deltaX = clamp(rawDeltaX, minDeltaX, maxDeltaX)
    const deltaY = clamp(rawDeltaY, minDeltaY, maxDeltaY)

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

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  function handleResizePointerMove(event) {
    if (!resizeRef.current) return

    const { index, handle, pointerId, startX, startY, originSize } = resizeRef.current
    if (event.pointerId !== pointerId) return
    const deltaX = event.clientX - startX
    const deltaY = event.clientY - startY
    const horizontalDelta = handle.includes('e') ? deltaX : handle.includes('w') ? -deltaX : 0
    const verticalDelta = handle.includes('s') ? deltaY : handle.includes('n') ? -deltaY : 0

    setDocument((prev) => {
      const current = prev[index]
      if (!current) return prev

      let nextLayer = current

      if (current.type === 'text') {
        let nextSize = current.size ?? originSize
        const majorDelta =
          horizontalDelta !== 0 && verticalDelta !== 0
            ? (horizontalDelta + verticalDelta) / 2
            : horizontalDelta !== 0
              ? horizontalDelta
              : verticalDelta
        const scale = Math.max(0.2, 1 + majorDelta / 200)
        nextSize = clamp(Math.round(originSize * scale), 32, 420)

        if ((current.size ?? 64) === nextSize) return prev
        nextLayer = { ...current, size: nextSize }
      } else if (current.type === 'symbols') {
        const majorDelta =
          horizontalDelta !== 0 && verticalDelta !== 0
            ? (horizontalDelta + verticalDelta) / 2
            : horizontalDelta !== 0
              ? horizontalDelta
              : verticalDelta
        const scale = Math.max(0.2, 1 + majorDelta / 200)
        const nextSize = clamp(Math.round(originSize * scale), 50, 600)

        if ((current.size ?? originSize) === nextSize) return prev
        nextLayer = {
          ...current,
          size: nextSize
        }
      }

      const updated = [...prev]
      updated[index] = nextLayer
      return updated
    })
  }

  function handleRotatePointerMove(event) {
    if (!rotateRef.current) return

    const { index, pointerId, originRotation, centerX, centerY, startAngle } = rotateRef.current
    if (event.pointerId !== pointerId) return

    const currentAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX)
    const deltaAngle = ((currentAngle - startAngle) * 180) / Math.PI
    const normalizedRotation = Math.round((((originRotation + deltaAngle) % 360) + 360) % 360)

    setDocument((prev) => {
      const current = prev[index]
      if (!current || current.type === 'background') return prev
      if ((current.rotation ?? 0) === normalizedRotation) return prev

      const updated = [...prev]
      updated[index] = {
        ...current,
        rotation: normalizedRotation
      }
      return updated
    })
  }

  function handlePointerUp(event) {
    if (event && dragRef.current?.pointerId !== event.pointerId) return
    if (dragRef.current?.target?.releasePointerCapture && dragRef.current.pointerId !== undefined) {
      try {
        dragRef.current.target.releasePointerCapture(dragRef.current.pointerId)
      } catch (error) {
        void error
      }
    }
    dragRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('pointercancel', handlePointerUp)
  }

  function handleResizePointerUp(event) {
    if (event && resizeRef.current?.pointerId !== event.pointerId) return
    if (
      resizeRef.current?.target?.releasePointerCapture &&
      resizeRef.current.pointerId !== undefined
    ) {
      try {
        resizeRef.current.target.releasePointerCapture(resizeRef.current.pointerId)
      } catch (error) {
        void error
      }
    }
    resizeRef.current = null
    window.removeEventListener('pointermove', handleResizePointerMove)
    window.removeEventListener('pointerup', handleResizePointerUp)
    window.removeEventListener('pointercancel', handleResizePointerUp)
  }

  function handleRotatePointerUp(event) {
    if (event && rotateRef.current?.pointerId !== event.pointerId) return
    if (
      rotateRef.current?.target?.releasePointerCapture &&
      rotateRef.current.pointerId !== undefined
    ) {
      try {
        rotateRef.current.target.releasePointerCapture(rotateRef.current.pointerId)
      } catch (error) {
        void error
      }
    }
    rotateRef.current = null
    window.removeEventListener('pointermove', handleRotatePointerMove)
    window.removeEventListener('pointerup', handleRotatePointerUp)
    window.removeEventListener('pointercancel', handleRotatePointerUp)
  }

  const handleLayerPointerDown = (event, item, index) => {
    if (!interactive) return

    setPreviewSelectedLayerIndex(index)
    setLayer(index)
    setTab(item.type)
    handleResizePointerUp()
    handleRotatePointerUp()

    if (item.type === 'background' || event.button !== 0) return

    event.preventDefault()
    event.stopPropagation()
    const layerElement = event.currentTarget
    const previewElement = previewRef.current
    const layerRect = layerElement.getBoundingClientRect()
    const previewRect = previewElement?.getBoundingClientRect()
    const minDeltaX = previewRect ? previewRect.left - layerRect.left : Number.NEGATIVE_INFINITY
    const maxDeltaX = previewRect ? previewRect.right - layerRect.right : Number.POSITIVE_INFINITY
    const minDeltaY = previewRect ? previewRect.top - layerRect.top : Number.NEGATIVE_INFINITY
    const maxDeltaY = previewRect ? previewRect.bottom - layerRect.bottom : Number.POSITIVE_INFINITY
    if (layerElement.setPointerCapture && event.pointerId !== undefined) {
      try {
        layerElement.setPointerCapture(event.pointerId)
      } catch (error) {
        void error
      }
    }

    dragRef.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x ?? 0,
      originY: item.y ?? 0,
      minDeltaX,
      maxDeltaX,
      minDeltaY,
      maxDeltaY,
      target: layerElement
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  const handleResizeHandlePointerDown = (event, item, index, handle) => {
    if (!interactive || event.button !== 0) return
    if (item.type === 'background') return

    setPreviewSelectedLayerIndex(index)
    setLayer(index)
    setTab(item.type)
    handlePointerUp()
    handleRotatePointerUp()
    event.preventDefault()
    event.stopPropagation()
    const handleElement = event.currentTarget
    if (handleElement.setPointerCapture && event.pointerId !== undefined) {
      try {
        handleElement.setPointerCapture(event.pointerId)
      } catch (error) {
        void error
      }
    }

    resizeRef.current = {
      index,
      handle,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originSize: item.size ?? (item.type === 'text' ? 64 : 200),
      target: handleElement
    }

    window.addEventListener('pointermove', handleResizePointerMove)
    window.addEventListener('pointerup', handleResizePointerUp)
    window.addEventListener('pointercancel', handleResizePointerUp)
  }

  const handleRotateHandlePointerDown = (event, item, index) => {
    if (!interactive || event.button !== 0) return
    if (item.type === 'background') return

    setPreviewSelectedLayerIndex(index)
    setLayer(index)
    setTab(item.type)
    handlePointerUp()
    handleResizePointerUp()
    event.preventDefault()
    event.stopPropagation()
    const rotateHandleElement = event.currentTarget
    const layerElement = rotateHandleElement.closest('[data-preview-layer="true"]')
    if (!layerElement) return
    const layerRect = layerElement.getBoundingClientRect()
    const centerX = layerRect.left + layerRect.width / 2
    const centerY = layerRect.top + layerRect.height / 2
    const startAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX)

    if (rotateHandleElement.setPointerCapture && event.pointerId !== undefined) {
      try {
        rotateHandleElement.setPointerCapture(event.pointerId)
      } catch (error) {
        void error
      }
    }

    rotateRef.current = {
      index,
      pointerId: event.pointerId,
      originRotation: item.rotation ?? 0,
      centerX,
      centerY,
      startAngle,
      target: rotateHandleElement
    }

    window.addEventListener('pointermove', handleRotatePointerMove)
    window.addEventListener('pointerup', handleRotatePointerUp)
    window.addEventListener('pointercancel', handleRotatePointerUp)
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
        ref={previewRef}
        className="w-full h-full flex items-center justify-center overflow-hidden position-relative"
        style={{ touchAction: 'none' }}
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
          onResizeHandlePointerDown={handleResizeHandlePointerDown}
          onRotateHandlePointerDown={handleRotateHandlePointerDown}
        />
      </div>
    </>
  )
}

export default ContentPreview
