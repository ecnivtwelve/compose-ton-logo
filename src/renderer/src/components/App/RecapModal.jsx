import { DoorOpenIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Button from '../Button'
import Typography from '../Typography'
import { ContentRenderer } from '../ContentRenderer'

function RecapModal({
  visible,
  challengeTimeLeft,
  document,
  onQuit
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 99999, // Very high z-index to stay on top
            backdropFilter: 'blur(10px)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center">
              <p className="text-white text-5xl font-semibold">Challenge Terminé !</p>
              <p className="text-white text-2xl font-medium mt-2 opacity-80">
                Temps réalisé :{' '}
                {(() => {
                  const spent = 180 - challengeTimeLeft
                  const mins = Math.floor(spent / 60)
                  const secs = spent % 60
                  return `${mins} min ${secs.toString().padStart(2, '0')}`
                })()}
              </p>
            </div>

            <div
              className="relative bg-transparent rounded-xl overflow-visible"
              style={{ width: 600, height: 600 }}
            >
              <ContentRenderer document={document} animated={false} simplified={false} />
            </div>

            <Button
              tint="#C52E2E"
              onClick={onQuit}
            >
              <DoorOpenIcon size={32} strokeWidth={2.5} className="ts" />
              <Typography className="font-semibold text-3xl">Quitter</Typography>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RecapModal
