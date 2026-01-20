import { useState, useRef } from 'react'
import { TypeIcon, XIcon } from 'lucide-react'
import { motion } from 'motion/react'
import frenchBadwords from 'french-badwords-list'
import { array as badwords } from 'badwords-list'
import alertSound from '../../assets/sounds/alert.ogg'
import { textDefaultState } from '../../utils/consts'
import Alert from '../../effects/Alert'
import FontSelector from '../../components/selectors/FontSelector'
import ColorSelector from '../../components/selectors/ColorSelector'
import Slider from '../../components/ui/Slider'

const allBadwords = [...frenchBadwords.array, ...badwords]

function TextEditor({ content, setLayer }) {
  const [isShaking, setIsShaking] = useState(false)
  const [showProfanityAlert, setShowProfanityAlert] = useState(false)

  const haveToFillError = () => {
    const audio = new Audio(alertSound)
    setIsShaking(false)
    audio.play()
    setTimeout(() => setIsShaking(true), 10)
    setTimeout(() => setIsShaking(false), 500)
  }

  const inputRef = useRef(null)

  return (
    <div className="flex flex-col gap-6">
      <Alert
        visible={showProfanityAlert}
        title="Pas de gros mots !"
        message="Merci de composer ton logo avec un langage approprié."
        confirmText="D'accord !"
        confirmTint="var(--primary)"
        onConfirm={() => setShowProfanityAlert(false)}
        hideCancel
      />

      <div className="flex flex-col gap-2">
        <p className="ts text-3xl font-semibold">Choisissez votre texte</p>
        <p className="ts text-lg font-regular opacity-70">
          Partez de quelque chose qui vous est personnel, votre prénom, celui de votre animal de
          compagnie, votre pseudonyme, celui d’un ami ou de votre club sportif... Laissez libre
          court à votre créativité pour créer un super logo !
        </p>
      </div>

      <motion.div
        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="ctl-pressable ctl-bw px-6 rounded-2xl flex items-center gap-4"
      >
        <TypeIcon size={28} strokeWidth={2.5} className="ts" />

        <input
          ref={inputRef}
          type="text"
          placeholder="Votre texte"
          className="ts color-white text-2xl font-medium py-4 w-full"
          value={content.content}
          onChange={(e) => setLayer({ ...content, content: e.target.value })}
          onBlur={(e) => {
            const badwords = allBadwords.filter((word) => e.target.value.includes(word))
            if (badwords.length > 0) {
              setIsShaking(true)
              setShowProfanityAlert(true)
              setLayer({ ...content, content: '' })
            }
          }}
        />

        {content.content.length > 1 && (
          <XIcon
            size={32}
            strokeWidth={2.5}
            className="ts"
            onClick={() => setLayer({ ...content, content: '' })}
          />
        )}
      </motion.div>

      <div
        className="flex flex-col gap-6"
        style={
          content.content.length <= 0
            ? {
              opacity: 0.5,
              filter: 'blur(2px)'
            }
            : {}
        }
        onClick={content.content.length <= 0 ? haveToFillError : undefined}
      >
        <div
          className="flex flex-col gap-6"
          style={{
            pointerEvents: content.content.length <= 0 ? 'none' : 'auto'
          }}
        >
          <div className="h-1" />

          <div className="flex flex-col gap-2">
            <p className="ts text-2xl font-semibold">Typographie</p>
            <p className="ts text-lg font-regular opacity-70">
              La typographie consiste à styliser les textes selon ton intention. Choisir Serif ou
              Display donnera un aspect plus traditionnel a ton logo tandis qu’une typographie
              sans-serif paraîtra plus moderne.
            </p>
          </div>

          <FontSelector
            currentFont={content.font ?? 'ComposeTonLogo'}
            onFontSelect={(font) => setLayer({ ...content, font })}
          />

          <div className="h-1" />

          <div className="flex flex-col gap-2">
            <p className="ts text-2xl font-semibold">Couleurs</p>
            <p className="ts text-lg font-regular opacity-70">
              La couleur de votre texte sera utile pour lui donner un caractère. Vous pourrez
              changer ce paramètre ultérieurement.
            </p>
          </div>

          <ColorSelector
            currentColor={content.textColor}
            onColorSelect={(color) => setLayer({ ...content, textColor: color })}
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
              <p className="ts text-xl font-semibold w-56">Taille de police</p>
              <Slider
                value={content.size ?? 64}
                range={[32, 420]}
                unit={'px'}
                defaultValue={textDefaultState.size}
                onChange={(size) => setLayer({ ...content, size })}
              />
            </div>

            <div className="flex flex-row gap-3 items-center">
              <p className="ts text-xl font-semibold w-56">Largeur</p>
              <Slider
                value={content.width ?? 100}
                range={[50, 200]}
                unit={'%'}
                defaultValue={textDefaultState.width}
                onChange={(width) => setLayer({ ...content, width })}
              />
            </div>

            <div className="flex flex-row gap-3 items-center">
              <p className="ts text-xl font-semibold w-56">Ombre</p>
              <Slider
                value={content.shadow ?? 4}
                range={[0, 20]}
                unit={'px'}
                defaultValue={textDefaultState.shadow}
                onChange={(shadow) => setLayer({ ...content, shadow })}
              />
            </div>

            <div className="flex flex-row gap-3 items-center">
              <p className="ts text-xl font-semibold w-56">Opacité</p>
              <Slider
                value={content.opacity ?? 100}
                range={[1, 100]}
                unit={'%'}
                defaultValue={textDefaultState.opacity}
                onChange={(opacity) => setLayer({ ...content, opacity })}
              />
            </div>

            <div className="flex flex-row gap-3 items-center">
              <p className="ts text-xl font-semibold w-56">Bordure</p>
              <Slider
                value={content.border ?? 0}
                range={[0, 10]}
                unit={'px'}
                defaultValue={textDefaultState.border}
                onChange={(border) => setLayer({ ...content, border })}
              />
            </div>

            <div className="flex flex-row gap-3 items-center">
              <p className="ts text-xl font-semibold w-56">Interlettrage</p>
              <Slider
                value={content.letterSpacing ?? -5}
                range={[-200, 400]}
                unit={'%'}
                defaultValue={textDefaultState.letterSpacing}
                onChange={(letterSpacing) => setLayer({ ...content, letterSpacing })}
              />
            </div>

            <div className="flex flex-row gap-3 items-center">
              <p className="ts text-xl font-semibold w-56">Rotation</p>
              <Slider
                value={content.rotation ?? 0}
                range={[-180, 180]}
                unit={'°'}
                defaultValue={textDefaultState.rotation}
                onChange={(rotation) => setLayer({ ...content, rotation })}
              />
            </div>

            <div className="flex flex-row gap-3 items-center">
              <p className="ts text-xl font-semibold w-56">Axe X</p>
              <Slider
                value={content.x ?? 0}
                range={[-200, 200]}
                unit={'px'}
                defaultValue={textDefaultState.x}
                onChange={(x) => setLayer({ ...content, x })}
              />
            </div>

            <div className="flex flex-row gap-3 items-center">
              <p className="ts text-xl font-semibold w-56">Axe Y</p>
              <Slider
                value={content.y ?? 0}
                range={[-400, 400]}
                unit={'px'}
                defaultValue={textDefaultState.y}
                onChange={(y) => setLayer({ ...content, y })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-10" />
    </div>
  )
}

export default TextEditor
