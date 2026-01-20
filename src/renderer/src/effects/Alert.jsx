import Button from '../components/Button'
import confirmSound from '../assets/sounds/confirm.mp3'
import { useEffect } from 'react'

import { motion, AnimatePresence } from 'motion/react'

function Alert({
  visible,
  title = 'Êtes-vous sûr ?',
  message = 'Voulez-vous vraiment supprimer ce logo ?',
  onConfirm,
  onCancel,
  confirmText = 'Supprimer',
  confirmTint = '#C52E2E',
  cancelTint = null,
  cancelText = 'Annuler',
  hideCancel = false,
  customSound
}) {
  useEffect(() => {
    const audio = new Audio(customSound || confirmSound)
    if (visible) audio.play()
  }, [visible, customSound])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99999,
            backdropFilter: 'blur(5px)'
          }}
          initial={{ opacity: 0, scale: 1.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-10 rounded-3xl w-326 flex flex-col gap-4">
            <p className="ts text-5xl text-center font-semibold">{title}</p>
            <p className="ts text-3xl text-center mb-4">{message}</p>

            <div className="flex flex-row items-center justify-center w-full gap-4 mt-2">
              {!hideCancel && (
                <Button tint={cancelTint} onClick={onCancel}>
                  <p className="ts text-3xl font-semibold">{cancelText}</p>
                </Button>
              )}
              <Button tint={confirmTint} onClick={onConfirm}>
                <p className="ts text-3xl font-semibold">{confirmText}</p>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Alert
