import { CheckIcon, MinusIcon, SearchIcon, TypeIcon, XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useState, useRef } from 'react'

const allPatterns = import.meta.glob('../assets/img/patterns/*.png', {
  eager: true,
  query: '?url'
})

import popSound from '../assets/sounds/pop.mp3'
import hitSound from '../assets/sounds/hit.mp3'
import scrollSound from '../assets/sounds/scroll_2.ogg'
import alertSound from '../assets/sounds/alert.ogg'
import { backgroundDefaultState, symbolDefaultState, textDefaultState } from '../utils/consts'
import Alert from '../effects/Alert'

import frenchBadwords from 'french-badwords-list'
import { array as badwords } from 'badwords-list'
import { symbols } from '../utils/symbols'
const allBadwords = [...frenchBadwords.array, ...badwords]

function ContentEditor({ document, setDocument, layer, tab }) {
  const content = document[layer]
  const scrollRef = useRef(null)

  const prevTabRef = useRef(tab)
  useEffect(() => {
    if (scrollRef.current) {
      const isTabChanging = prevTabRef.current !== tab
      const isContentNotEmpty =
        (content?.type === 'text' && content?.content?.trim().length > 0) ||
        (content?.type === 'symbols' && content?.symbol) ||
        content?.type === 'background'

      if (isTabChanging || !isContentNotEmpty) {
        setTimeout(
          () => {
            if (scrollRef.current) {
              scrollRef.current.scrollTo({ top: 0, behavior: isTabChanging ? 'auto' : 'smooth' })
            }
          },
          isTabChanging ? 200 : 0
        )
      }
    }
    prevTabRef.current = tab
  }, [content?.id, tab])

  if (!content) {
    return <div className="panel w-full h-full overflow-scroll relative" />
  }

  const setLayer = (newLayer) => {
    setDocument((prev) => {
      const newDocument = [...prev]
      newDocument[layer] = newLayer
      return newDocument
    })
  }

  return (
    <>
      <motion.div
        ref={scrollRef}
        className="panel w-full h-full overflow-scroll relative"
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -600 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.3, 0, 0, 1] }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={document[layer].type}
            className="w-full h-full p-8 absolute"
            initial={{ x: 100, scale: 0.99, opacity: 0 }}
            animate={{
              x: 0,
              scale: 1,
              opacity: 1,
              transition: {
                type: 'spring',
                bounce: 0.4,
                duration: 0.5
              }
            }}
            exit={{
              x: -100,
              scale: 0.99,
              opacity: 0,
              transition: { duration: 0.2, ease: [1, 0, 1, 1] }
            }}
          >
            {content.type == 'text' && (
              <TextEditor tab={document[layer].type} content={content} setLayer={setLayer} />
            )}

            {content.type == 'symbols' && (
              <SymbolEditor tab={document[layer].type} content={content} setLayer={setLayer} />
            )}

            {content.type == 'background' && (
              <BackgroundEditor tab={document[layer].type} content={content} setLayer={setLayer} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  )
}

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
                range={[32, 256]}
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
                range={[-40, 40]}
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
          <p className="ts text-xl font-semibold w-56">Taille d'icône</p>
          <Slider
            value={content.size ?? 200}
            range={[50, 600]}
            unit={'px'}
            defaultValue={symbolDefaultState.size}
            onChange={(size) => setLayer({ ...content, size })}
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
          <p className="ts text-xl font-semibold w-56">Rotation</p>
          <Slider
            value={content.rotation ?? 0}
            range={[-40, 40]}
            unit={'°'}
            defaultValue={symbolDefaultState.rotation}
            onChange={(rotation) => setLayer({ ...content, rotation })}
          />
        </div>

        <div className="flex flex-row gap-3 items-center">
          <p className="ts text-xl font-semibold w-56">Contour</p>
          <Slider
            value={content.border ?? 0}
            range={[0, 20]}
            unit={'px'}
            defaultValue={symbolDefaultState.border}
            onChange={(border) => setLayer({ ...content, border })}
          />
        </div>
      </div>

      <div className="h-10" />
    </div>
  )
}

function BackgroundEditor({ content, setLayer }) {
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
      </div>

      <div className="h-10" />
    </div>
  )
}

function PatternSelector({ selectedPattern, setSelectedPattern }) {
  const patterns = Object.entries(allPatterns)

  return (
    <div className="grid gap-2 grid-cols-6 w-full">
      {patterns.map(([url, module]) => (
        <div
          className={`ctl-pressable ctl-button ctl-nopadding p-2 h-18 rounded-2xl flex flex-column items-center justify-center overflow-hidden relative ${selectedPattern === url ? 'ctl-selected' : ''}`}
          key={url}
          onClick={() => {
            const selectPatternSound = new Audio(hitSound)
            selectPatternSound.play()

            if (selectedPattern === url) {
              setSelectedPattern(null)
            } else {
              setSelectedPattern(url)
            }
          }}
        >
          <div className="w-full h-full absolute ctl-pressable z-200" />

          <img src={module.default} alt="" className="w-full h-full object-cover absolute" />
        </div>
      ))}
    </div>
  )
}

function SymbolSelector({ selectedSymbol, setSelectedSymbol }) {
  const [selectedCategory, setSelectedCategory] = useState('Toutes')
  const [searchTerms, setSearchTerms] = useState('')
  const categories = ['Toutes', ...symbols.map((category) => category.category)]

  const shownSymbols =
    selectedCategory !== 'Toutes'
      ? symbols.find((category) => category.category === selectedCategory).symbols
      : symbols.flatMap((category) => category.symbols)

  const filteredSymbols = shownSymbols.filter((symbol) =>
    symbol.tags.toLowerCase().includes(searchTerms.toLowerCase())
  )

  const selectSymbol = (symbol) => {
    const symbS = new Audio(hitSound)
    symbS.play()

    setSelectedSymbol(symbol)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="ctl-pressable ctl-bw px-6 rounded-2xl flex items-center gap-4">
        <SearchIcon size={28} strokeWidth={2.5} className="ts" />

        <input
          type="text"
          placeholder="Rechercher"
          className="ts color-white text-2xl font-medium py-3 w-full"
          value={searchTerms}
          onChange={(e) => setSearchTerms(e.target.value)}
        />

        <select
          className="ts select color-white text-2xl font-medium py-3 w-70"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category, i) => (
            <option key={i} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col ctl-container py-3 px-3 h-56 rounded-2xl overflow-scroll">
        <div className="grid gap-3 grid-cols-5 w-full">
          {filteredSymbols.map((symbol, i) => {
            const Icon = symbol.svg

            return (
              <div
                className="p-2 h-18 rounded-2xl flex flex-column items-center justify-center"
                key={i}
                onClick={() => selectSymbol(symbol)}
                style={{
                  borderColor: selectedSymbol === symbol ? '#fff' : 'transparent',
                  borderWidth: 2,
                  backgroundColor: selectedSymbol === symbol ? '#ffffff44' : '#ffffff00'
                }}
              >
                <Icon fill={'white'} width={40} height={40} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FontSelector({ text = 'Texte', currentFont, onFontSelect }) {
  const fonts = [
    'Impact',
    'Comic Sans MS',
    'Aleo',
    'Limelight',
    'Arial Black',
    'LeckerliOne',
    'Audiowide',
    'FasterOne',
    'Ribeye',
    'Archivo',
    'MetalMania',
    'Micro5',
    'UniRennes',
    'AuBordDeLaSeine',
    'Bright',
    'ChocolateAdventure'
  ]

  const playButtonSound = () => {
    const buttonSound = new Audio(hitSound)
    buttonSound.play()
  }

  return (
    <div className="grid gap-4 grid-cols-4 w-full">
      {fonts.map((font, i) => (
        <div
          key={i}
          className={`ctl-pressable ctl-button p-2 h-18 rounded-2xl flex flex-column items-center justify-center ${currentFont == font ? 'ctl-selected' : ''}`}
          style={{
            '--tint': currentFont == font ? 'var(--primary)' : undefined
          }}
          onClick={() => {
            playButtonSound()
            onFontSelect(font)
          }}
        >
          <p
            className="ts text-4xl text-center"
            style={{
              fontFamily: font
            }}
          >
            {text}
          </p>
        </div>
      ))}
    </div>
  )
}

function ColorSelector({ currentColor, onColorSelect }) {
  const colors = [
    '#E65540', // Red/Orange
    '#F1A340', // Orange/Gold
    '#F3E54F', // Yellow
    '#6DD36B', // Bright Green
    '#57ACDE', // Sky Blue (Selected)
    '#D34D91', // Pink/Magenta
    '#FFFFFF', // White
    '#8C3626', // Deep Red/Brown
    '#8A6430', // Bronze/Brown
    '#8F8B35', // Olive/Mustard
    '#3B7C4F', // Forest Green
    '#446E8C', // Muted/Steel Blue
    '#7B3D64', // Deep Plum/Purple
    '#000000' // Black
  ]

  const playButtonSound = () => {
    const buttonSound = new Audio(popSound)
    buttonSound.play()
  }

  return (
    <div className="grid gap-2 grid-cols-7 w-full">
      {colors.map((color, i) => (
        <div
          key={i}
          className={`ctl-pressable ctl-button p-2 h-18 rounded-2xl flex flex-column items-center justify-center ${currentColor == color ? 'ctl-selected' : ''}`}
          style={{
            '--tint': color
          }}
          onClick={() => {
            playButtonSound()
            onColorSelect(color)
          }}
        ></div>
      ))}
    </div>
  )
}

function Slider({ value, onChange, range, unit, defaultValue }) {
  const [min, max] = range || [0, 100]

  const [scrollLoop] = useState(() => {
    const audio = new Audio(scrollSound)
    audio.loop = true
    return audio
  })

  const stopTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      scrollLoop.pause()
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    }
  }, [scrollLoop])

  const handleReset = () => {
    if (defaultValue !== undefined) {
      onChange(defaultValue)
    }
  }

  return (
    <div className="flex items-center gap-6 w-full">
      <div className="relative flex-1 group">
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(e) => {
            onChange(parseInt(e.target.value))
          }}
          onDoubleClick={handleReset}
          className="relative w-full h-3 bg-black/50 rounded-full appearance-none cursor-pointer border border-white/10 active:cursor-grabbing"
          style={{
            WebkitAppearance: 'none'
          }}
        />
      </div>
      <div
        className="ctl-pressable ctl-bw px-5 py-2 rounded-2xl min-w-[100px] flex justify-center items-center shadow-lg bg-white/5 backdrop-blur-sm"
        onClick={handleReset}
      >
        <span className="ts text-2xl font-bold">{value}</span>
        <span className="ts text-sm font-medium opacity-60 ml-1 mt-1">{unit}</span>
      </div>
    </div>
  )
}

function Checkbox({ checked, onChange }) {
  return (
    <div
      className="ctl-pressable ctl-button w-16 h-12 p-0 rounded-4xl flex items-center justify-center"
      style={{
        '--tint': checked ? 'var(--primary)' : 'var(--secondary)'
      }}
      onClick={() => {
        const checkedSound = new Audio(popSound)
        checkedSound.play()
        onChange(!checked)
      }}
    >
      {checked ? (
        <CheckIcon color="#FFFFFF" size={30} strokeWidth={3} />
      ) : (
        <MinusIcon color="#FFFFFF" size={30} strokeWidth={3} />
      )}
    </div>
  )
}

export default ContentEditor
