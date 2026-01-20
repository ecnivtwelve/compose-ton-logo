import { AtSignIcon, XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Button from '../Button'
import { useRef, useState } from 'react'

function EmailModal({
  visible,
  email,
  setEmail,
  onCancel,
  onSend,
  emailInputFocus,
  setEmailInputFocus
}) {
  const emailInputRef = useRef(null)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
            backdropFilter: 'blur(5px)'
          }}
          initial={{ opacity: 0, scale: 1.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-10 rounded-3xl w-326 flex flex-col gap-4">
            <p className="ts text-5xl text-center font-semibold">Recevoir le logo par e-mail</p>
            <p className="ts text-3xl text-center mb-4">
              Indiquez votre adresse e-mail pour recevoir le logo que vous venez de créer !
            </p>

            <div className="ctl-pressable ctl-bw px-6 rounded-2xl flex items-center gap-4">
              <AtSignIcon size={28} strokeWidth={2.5} className="ts" />

              <input
                ref={emailInputRef}
                type="text"
                placeholder="Votre adresse e-mail"
                className="ts color-white text-2xl font-medium py-4 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailInputFocus(true)}
                onBlur={() => setEmailInputFocus(false)}
              />

              {email.length > 1 && (
                <XIcon size={32} strokeWidth={2.5} className="ts" onClick={() => setEmail('')} />
              )}
            </div>

            <div className="flex flex-row items-center justify-center w-full gap-4 mt-2">
              <Button onClick={onCancel}>
                <p className="ts text-3xl font-semibold">Annuler</p>
              </Button>
              <Button tint={'#0055FF'} onClick={onSend}>
                <p className="ts text-3xl font-semibold">Recevoir un e-mail</p>
              </Button>
            </div>

            {emailInputFocus && <div className="h-42" />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EmailModal
