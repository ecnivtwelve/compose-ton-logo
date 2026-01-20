import SymbolSelector from '../../components/selectors/SymbolSelector'
import ColorSelector from '../../components/selectors/ColorSelector'
import Slider from '../../components/ui/Slider'
import { symbolDefaultState } from '../../utils/consts'

function SymbolEditor({ content, setLayer }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="ts text-3xl font-semibold">Choisissez des formes</p>
        <p className="ts text-lg font-regular opacity-70">
          Les formes géométriques servent à donner une intention claire au logo en jouant sur la
          perception du public. Elles structurent le visuel, créent du rythme et transmettent des
          émotions simple.
        </p>
      </div>

      <SymbolSelector
        selectedSymbol={content.symbol}
        setSelectedSymbol={(symbol) => setLayer({ ...content, symbol })}
      />

      <div className="h-1" />

      <div className="flex flex-col gap-2">
        <p className="ts text-2xl font-semibold">Couleurs</p>
        <p className="ts text-lg font-regular opacity-70">
          La couleur de votre forme sera utile pour lui donner un caractère. Vous pourrez changer ce
          paramètre ultérieurement.
        </p>
      </div>

      <ColorSelector
        currentColor={content.color}
        onColorSelect={(color) => setLayer({ ...content, color: color })}
      />

      <div className="h-1" />

      <div className="flex flex-col gap-2">
        <p className="ts text-2xl font-semibold">Réglages avancés</p>
        <p className="ts text-lg font-regular opacity-70">
          Ajoutez des options à votre texte pour en améliorer l’apparence
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-3 items-center">
          <p className="ts text-xl font-semibold w-56">Taille d&apos;icône</p>
          <Slider
            value={content.size ?? 200}
            range={[50, 600]}
            unit={'px'}
            defaultValue={symbolDefaultState.size}
            onChange={(size) => setLayer({ ...content, size })}
          />
        </div>

        <div className="flex flex-row gap-3 items-center">
          <p className="ts text-xl font-semibold w-56">Ombre</p>
          <Slider
            value={content.shadow ?? 4}
            range={[0, 20]}
            unit={'px'}
            defaultValue={symbolDefaultState.shadow}
            onChange={(shadow) => setLayer({ ...content, shadow })}
          />
        </div>

        <div className="flex flex-row gap-3 items-center">
          <p className="ts text-xl font-semibold w-56">Opacité</p>
          <Slider
            value={content.opacity ?? 100}
            range={[1, 100]}
            unit={'%'}
            defaultValue={symbolDefaultState.opacity}
            onChange={(opacity) => setLayer({ ...content, opacity })}
          />
        </div>

        <div className="flex flex-row gap-3 items-center">
          <p className="ts text-xl font-semibold w-56">Bordure</p>
          <Slider
            value={content.border ?? 0}
            range={[0, 20]}
            unit={'px'}
            defaultValue={symbolDefaultState.border}
            onChange={(border) => setLayer({ ...content, border })}
          />
        </div>

        <div className="flex flex-row gap-3 items-center">
          <p className="ts text-xl font-semibold w-56">Rotation</p>
          <Slider
            value={content.rotation ?? 0}
            range={[-180, 180]}
            unit={'°'}
            defaultValue={symbolDefaultState.rotation}
            onChange={(rotation) => setLayer({ ...content, rotation })}
          />
        </div>

        <div className="flex flex-row gap-3 items-center">
          <p className="ts text-xl font-semibold w-56">Axe X</p>
          <Slider
            value={content.x ?? 0}
            range={[-200, 200]}
            unit={'px'}
            defaultValue={symbolDefaultState.x}
            onChange={(x) => setLayer({ ...content, x })}
          />
        </div>

        <div className="flex flex-row gap-3 items-center">
          <p className="ts text-xl font-semibold w-56">Axe Y</p>
          <Slider
            value={content.y ?? 0}
            range={[-400, 400]}
            unit={'px'}
            defaultValue={symbolDefaultState.y}
            onChange={(y) => setLayer({ ...content, y })}
          />
        </div>
      </div>

      <div className="h-10" />
    </div>
  )
}

export default SymbolEditor
