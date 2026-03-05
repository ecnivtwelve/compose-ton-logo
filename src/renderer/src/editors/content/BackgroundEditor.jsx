import Checkbox from '../../components/ui/Checkbox'
import ColorSelector from '../../components/selectors/ColorSelector'
import PatternSelector from '../../components/selectors/PatternSelector'
import Slider from '../../components/ui/Slider'
import { backgroundDefaultState } from '../../utils/consts'

const allPatterns = import.meta.glob('../../assets/img/patterns/*.png', {
  eager: true,
  query: '?url'
})
const blendFallbackColors = [
  '#FF3E11',
  '#FFD700',
  '#ADFF2F',
  '#00FF7F',
  '#00E5FF',
  '#BF00FF',
  '#813f0c',
  '#fff6a1',
  '#acb70e',
  '#18aa02',
  '#427ae3',
  '#e64490'
]

function BackgroundEditor({ content, setLayer }) {
  const defaultPattern = Object.keys(allPatterns)[0] ?? null
  const isBlackOrWhite = (color) => {
    const normalized = (color ?? '').toLowerCase()
    return normalized === '#000000' || normalized === '#ffffff'
  }
  const getRandomBlendFallbackColor = () =>
    blendFallbackColors[Math.floor(Math.random() * blendFallbackColors.length)]

  const setLayerBg = (layer) => {
    if (!content.enabled) {
      setLayer({ ...layer, enabled: true })
    } else {
      setLayer(layer)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="ts text-3xl font-semibold">Choisissez un arrière plan</p>
        <p className="ts text-lg font-regular opacity-70">
          Le bon arrière-plan peut aider votre design à se démarquer encore plus. Cependant, il faut
          réfléchir à un contraste marqué, une bonne combinaison de couleur et à l’adaptabilité.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-4 items-center">
          <Checkbox
            checked={content.enabled}
            onChange={(enabled) => setLayer({ ...content, enabled })}
          />
          <p className="ts text-xl font-semibold w-full">Afficher</p>
        </div>
      </div>

      <div className="h-1" />

      <div className="flex flex-col gap-2">
        <p className="ts text-2xl font-semibold">Couleurs</p>
        <p className="ts text-lg font-regular opacity-70">
          La couleur de votre fond sera utile pour lui donner un caractère. Vous pourrez changer ce
          paramètre ultérieurement.
        </p>
      </div>

      <ColorSelector
        currentColor={content.color}
        onColorSelect={(color) => setLayerBg({ ...content, color: color })}
      />

      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-4 items-center">
          <Checkbox
            checked={content.gradient}
            onChange={(gradient) => setLayerBg({ ...content, gradient })}
          />
          <p className="ts text-xl font-semibold w-full">Dégradé</p>
        </div>
      </div>

      {content.gradient && (
        <>
          <div className="h-1" />
          <p className="ts text-xl font-semibold">Couleur 2</p>
          <ColorSelector
            currentColor={content.color2}
            onColorSelect={(color) => setLayerBg({ ...content, color2: color })}
          />
        </>
      )}

      <div className="h-1" />

      <div className="flex flex-col gap-2">
        <p className="ts text-2xl font-semibold">Motif</p>
        <p className="ts text-lg font-regular opacity-70">
          Un motif peut être utilisé pour aider à pour apporter plus de contexte au logo d’une
          marque. Les motifs peuvent également offrir un contraste par rapport à un logo plat.
        </p>
      </div>

      <PatternSelector
        selectedPattern={content.pattern}
        setSelectedPattern={(pattern) => setLayerBg({ ...content, pattern: pattern })}
      />

      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-3 items-center">
          <p className="ts text-xl font-semibold w-56">Opacité du motif</p>
          <Slider
            value={content.patternOpacity ?? 100}
            range={[0, 100]}
            unit={'%'}
            defaultValue={backgroundDefaultState.patternOpacity}
            onChange={(patternOpacity) => setLayerBg({ ...content, patternOpacity })}
          />
        </div>
        <div className="flex flex-row gap-4 items-center">
          <Checkbox
            checked={content.blendModeEnabled}
            onChange={(blendModeEnabled) => {
              const nextColor =
                blendModeEnabled && isBlackOrWhite(content.color)
                  ? getRandomBlendFallbackColor()
                  : content.color
              const nextColor2 =
                blendModeEnabled && content.gradient && isBlackOrWhite(content.color2)
                  ? getRandomBlendFallbackColor()
                  : content.color2

              setLayerBg({
                ...content,
                blendModeEnabled,
                pattern:
                  blendModeEnabled && !content.pattern ? defaultPattern : content.pattern,
                color: nextColor,
                color2: nextColor2
              })
            }}
          />
          <div>
            <p className="ts text-xl font-semibold w-full">Mode de fusion</p>
            <p className="opacity-70 ts text-lg font-regular w-full">
              Adapte le motif aux couleurs sélectionnées
            </p>
          </div>
        </div>
      </div>

      <div className="h-1" />

      <div className="flex flex-col gap-2">
        <p className="ts text-2xl font-semibold">Réglages avancés</p>
        <p className="ts text-lg font-regular opacity-70">
          Ajoutez des options à votre texte pour en améliorer l’apparence
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-3 items-center">
          <p className="ts text-xl font-semibold w-56">Taille du fond</p>
          <Slider
            value={content.size ?? 500}
            range={[300, 700]}
            unit={'px'}
            defaultValue={backgroundDefaultState.size}
            onChange={(size) => setLayerBg({ ...content, size })}
          />
        </div>
        <div className="flex flex-row gap-3 items-center">
          <p className="ts text-xl font-semibold w-56">Bords arrondis</p>
          <Slider
            value={content.radius ?? 20}
            range={[0, content.size / 2]}
            unit={'px'}
            defaultValue={backgroundDefaultState.radius}
            onChange={(radius) => setLayerBg({ ...content, radius })}
          />
        </div>
        {content.gradient && (
          <div className="flex flex-row gap-3 items-center">
            <p className="ts text-xl font-semibold w-56">Direction dégradé</p>
            <Slider
              value={content.gradientDirection ?? 0}
              range={[0, 360]}
              unit={'°'}
              defaultValue={backgroundDefaultState.gradientDirection}
              onChange={(gradientDirection) => setLayerBg({ ...content, gradientDirection })}
            />
          </div>
        )}
      </div>

      <div className="h-10" />
    </div>
  )
}

export default BackgroundEditor
