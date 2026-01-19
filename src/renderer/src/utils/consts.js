import { symbols } from './symbols'

export const textDefaultState = {
  type: 'text',
  content: '',
  font: 'Impact',
  color: '#FFFFFF',
  size: 64,
  width: 100,
  rotation: 0,
  x: 0,
  y: 0,
  shadow: 4,
  border: 0,
  letterSpacing: -5,
  opacity: 100
}

export const symbolDefaultState = {
  type: 'symbols',
  symbol: symbols[0].symbols[0],
  color: '#FFFFFF',
  size: 200,
  rotation: 0,
  x: 0,
  y: 0,
  shadow: 4,
  border: 0,
  opacity: 100
}

export const backgroundDefaultState = {
  type: 'background',
  enabled: false,
  patternOpacity: 100,
  color: '#000000',
  size: 500,
  radius: 20
}

export const defaultState = [backgroundDefaultState, textDefaultState]
