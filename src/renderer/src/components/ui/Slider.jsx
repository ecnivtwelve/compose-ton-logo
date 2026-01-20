import { useState, useEffect, useRef } from 'react'
import scrollSound from '../../assets/sounds/scroll_2.ogg'

function Slider({ value, onChange, range, unit, defaultValue }) {
  const [min, max] = range || [0, 100]

  const [scrollLoop] = useState(() => {
    const audio = new Audio(scrollSound)
    audio.loop = true
    return audio
  })

  const stopTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      scrollLoop.pause()
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    }
  }, [scrollLoop])

  const handleReset = () => {
    if (defaultValue !== undefined) {
      onChange(defaultValue)
    }
  }

  return (
    <div className="flex items-center gap-6 w-full">
      <div className="relative flex-1 group">
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(e) => {
            onChange(parseInt(e.target.value))
          }}
          onDoubleClick={handleReset}
          className="relative w-full h-3 bg-black/50 rounded-full appearance-none cursor-pointer border border-white/10 active:cursor-grabbing"
          style={{
            WebkitAppearance: 'none'
          }}
        />
      </div>
      <div
        className="ctl-pressable ctl-bw px-5 py-2 rounded-2xl min-w-[100px] flex justify-center items-center shadow-lg bg-white/5 backdrop-blur-sm"
        onClick={handleReset}
      >
        <span className="ts text-2xl font-bold">{value}</span>
        <span className="ts text-sm font-medium opacity-60 ml-1 mt-1">{unit}</span>
      </div>
    </div>
  )
}

export default Slider
