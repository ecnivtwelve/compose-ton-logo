import popSound from '../assets/sounds/pop.mp3'

const Button = ({ children, tint, onClick, customSound, ...extraProps }) => {
  const playButtonSound = () => {
    const buttonSound = new Audio(customSound || popSound)
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
