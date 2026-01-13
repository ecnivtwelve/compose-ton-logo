import popSound from '../assets/sounds/pop.mp3'

const Button = ({ children, tint, onClick, ...extraProps }) => {
  const playButtonSound = () => {
    const buttonSound = new Audio(popSound)
    buttonSound.play()
  }

  const handlePress = () => {
    onClick && onClick()
  }

  return (
    <div
      {...extraProps}
      className={'ctl-pressable ctl-button ' + extraProps.className}
      style={{ '--tint': tint, ...extraProps.style }}
      onClick={handlePress}
      onPointerUp={playButtonSound}
    >
      {children}
    </div>
  )
}

export default Button
