import popSound from '../../assets/sounds/pop.mp3'

function ColorSelector({ currentColor, onColorSelect }) {
  const colors = [
    '#FF3E11',
    '#FFD700',
    '#ADFF2F',
    '#00FF7F',
    '#00E5FF',
    '#BF00FF',
    '#FFFFFF',
    '#813f0c',
    '#fff6a1',
    '#acb70e',
    '#18aa02',
    '#427ae3',
    '#e64490',
    '#000000'
  ]

  const playButtonSound = () => {
    const buttonSound = new Audio(popSound)
    buttonSound.play()
  }

  return (
    <div className="grid gap-2 grid-cols-7 w-full">
      {colors.map((color, i) => (
        <div
          key={i}
          className={`ctl-pressable ctl-button p-2 h-18 rounded-2xl flex flex-column items-center justify-center ${currentColor == color ? 'ctl-selected' : ''}`}
          style={{
            '--tint': color
          }}
          onClick={() => {
            playButtonSound()
            onColorSelect(color)
          }}
        ></div>
      ))}
    </div>
  )
}

export default ColorSelector
