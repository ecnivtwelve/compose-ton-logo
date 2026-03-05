import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import TextEditor from './content/TextEditor'
import SymbolEditor from './content/SymbolEditor'
import BackgroundEditor from './content/BackgroundEditor'

function ContentEditor({ document, setDocument, layer, tab }) {
  const content = document[layer]
  const scrollRef = useRef(null)
  const [scrollIndicator, setScrollIndicator] = useState({ progress: 0, visible: false })

  const prevTabRef = useRef(tab)
  useEffect(() => {
    if (scrollRef.current) {
      const isTabChanging = prevTabRef.current !== tab
      const isContentNotEmpty =
        (content?.type === 'text' && content?.content?.trim().length > 0) ||
        (content?.type === 'symbols' && content?.symbol) ||
        content?.type === 'background'

      if (isTabChanging || !isContentNotEmpty) {
        setTimeout(
          () => {
            if (scrollRef.current) {
              scrollRef.current.scrollTo({ top: 0, behavior: isTabChanging ? 'auto' : 'smooth' })
            }
          },
          isTabChanging ? 200 : 0
        )
      }
    }
    prevTabRef.current = tab
  }, [content?.id, tab])

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    const updateIndicator = () => {
      const maxScroll = element.scrollHeight - element.clientHeight
      if (maxScroll <= 0) {
        setScrollIndicator({ progress: 0, visible: false })
        return
      }

      setScrollIndicator({
        progress: element.scrollTop / maxScroll,
        visible: true
      })
    }

    updateIndicator()
    element.addEventListener('scroll', updateIndicator)
    window.addEventListener('resize', updateIndicator)

    return () => {
      element.removeEventListener('scroll', updateIndicator)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [content?.id, tab])

  if (!content) {
    return <div className="panel w-full h-full overflow-scroll relative" />
  }

  const setLayer = (newLayer) => {
    setDocument((prev) => {
      const newDocument = [...prev]
      newDocument[layer] = newLayer
      return newDocument
    })
  }

  return (
    <div className="w-full h-full relative">
      <motion.div
        ref={scrollRef}
        className="panel w-full h-full overflow-scroll relative"
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -600 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.3, 0, 0, 1] }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={document[layer].type}
            className="w-full h-full p-8 absolute"
            initial={{ x: 100, scale: 0.99, opacity: 0 }}
            animate={{
              x: 0,
              scale: 1,
              opacity: 1,
              transition: {
                type: 'spring',
                bounce: 0.4,
                duration: 0.5
              }
            }}
            exit={{
              x: -100,
              scale: 0.99,
              opacity: 0,
              transition: { duration: 0.2, ease: [1, 0, 1, 1] }
            }}
          >
            {content.type == 'text' && (
              <TextEditor tab={document[layer].type} content={content} setLayer={setLayer} />
            )}

            {content.type == 'symbols' && (
              <SymbolEditor tab={document[layer].type} content={content} setLayer={setLayer} />
            )}

            {content.type == 'background' && (
              <BackgroundEditor tab={document[layer].type} content={content} setLayer={setLayer} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {scrollIndicator.visible && (
        <div className="pointer-events-none absolute right-1 top-6 bottom-10 w-[3px] rounded-full bg-black/0 opacity-20">
          <div
            className="absolute -left-1 w-2 h-48 rounded-full bg-white"
            style={{
              top: `calc(${scrollIndicator.progress} * (100% - 12rem))`
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ContentEditor
