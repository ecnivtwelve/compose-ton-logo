import { FrameIcon, PlusIcon, XIcon, GripVertical } from 'lucide-react'
import logo from '../assets/img/logo.png'
import { symbolDefaultState, textDefaultState } from '../utils/consts'
import { tabs } from '../App'
import Button from '../components/Button'
import { Reorder, useDragControls } from 'motion/react'

import { useRef, useEffect } from 'react'

function LayersEditor({ document, setDocument, layer, setLayer, tab, setTab }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0)
    }
  }, [tab])

  const handleReorder = (newOthers) => {
    const background = document.find((item) => item.type === 'background')
    const selectedItem = document[layer]
    const newDocument = [background, ...newOthers]
    setDocument(newDocument)
    const newIndex = newDocument.findIndex((item) => item.id === selectedItem.id)
    if (newIndex !== -1) {
      setLayer(newIndex)
    }
  }

  const createNewLayer = () => {
    const id = Math.random().toString(36).substr(2, 9)
    if (tab === 'text') {
      setDocument([...document, { ...textDefaultState, id }])
    } else if (tab === 'symbols') {
      setDocument([...document, { ...symbolDefaultState, id }])
    }
    setLayer(document.length)
  }

  const deleteLayer = (i) => {
    if (document[i].type === 'background') return

    if (i === layer) {
      if (i !== 0) {
        setLayer(i - 1)
      }
    }
    const newDocument = [...document]
    newDocument.splice(i, 1)
    setDocument(newDocument)
  }

  const background = document.find((item) => item.type === 'background')
  const others = document.filter((item) => item.type !== 'background')

  return (
    <>
      <div className="panel w-256 h-[calc(100% - 34px)] mt-[34px] flex flex-col items-center">
        <img src={logo} alt="" className="mt-[-50px] h-22 ts" />

        <div
          ref={scrollRef}
          className="pt-6 w-full px-6 flex flex-col gap-2 overflow-y-scroll flex-1 mb-6"
        >
          {background && (
            <LayerItem
              key={background.id}
              item={background}
              i={document.indexOf(background)}
              layer={layer}
              setLayer={setLayer}
              setTab={setTab}
              deleteLayer={deleteLayer}
              documentLength={document.length}
              isFixed
            />
          )}

          <Reorder.Group
            axis="y"
            values={others}
            onReorder={handleReorder}
            className="flex flex-col gap-2"
          >
            {others.map((item) => (
              <LayerItem
                key={item.id}
                item={item}
                i={document.indexOf(item)}
                layer={layer}
                setLayer={setLayer}
                setTab={setTab}
                deleteLayer={deleteLayer}
                documentLength={document.length}
              />
            ))}
          </Reorder.Group>

          {tab !== 'background' && (
            <Button
              key={document.length}
              className="ctl-pressable ctl-button w-full h-13 min-h-13"
              onClick={createNewLayer}
            >
              <PlusIcon className="ts" size={28} strokeWidth={2.5} />
              <p className="ts text-left w-full font-semibold text-lg">
                Nouveau {tab === 'text' ? 'texte' : tab === 'symbols' ? 'symbole' : 'fond'}
              </p>
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

function LayerItem({ item, i, layer, setLayer, setTab, deleteLayer, documentLength, isFixed }) {
  const controls = useDragControls()

  const content = (
    <div className="w-full flex flex-row gap-2 items-center">
      {!isFixed && (
        <div
          className="cursor-grab active:cursor-grabbing p-4 -m-2 opacity-50 flex items-center justify-center shrink-0"
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => {
            controls.start(e)
          }}
        >
          <GripVertical size={24} color="white" />
        </div>
      )}

      {isFixed && <div className="w-12" />}

      <Button
        className="w-full"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => {
          setLayer(i)
          setTab(item.type)
        }}
        tint={layer == i ? 'var(--primary)' : undefined}
      >
        {tabs.find((tab) => tab.key == item.type).icon}
        <p className="ts text-left w-full font-semibold text-lg">
          {item.type === 'background'
            ? 'Arrière-plan'
            : item.type === 'text' && item.content.trim().length > 0
              ? item.content.trim()
              : 'Calque ' + (i + 1)}
        </p>
      </Button>

      {item.type !== 'background' && (
        <Button
          className="w-16 p-0"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => deleteLayer(i)}
        >
          <XIcon
            className="ts"
            size={20}
            strokeWidth={2.5}
            style={
              documentLength <= 1
                ? { opacity: 0.2, pointerEvents: 'none', transform: 'scale(1.2)' }
                : { transform: 'scale(1.2)' }
            }
          />
        </Button>
      )}
    </div>
  )

  if (isFixed) {
    return content
  }

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="w-full"
      style={{ touchAction: 'auto' }}
    >
      {content}
    </Reorder.Item>
  )
}

export default LayersEditor
