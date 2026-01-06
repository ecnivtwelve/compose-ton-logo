import { useEffect, useState } from 'react'

export default function ScaleContainer({ children }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const handleResize = () => {
      const targetWidth = 1920
      const targetHeight = 1080
      const width = window.innerWidth
      const height = window.innerHeight

      const scale = Math.min(width / targetWidth, height / targetHeight)
      setScale(scale)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      id="app"
      style={{
        transform: `translate(-50%, -50%) scale(${scale})`,
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  )
}
