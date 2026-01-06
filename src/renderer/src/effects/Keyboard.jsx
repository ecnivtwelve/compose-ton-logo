import { useState, useEffect, useRef } from 'react'
import SimpleKeyboard from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
import { motion, AnimatePresence } from 'motion/react'
import './Keyboard.css'

import keySound from '../assets/sounds/key.mp3'

import layout from 'simple-keyboard-layouts/build/layouts/french'

const KeyboardEffect = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [layoutName, setLayoutName] = useState('default')
  const [isCapsLock, setIsCapsLock] = useState(false)
  const activeInputRef = useRef(null)
  const keyboardRef = useRef()

  const playKeySound = () => {
    const keycapSound = new Audio(keySound)
    keycapSound.play()
  }

  useEffect(() => {
    const handleFocus = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        activeInputRef.current = e.target
        setIsVisible(true)
        // Initial sync when focus occurs
        if (keyboardRef.current) {
          keyboardRef.current.setInput(e.target.value)
        }
      }
    }

    const handleClickOutside = (e) => {
      if (
        isVisible &&
        e.target.tagName !== 'INPUT' &&
        e.target.tagName !== 'TEXTAREA' &&
        !e.target.closest('.keyboard-wrapper') &&
        !e.target.closest('.hg-button')
      ) {
        setIsVisible(false)
      }
    }

    document.addEventListener('focusin', handleFocus)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible])

  // Secondary sync when visibility changes (to catch cases where ref wasn't ready)
  useEffect(() => {
    if (isVisible && activeInputRef.current && keyboardRef.current) {
      keyboardRef.current.setInput(activeInputRef.current.value)
    }
  }, [isVisible])

  const onChange = (input) => {
    if (activeInputRef.current) {
      // To trigger React's onChange, we need to call the native value setter
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      ).set
      nativeInputValueSetter.call(activeInputRef.current, input)

      const event = new Event('input', { bubbles: true })
      activeInputRef.current.dispatchEvent(event)
    }
  }

  const onKeyPress = (button) => {
    playKeySound()
    if (button === '{shift}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default')
    } else if (button === '{lock}') {
      const newLock = !isCapsLock
      setIsCapsLock(newLock)
      setLayoutName(newLock ? 'shift' : 'default')
    } else if (button === '{enter}') {
      if (activeInputRef.current) {
        activeInputRef.current.blur()
      }
      setIsVisible(false)
    } else {
      // Handle temporary shift/uncapitalize
      if (!button.startsWith('{')) {
        if (isCapsLock) {
          setLayoutName('shift')
        } else {
          setLayoutName('default')
        }
      }
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="keyboard-wrapper"
          initial={{ y: 500, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 500, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onMouseDown={(e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault()
            }
          }}
        >
          <div className="keyboard-container panel">
            <div className="p-4">
              <SimpleKeyboard
                keyboardRef={(r) => {
                  keyboardRef.current = r
                  if (r && activeInputRef.current) {
                    r.setInput(activeInputRef.current.value)
                  }
                }}
                layout={layout.layout}
                layoutName={layoutName}
                onChange={onChange}
                onKeyPress={onKeyPress}
                display={{
                  '{bksp}': '⌫',
                  '{enter}': 'Valider',
                  '{shift}': '⇧',
                  '{tab}': '⇥',
                  '{lock}': 'Maj.',
                  '{space}': 'Espace'
                }}
                buttonTheme={[
                  {
                    class: 'hg-active-lock',
                    buttons: isCapsLock ? '{lock}' : ''
                  },
                  {
                    class: 'hg-active-shift',
                    buttons: layoutName === 'shift' && !isCapsLock ? '{shift}' : ''
                  }
                ]}
                theme={'hg-theme-default hg-layout-default ctl-keyboard'}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default KeyboardEffect