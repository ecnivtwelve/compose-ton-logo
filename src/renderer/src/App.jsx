import CtlToolbar from './components/CtlToolbar/CtlToolbar'
import LayersEditor from './editors/LayersEditor'
import ContentEditor from './editors/ContentEditor'
import ContentPreview from './editors/ContentPreview'
import { useState } from 'react'
import { ImagesIcon, ShapesIcon, TypeIcon } from 'lucide-react'

function App() {
  const [logoState, setLogoState] = useState({ text: '' })
  const [selectedTab, setSelectedTab] = useState(0)

  const tabs = [
    {
      key: 'text',
      title: 'Texte',
      icon: <TypeIcon size={28} strokeWidth={2.5} className="ts" />
    },
    {
      key: 'symbols',
      title: 'Symboles',
      icon: <ShapesIcon size={28} strokeWidth={2.5} className="ts" />
    },
    {
      key: 'background',
      title: 'Arrière-plan',
      icon: <ImagesIcon size={28} strokeWidth={2.5} className="ts" />
    }
  ]

  return (
    <>
      <div className="flex flex-row w-full h-full p-12 gap-4">
        <LayersEditor />
        <ContentEditor tab={tabs[selectedTab]} logoState={logoState} setLogoState={setLogoState} />
        <ContentPreview logoState={logoState} setLogoState={setLogoState} key={logoState.text} />
      </div>
      <CtlToolbar selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabs={tabs} />
    </>
  )
}

export default App
