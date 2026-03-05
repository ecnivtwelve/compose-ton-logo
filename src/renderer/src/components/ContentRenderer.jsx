import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { symbols } from '../utils/symbols'

const allPatterns = import.meta.glob('../assets/img/patterns/*.png', {
  eager: true,
  query: '?url'
})

// Create a lookup map by filename to handle relative path differences
const patternsByFilename = {}
Object.keys(allPatterns).forEach((key) => {
  const filename = key.split('/').pop()
  patternsByFilename[filename] = allPatterns[key]
})

export function ContentRenderer({
  document,
  animated = true,
  simplified = false,
  selectedLayerIndex = null,
  editable = false,
  onLayerPointerDown,
  onResizeHandlePointerDown,
  onRotateHandlePointerDown
}) {
  const renderLayerFrame = (layer, index, child, options = {}) => {
    const selectable = options.selectable ?? true
    const isSelected = selectable && editable && selectedLayerIndex === index
    const padding = options.padding ?? 8
    const borderRadius = options.borderRadius ?? 12
    const cursor = options.cursor ?? (editable ? 'grab' : 'default')
    const handles = [
      { key: 'nw', left: -6, top: -6, cursor: 'nwse-resize' },
      { key: 'n', left: '50%', top: -6, transform: 'translateX(-50%)', cursor: 'ns-resize' },
      { key: 'ne', right: -6, top: -6, cursor: 'nesw-resize' },
      { key: 'e', right: -6, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' },
      { key: 'se', right: -6, bottom: -6, cursor: 'nwse-resize' },
      { key: 's', left: '50%', bottom: -6, transform: 'translateX(-50%)', cursor: 'ns-resize' },
      { key: 'sw', left: -6, bottom: -6, cursor: 'nesw-resize' },
      { key: 'w', left: -6, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }
    ]

    return (
      <div
        style={{
          border: isSelected ? '4px solid var(--primary)' : '2px solid transparent',
          borderRadius,
          padding,
          cursor,
          userSelect: 'none',
          touchAction: 'none',
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        {child}
        {isSelected &&
          handles.map((handle) => (
            <button
              key={`${layer.id}-${handle.key}`}
              type="button"
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onResizeHandlePointerDown?.(event, layer, index, handle.key)
              }}
              style={{
                position: 'absolute',
                width: 12,
                height: 12,
                borderRadius: 999,
                border: '2px solid var(--primary)',
                background: '#fff',
                padding: 0,
                zIndex: 10,
                zoom: 2,
                touchAction: 'none',
                ...handle
              }}
            />
          ))}
        {isSelected && (
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onRotateHandlePointerDown?.(event, layer, index)
            }}
            style={{
              position: 'absolute',
              left: '50%',
              top: -26,
              width: 14,
              height: 14,
              borderRadius: 999,
              border: '2px solid #0099FF',
              background: '#fff',
              padding: 0,
              zIndex: 11,
              zoom: 1.5,
              transform: 'translateX(-50%)',
              cursor: 'grab',
              touchAction: 'none'
            }}
          />
        )}
      </div>
    )
  }

  return (
    <>
      <div
        className="w-full h-full flex flex-col items-center justify-center position-relative overflow-hidden"
        style={{
          // mask all borders
          maskImage: !simplified
            ? 'linear-gradient(0deg, rgba(255, 255, 255, 0.00) 0%, #FFF 10%, #FFF 90%, rgba(255, 255, 255, 0.00) 100%)'
            : 'none',
          maxWidth: 700
        }}
      >
        <div
          className="w-full h-full flex flex-col items-center justify-center position-relative overflow-hidden"
          style={{
            // mask all borders
            maskImage: !simplified
              ? 'linear-gradient(270deg, rgba(255, 255, 255, 0.00) 0%, #FFF 10%, #FFF 90%, rgba(255, 255, 255, 0.00) 100%)'
              : 'none'
          }}
        >
          {document.map((layer, index) => {
            if (layer.type == 'text') {
              const textElement = (
                <p
                  style={{
                    fontFamily: layer.font ?? '',
                    color: layer.textColor ?? '#fff',
                    fontSize: layer.size ? `${layer.size}px` : '48px',
                    filter: !simplified
                      ? `drop-shadow(0px 0px ${layer.shadow}px rgba(0, 0, 0, 0.8))`
                      : 'none',
                    letterSpacing: `${layer.letterSpacing / 1000}em`,
                    maxWidth: '570px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    textAlign: 'center',
                    WebkitTextStrokeWidth: `${layer.border}px`,
                    WebkitTextStrokeColor: '#000',
                    lineHeight: layer.size ? `${layer.size}px` : '48px',
                    opacity: layer.opacity / 100
                  }}
                >
                  {layer.content}
                </p>
              )

              return (
                <div
                  key={layer.id}
                  data-preview-layer="true"
                  style={{
                    position: 'absolute',
                    transform: `translateX(${layer.x ?? 0}px) translateY(${layer.y ?? 0}px) rotate(${layer.rotation ?? 0}deg) scaleX(${layer.width / 100})`,
                    pointerEvents: editable ? 'auto' : 'none',
                    touchAction: 'none'
                  }}
                  onPointerDown={(event) => onLayerPointerDown?.(event, layer, index)}
                >
                  {animated ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.7, duration: 0.7 }}
                        key={layer.font}
                      >
                        {renderLayerFrame(layer, index, textElement)}
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    renderLayerFrame(layer, index, textElement)
                  )}
                </div>
              )
            } else if (layer.type == 'symbols') {
              let Icon = layer.symbol.svg

              if (!Icon && layer.symbol.name) {
                const allSymbols = symbols.flatMap((c) => c.symbols)
                const found = allSymbols.find((s) => s.name === layer.symbol.name)
                if (found) {
                  Icon = found.svg
                }
              }

              if (!Icon) return null

              const iconElement = (
                <Icon
                  width={layer.size}
                  height={layer.size}
                  fill={layer.color}
                  strokeWidth={layer.border / 10}
                  stroke="#000"
                  style={{
                    filter: !simplified
                      ? `drop-shadow(0px 0px ${layer.shadow}px rgba(0, 0, 0, 0.8))`
                      : 'none',
                    overflow: 'visible',
                    opacity: layer.opacity / 100
                  }}
                />
              )
              return (
                <div
                  key={layer.id}
                  data-preview-layer="true"
                  style={{
                    transform: `translateX(${layer.x ?? 0}px) translateY(${layer.y ?? 0}px) rotate(${layer.rotation ?? 0}deg)`,
                    position: 'absolute',
                    pointerEvents: editable ? 'auto' : 'none',
                    touchAction: 'none'
                  }}
                  onPointerDown={(event) => onLayerPointerDown?.(event, layer, index)}
                >
                  {animated ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.7, duration: 0.7 }}
                        key={layer.symbol.name}
                      >
                        {renderLayerFrame(layer, index, iconElement)}
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    renderLayerFrame(layer, index, iconElement)
                  )}
                </div>
              )
            } else if (layer.type == 'background') {
              const filename = layer.pattern ? layer.pattern.split('/').pop() : null
              const pattern = filename ? patternsByFilename[filename] : null
              const backgroundElement = (
                <div
                  style={{
                    borderRadius: layer.radius,
                    width: layer.size,
                    height: layer.size,
                    background: layer.gradient
                      ? `linear-gradient(${layer.gradientDirection ?? 0}deg, ${layer.color}, ${layer.color2 ?? '#ffffff'})`
                      : layer.color,
                    visibility: layer.enabled ? 'visible' : 'hidden',
                    overflow: 'hidden'
                  }}
                >
                  {pattern && (
                    <img
                      src={pattern.default}
                      style={{
                        opacity: layer.patternOpacity / 100,
                        mixBlendMode: layer.blendModeEnabled ? layer.blendMode : undefined,
                        filter: layer.blendModeEnabled ? `saturate(0)` : undefined
                      }}
                    />
                  )}
                </div>
              )

              return (
                <React.Fragment key={layer.id}>
                  <div
                    data-preview-layer="true"
                    style={{
                      position: 'absolute',
                      pointerEvents: editable ? 'auto' : 'none'
                    }}
                    onPointerDown={(event) => onLayerPointerDown?.(event, layer, index)}
                  >
                    {renderLayerFrame(layer, index, backgroundElement, {
                      padding: 0,
                      borderRadius: layer.radius,
                      cursor: editable ? 'pointer' : 'default',
                      selectable: false
                    })}
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
