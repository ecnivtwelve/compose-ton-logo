const Button = ({ children, tint, onClick, ...extraProps }) => {
  const playButtonSound = () => {
    const buttonSound = new Audio('/sounds/pop.mp3')
    buttonSound.play()
  }

  const handlePress = () => {
    onClick && onClick()
    playButtonSound()
  }

  return (
    <div {...extraProps} className="ctl-pressable ctl-button" style={{ '--tint': tint }} onClick={handlePress}>
      {children}
    </div>
  )
}

export default Button
