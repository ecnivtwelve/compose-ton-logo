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

export function ContentRenderer({ document, animated = true, simplified = false }) {
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
          {document.map((layer) => {
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
                    maxWidth: '550px',
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
                  style={{
                    position: 'absolute',
                    transform: `scaleX(${layer.width / 100}) rotate(${layer.rotation ?? 0}deg) translateX(${layer.x ?? 0}px) translateY(${layer.y ?? 0}px)`
                  }}
                >
                  {animated ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.7, duration: 0.7 }}
                        key={layer.font}
                      >
                        {textElement}
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    textElement
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
                  style={{
                    transform: `rotate(${layer.rotation ?? 0}deg) translateX(${layer.x ?? 0}px) translateY(${layer.y ?? 0}px)`,
                    position: 'absolute'
                  }}
                >
                  {animated ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.7, duration: 0.7 }}
                        key={layer.symbol.name}
                      >
                        {iconElement}
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    iconElement
                  )}
                </div>
              )
            } else if (layer.type == 'background') {
              const filename = layer.pattern ? layer.pattern.split('/').pop() : null
              const pattern = filename ? patternsByFilename[filename] : null

              return (
                <React.Fragment key={layer.id}>
                  <div
                    style={{
                      borderRadius: layer.radius,
                      width: layer.size,
                      height: layer.size,
                      background: layer.gradient
                        ? `linear-gradient(${layer.gradientDirection ?? 0}deg, ${layer.color}, ${layer.color2 ?? '#ffffff'})`
                        : layer.color,
                      position: 'absolute',
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
                </React.Fragment>
              )
            }
          })}
        </div>
      </div>
    </>
  )
}
