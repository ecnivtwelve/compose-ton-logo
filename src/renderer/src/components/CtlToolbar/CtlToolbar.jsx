import { CheckIcon, DoorOpenIcon, History, RotateCcw } from 'lucide-react'
import Button from '../Button'
import Typography from '../Typography'
import { motion } from 'motion/react'

import tabs_1 from '../../assets/sounds/tabs_1.ogg'
import tabs_2 from '../../assets/sounds/tabs_2.ogg'
import tabs_3 from '../../assets/sounds/tabs_3.ogg'
import upDoneSound from '../../assets/sounds/updone.ogg'

import './CtlToolbar.css'

function CtlToolbar({
  selectedTab,
  setSelectedTab,
  tabs,
  reset,
  done,
  quit,
  history,
  hasLogoBeenEdited
}) {
  return (
    <motion.div
      className="ctltoolbar flex gap-2 justify-between w-full px-10 py-6"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 0.5, ease: [0.3, 0, 0, 1] }}
    >
      <div className="flex gap-4 w-full">
        <Button onClick={quit}>
          <DoorOpenIcon size={28} strokeWidth={2.5} className="ts" />
          <Typography className="font-semibold text-xl">Quitter</Typography>
        </Button>
        <Button onClick={history}>
          <History size={28} strokeWidth={2.5} className="ts" />
          <Typography className="font-semibold text-xl">Historique</Typography>
        </Button>
        <Button tint="#C52E2E" onClick={reset}>
          <RotateCcw size={28} strokeWidth={2.5} className="ts" />
          <Typography className="font-semibold text-xl">Recommencer</Typography>
        </Button>
      </div>
      <div className="flex gap-4 w-full justify-center">
        {tabs.map((tab, i) => (
          <Button
            key={tab.title}
            tint={selectedTab === tab.key ? 'var(--primary)' : undefined}
            onClick={() => setSelectedTab(tab.key)}
            customSound={i === 0 ? tabs_1 : i === 1 ? tabs_2 : tabs_3}
          >
            {tab.icon}
            <Typography className="font-semibold text-xl">{tab.title}</Typography>
          </Button>
        ))}
      </div>
      <div className="flex gap-4 w-full justify-end">
        <Button
          customSound={upDoneSound}
          tint={hasLogoBeenEdited && '#12C958'}
          onClick={() => {
            if (hasLogoBeenEdited) {
              done()
            }
          }}
          style={{ opacity: hasLogoBeenEdited ? 1 : 0.5 }}
        >
          <CheckIcon size={28} strokeWidth={2.5} className="ts" />
          <Typography className="font-semibold text-xl">Terminer</Typography>
        </Button>
      </div>
    </motion.div>
  )
}

export default CtlToolbar
