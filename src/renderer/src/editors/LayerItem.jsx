import { XIcon, GripVertical } from 'lucide-react'
import { tabs } from '../utils/tabs'
import { symbols } from '../utils/symbols'
import Button from '../components/Button'
import { Reorder, useDragControls } from 'motion/react'

function LayerItem({ item, i, layer, setLayer, setTab, deleteLayer, documentLength, isFixed }) {
  const controls = useDragControls()

  let Icon = item.type === 'symbols' ? item.symbol.svg : undefined

  if (item.type === 'symbols' && !Icon && item.symbol.name) {
    const allSymbols = symbols.flatMap((c) => c.symbols)
    const found = allSymbols.find((s) => s.name === item.symbol.name)
    if (found) {
      Icon = found.svg
    }
  }

  const content = (
    <div className="w-92 flex flex-row gap-2 items-center">
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

      {isFixed && <div className="w-10" />}

      <Button
        className="flex-1 min-w-0"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => {
          setLayer(i)
          setTab(item.type)
        }}
        tint={layer == i ? 'var(--primary)' : undefined}
      >
        {item.type === 'symbols' ? (
          <div className="ts">
            {Icon ? <Icon width={24} height={24} fill="white" /> : null}
          </div>
        ) : (
          tabs.find((tab) => tab.key == item.type).icon
        )}
        <p className="ts text-left w-full font-semibold text-lg truncate min-w-0">
          {item.type === 'background'
            ? 'Arrière-plan'
            : item.type === 'text' && item.content.trim().length > 0
              ? item.content.trim()
              : item.type === 'symbols'
                ? item.symbol.name
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

export default LayerItem
