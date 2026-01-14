import React, { useMemo } from 'react'
import { ContentRenderer } from '../editors/ContentPreview'
import { AnimatePresence, motion } from 'motion/react'
import './LogoGallery.css'

const LogoItem = React.memo(function LogoItem({ logo }) {
  return (
    <div
      style={{
        width: '300px',
        height: '300px',
        margin: '20px',
        flexShrink: 0,
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        scale: 1.6,
        filter: 'drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.5))',
        // Performance hints
        willChange: 'transform',
        contain: 'layout style paint'
      }}
    >
      <div
        style={{
          transform: 'scale(0.3)',
          width: '333%',
          height: '333%',
          transformOrigin: 'top left'
        }}
      >
        <ContentRenderer document={logo} animated={false} simplified={true} />
      </div>
    </div>
  )
})

function MarqueeRow({ logos, direction = 1, speed = 1 }) {
  // We need enough logos to fill the screen and loop seamlessly.
  // Instead of useAnimationFrame, we use CSS animations for much better performance.

  // Calculate duration based on speed and number of items
  // Base speed: 1 unit = 30 seconds for a full loop of the logos
  const duration = (logos.length * 5) / speed
  const animationName = direction > 0 ? 'scroll-right' : 'scroll-left'

  return (
    <div className="marquee-container">
      <div
        className="marquee-content"
        style={{
          animationDuration: `${duration}s`,
          animationName: animationName
        }}
      >
        {[0, 1].map((setIndex) => (
          <React.Fragment key={setIndex}>
            {logos.map((logo, i) => (
              <LogoItem key={`${setIndex}-${i}`} logo={logo} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default function LogoGallery({ logos }) {
  // Memoize the rows to prevent re-rendering when new logos are added,
  // until we actually want to update the gallery.
  // Actually, we want to update when logos changed, but we want it to be efficient.

  const displayLogos = useMemo(() => {
    if (!logos || logos.length === 0) return []

    let items = [...logos]
    // Ensure we have enough items to cover the screen (at least 20)
    // 20 * 340px = 6800px, which is plenty for 4k/Ultrawide
    while (items.length > 0 && items.length < 20) {
      items = [...items, ...logos]
    }
    return items
  }, [logos])

  if (displayLogos.length === 0) return null

  return (
    <div className="gallery-wrapper">
      <AnimatePresence mode="wait">
        <motion.div
          key={logos.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="gallery-rows"
        >
          <MarqueeRow logos={displayLogos} speed={0.4} direction={-1} />
          <MarqueeRow logos={displayLogos} speed={0.6} direction={1} />
          <MarqueeRow logos={displayLogos} speed={0.5} direction={-1} />
          <MarqueeRow logos={displayLogos} speed={0.3} direction={1} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
