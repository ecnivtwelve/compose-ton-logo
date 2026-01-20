import { CheckIcon, MinusIcon } from 'lucide-react'
import popSound from '../../assets/sounds/pop.mp3'

function Checkbox({ checked, onChange }) {
  return (
    <div
      className="ctl-pressable ctl-button w-16 h-12 p-0 rounded-4xl flex items-center justify-center"
      style={{
        '--tint': checked ? 'var(--primary)' : 'var(--secondary)'
      }}
      onClick={() => {
        const checkedSound = new Audio(popSound)
        checkedSound.play()
        onChange(!checked)
      }}
    >
      {checked ? (
        <CheckIcon color="#FFFFFF" size={30} strokeWidth={3} />
      ) : (
        <MinusIcon color="#FFFFFF" size={30} strokeWidth={3} />
      )}
    </div>
  )
}

export default Checkbox
