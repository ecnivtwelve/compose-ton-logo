import { FrameIcon, PlusIcon, XIcon } from 'lucide-react'
import logo from '../assets/img/logo.png'
import { symbolDefaultState, textDefaultState } from '../utils/consts'
import { tabs } from '../App'
import Button from '../components/Button'

function LayersEditor({ document, setDocument, layer, setLayer, tab, setTab }) {
  const createNewLayer = () => {
    if (tab === 'text') {
      setDocument([...document, textDefaultState])
    } else if (tab === 'symbols') {
      setDocument([...document, symbolDefaultState])
    }
    setLayer(document.length)
  }

  const deleteLayer = (i) => {
    if (i === layer) {
      if (i !== 0) {
        setLayer(i - 1)
      }
    }
    const newDocument = [...document]
    newDocument.splice(i, 1)
    setDocument(newDocument)
  }

  return (
    <>
      <div className="panel w-256 h-[calc(100% - 34px)] mt-[34px] flex flex-col items-center">
        <img src={logo} alt="" className="mt-[-50px] h-22 ts" />

        <div className="mt-6 w-full px-6 flex flex-col gap-2 h-20">
          {document.map((item, i) => (
            <div className="w-full flex flex-row gap-2" key={i}>
              <Button
                className="w-full"
                onClick={() => {
                  setLayer(i)
                  setTab(item.type)
                }}
                tint={layer == i ? 'var(--primary)' : undefined}
              >
                {tabs.find((tab) => tab.key == item.type).icon}
                <p className="ts text-left w-full font-semibold text-lg">
                  {item.type === 'text' && item.content.trim()
                    ? item.content.trim()
                    : 'Calque ' + (i + 1)}
                </p>
              </Button>

              <Button className="w-16 p-0" onClick={() => deleteLayer(i)}>
                <XIcon
                  className="ts"
                  size={20}
                  strokeWidth={2.5}
                  style={
                    document.length <= 1
                      ? { opacity: 0.2, pointerEvents: 'none', transform: 'scale(1.2)' }
                      : { transform: 'scale(1.2)' }
                  }
                />
              </Button>
            </div>
          ))}

          <Button
            key={document.length}
            className="ctl-pressable ctl-button w-full h-20"
            onClick={createNewLayer}
          >
            <PlusIcon className="ts" size={28} strokeWidth={2.5} />
            <p className="ts text-left w-full font-semibold text-lg">
              Nouveau {tab === 'text' ? 'texte' : tab === 'symbols' ? 'symbole' : 'arrière-plan'}
            </p>
          </Button>
        </div>
      </div>
    </>
  )
}

export default LayersEditor
