import hitSound from '../../assets/sounds/hit.mp3'

function FontSelector({ text = 'Texte', currentFont, onFontSelect }) {
  const fonts = [
    'Impact',
    'Comic Sans MS',
    'Aleo',
    'Limelight',
    'Arial Black',
    'LeckerliOne',
    'Audiowide',
    'FasterOne',
    'Ribeye',
    'Archivo',
    'MetalMania',
    'Micro5',
    'UniRennes',
    'AuBordDeLaSeine',
    'Bright',
    'ChocolateAdventure'
  ]

  const playButtonSound = () => {
    const buttonSound = new Audio(hitSound)
    buttonSound.play()
  }

  return (
    <div className="grid gap-4 grid-cols-4 w-full">
      {fonts.map((font, i) => (
        <div
          key={i}
          className={`ctl-pressable ctl-button p-2 h-18 rounded-2xl flex flex-column items-center justify-center ${currentFont == font ? 'ctl-selected' : ''}`}
          style={{
            '--tint': currentFont == font ? 'var(--primary)' : undefined
          }}
          onClick={() => {
            playButtonSound()
            onFontSelect(font)
          }}
        >
          <p
            className="ts text-4xl text-center"
            style={{
              fontFamily: font
            }}
          >
            {text}
          </p>
        </div>
      ))}
    </div>
  )
}

export default FontSelector
