import { TypeIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

function ContentEditor({ tab, logoState, setLogoState }) {
  return (
    <>
      <div className="panel w-full h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab.key}
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
            {tab.key === 'text' && (
              <TextEditor tab={tab} logoState={logoState} setLogoState={setLogoState} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}

function TextEditor({ logoState, setLogoState }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="ts text-3xl font-semibold">Choisissez votre texte</p>
        <p className="ts text-lg font-regular opacity-70">
          Partez de quelque chose qui vous est personnel, votre prénom, celui de votre animal de
          compagnie, votre pseudonyme, celui d’un ami ou de votre club sportif... Laissez libre
          court à votre créativité pour créer un super logo !
        </p>
      </div>

      <div className="ctl-pressable ctl-bw px-6 rounded-2xl flex items-center gap-4">
        <TypeIcon size={28} strokeWidth={2.5} className="ts" />

        <input
          type="text"
          placeholder="Votre texte"
          className="ts color-white text-2xl font-medium py-4 w-full"
          value={logoState.text}
          onChange={(e) => setLogoState({ ...logoState, text: e.target.value })}
        />
      </div>
    </div>
  )
}

export default ContentEditor
