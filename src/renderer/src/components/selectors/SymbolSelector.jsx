import { useState, useRef } from 'react'
import { SearchIcon, ChevronDown } from 'lucide-react'
import hitSound from '../../assets/sounds/hit.mp3'
import { symbols } from '../../utils/symbols'

function SymbolSelector({ selectedSymbol, setSelectedSymbol }) {
  const selectRef = useRef(null)
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
      <div className="ctl-pressable ctl-bw px-6 rounded-2xl flex items-center gap-4 pr-4">
        <div className="w-8 h-8 flex items-center justify-center">
          <SearchIcon size={28} strokeWidth={2.5} className="ts" />
        </div>

        <input
          type="text"
          placeholder="Rechercher"
          className="ts color-white text-2xl font-medium py-3 w-full"
          value={searchTerms}
          onChange={(e) => setSearchTerms(e.target.value)}
        />

        <select
          ref={selectRef}
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

        <ChevronDown
          size={56}
          strokeWidth={2.5}
          className="ts"
          onClick={() => selectRef.current?.showPicker()}
        />
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

export default SymbolSelector
