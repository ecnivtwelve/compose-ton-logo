import { useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'motion/react'
import { ContentRenderer } from '../editors/ContentPreview'

function LogoItem({ logo }) {
  return (
    <div
      style={{
        width: '300px',
        height: '300px',
        margin: '20px',
        flexShrink: 0,
        borderRadius: '20px',
        background: 'white',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
        scale: 0.8
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
}

function MarqueeRow({ logos, direction = 1, speed = 1 }) {
  // eslint-disable-next-line no-unused-vars
  const containerRef = useRef(null)
  const x = useMotionValue(0)

  // Debug logging
  console.log('MarqueeRow logos length:', logos.length)

  useAnimationFrame((t, delta) => {
    let moveBy = direction * speed * (delta / 16)

    if (moveBy < 0) {
      // moving left
      if (x.get() <= -340 * logos.length) {
        // 300px width + 40px margin
        x.set(0)
      }
    } else {
      // moving right
      if (x.get() >= 0) {
        x.set(-340 * logos.length)
      }
    }

    x.set(x.get() + moveBy)
  })

  // We need to duplicate logos to fill the screen and create seamless loop
  // For safety, let's just render the list 4 times which should be enough for 4k screens with small logos
  const renderLogos = [...logos, ...logos, ...logos, ...logos]

  return (
    <div style={{ overflow: 'hidden', display: 'flex', width: '100%' }}>
      <motion.div style={{ x, display: 'flex' }}>
        {renderLogos.map((logo, i) => (
          <LogoItem key={i} logo={logo} />
        ))}
      </motion.div>
    </div>
  )
}

export default function LogoGallery({ logos }) {
  console.log('LogoGallery render, logos length:', logos?.length)
  if (!logos || logos.length === 0) return null

  // Split logos into rows if there are many, or just repeat them
  // For simplicity and "wall" effect, let's create a few rows with different speeds/directions

  // If we don't have many logos yet, repeat the ones we have to make it look full
  let displayLogos = logos
  // Only duplicate if we have fewer than 20 items to ensure marquee is filled
  // But also limit total items to avoid performance issues if we have 100+
  // If we have 100+ items, we don't need to duplicate.
  if (displayLogos.length < 20) {
    while (displayLogos.length < 20 && displayLogos.length > 0) {
      displayLogos = [...displayLogos, ...logos]
    }
  } else {
    // If we have many logos, just use them as is, ensuring we have enough to fill screen width
    // But since MarqueeRow loops, we need to ensure seamless loop.
    // The simple MarqueeRow implementation below resets when x < -width.
    // For seamless loop, we might need at least one full width of duplication?
    // Let's just append the first 10 items to the end to cover the reset gap.
    displayLogos = [...logos, ...logos.slice(0, 10)]
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '20px',
        opacity: 0.3,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: '#f5f5f5' // light gray background for better contrast
      }}
    >
      <MarqueeRow logos={displayLogos} speed={0.5} direction={-1} />
      <MarqueeRow logos={displayLogos} speed={0.8} direction={1} />
      <MarqueeRow logos={displayLogos} speed={0.6} direction={-1} />
      <MarqueeRow logos={displayLogos} speed={0.4} direction={1} />
    </div>
  )
}
