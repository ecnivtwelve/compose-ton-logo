import { PlusIcon, Timer } from 'lucide-react'
import logo from '../assets/img/logo.png'
import { symbolDefaultState, textDefaultState } from '../utils/consts'
import Button from '../components/Button'
import { Reorder } from 'motion/react'
import { motion } from 'motion/react'
import LayerItem from './LayerItem'
import layerSound from '../assets/sounds/layer.mp3'


import { useRef, useEffect } from 'react'

function LayersEditor({
  document,
  setDocument,
  layer,
  setLayer,
  tab,
  setTab,
  challengeMode,
  challengeTimeLeft,
  addNewCurrentLayerCount
}) {
  const scrollRef = useRef(null)
  const prevTabRef = useRef(tab)
  useEffect(() => {
    if (scrollRef.current) {
      const isTabChanging = prevTabRef.current !== tab
      scrollRef.current.scrollTo({ top: 0, behavior: isTabChanging ? 'auto' : 'smooth' })
    }
    prevTabRef.current = tab
  }, [tab, document.length])

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

  useEffect(() => {
    if (addNewCurrentLayerCount == 0) return
    createNewLayer()
  }, [addNewCurrentLayerCount])

  const background = document.find((item) => item.type === 'background')
  const others = document.filter((item) => item.type !== 'background')

  return (
    <>
      <motion.div
        className="panel w-256 h-[calc(100% - 34px)] mt-[34px] flex flex-col items-center"
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -600 }}
        transition={{ duration: 0.4, ease: [0.3, 0, 0, 1] }}
        style={{
          maxWidth: '412px'
        }}
      >
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
              className="w-92 ctl-pressable ctl-button h-13 min-h-13"
              onClick={createNewLayer}
              customSound={layerSound}
            >
              <PlusIcon className="ts" size={28} strokeWidth={2.5} />
              <p className="ts text-left w-full font-semibold text-lg truncate min-w-0">
                Nouveau {tab === 'text' ? 'texte' : tab === 'symbols' ? 'symbole' : 'fond'}
              </p>
            </Button>
          )}
        </div>

        {challengeMode && (
          <div className="w-full px-6 pb-12 w-full flex flex-row items-center justify-center">
            <div
              className={`flex flex-row items-center justify-center gap-3 bg-[#00000080] py-2 px-6 rounded-2xl ${challengeTimeLeft <= 60 ? 'ctl-challengeWarn' : ''}`}
            >
              <Timer className="ts text-white" size={62} />
              <p className="ts text-white text-7xl font-bold font-mono pt-1">
                {Math.floor(challengeTimeLeft / 60)}:
                {(challengeTimeLeft % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </>
  )
}

export default LayersEditor
