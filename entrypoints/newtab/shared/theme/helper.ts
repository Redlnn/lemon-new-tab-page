import {
  alphaFromArgb,
  blueFromArgb,
  greenFromArgb,
  redFromArgb
} from '@material/material-color-utilities'

/**
 * Return RGBA from a given int32 color
 *
 * @param argb ARGB representation of a int32 color.
 * @return RGBA representation of a int32 color.
 */
export function rgbaFromArgb(argb: number): Rgba {
  const r = redFromArgb(argb)
  const g = greenFromArgb(argb)
  const b = blueFromArgb(argb)
  const a = alphaFromArgb(argb)
  return { r, g, b, a }
}

/**
 * Return int32 color from a given RGBA component
 *
 * @param rgba RGBA representation of a int32 color.
 * @returns ARGB representation of a int32 color.
 */
export function argbFromRgba({ r, g, b, a }: Rgba): number {
  const rValue = clampComponent(r)
  const gValue = clampComponent(g)
  const bValue = clampComponent(b)
  const aValue = clampComponent(a)
  return (aValue << 24) | (rValue << 16) | (gValue << 8) | bValue
}
function clampComponent(value: number) {
  if (value < 0) return 0
  if (value > 255) return 255
  return value
}
