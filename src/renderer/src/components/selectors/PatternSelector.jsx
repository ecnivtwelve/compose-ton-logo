import hitSound from '../../assets/sounds/hit.mp3'

const allPatterns = import.meta.glob('../../assets/img/patterns/*.png', {
  eager: true,
  query: '?url'
})

function PatternSelector({ selectedPattern, setSelectedPattern }) {
  const patterns = Object.entries(allPatterns)

  return (
    <div className="grid gap-2 grid-cols-6 w-full">
      {patterns.map(([url, module]) => (
        <div
          className={`ctl-pressable ctl-button ctl-nopadding p-2 h-18 rounded-2xl flex flex-column items-center justify-center overflow-hidden relative ${selectedPattern === url ? 'ctl-selected' : ''}`}
          key={url}
          onClick={() => {
            const selectPatternSound = new Audio(hitSound)
            selectPatternSound.play()

            if (selectedPattern === url) {
              setSelectedPattern(null)
            } else {
              setSelectedPattern(url)
            }
          }}
        >
          <div className="w-full h-full absolute ctl-pressable z-200" />

          <img src={module.default} alt="" className="w-full h-full object-cover absolute" />
        </div>
      ))}
    </div>
  )
}

export default PatternSelector
