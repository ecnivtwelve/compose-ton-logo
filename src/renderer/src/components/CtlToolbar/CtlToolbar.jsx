import { CheckIcon, DoorOpenIcon } from 'lucide-react'
import Button from '../Button'
import Typography from '../Typography'

import './CtlToolbar.css'

function CtlToolbar({ selectedTab, setSelectedTab, tabs }) {
  return (
    <div className="ctltoolbar flex gap-2 justify-between w-full px-10 py-6">
      <div className="flex gap-4 w-full">
        <Button tint="#C52E2E">
          <DoorOpenIcon size={28} strokeWidth={2.5} className="ts" />
          <Typography className="font-semibold text-xl">Quitter</Typography>
        </Button>
      </div>
      <div className="flex gap-4 w-full justify-center">
        {tabs.map((tab, index) => (
          <Button
            key={tab.title}
            tint={selectedTab === index ? 'var(--primary)' : undefined}
            onClick={() => setSelectedTab(index)}
          >
            {tab.icon}
            <Typography className="font-semibold text-xl">{tab.title}</Typography>
          </Button>
        ))}
      </div>
      <div className="flex gap-4 w-full justify-end">
        <Button tint="#12C958">
          <CheckIcon size={28} strokeWidth={2.5} className="ts" />
          <Typography className="font-semibold text-xl">Terminer</Typography>
        </Button>
      </div>
    </div>
  )
}

export default CtlToolbar
