/**
 * 校验是否为支持的 HEX 颜色格式：#RGB/#RGBA/#RRGGBB/#RRGGBBAA
 */
export function isValidHexColor(input: string): boolean {
  // 支持 #RGB, #RGBA, #RRGGBB, #RRGGBBAA
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(input)
}

/**
 * 将 #RGB/#RGBA 规范化为 #RRGGBB/#RRGGBBAA
 */
export function normalizeTo6Hex(color: string): string {
  const hex = color.slice(1) // 去掉 #
  const len = hex.length

  // 如果已经是 6 位或 8 位,直接返回
  if (len === 6 || len === 8) {
    return color
  }

  // 如果是 3 位或 4 位,展开每一位
  // #RGB -> #RRGGBB, #RGBA -> #RRGGBBAA
  if (len === 3) {
    const r = hex[0],
      g = hex[1],
      b = hex[2]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  if (len === 4) {
    const r = hex[0],
      g = hex[1],
      b = hex[2],
      a = hex[3]
    return `#${r}${r}${g}${g}${b}${b}${a}${a}`
  }

  return color
}

export function hex2rgba(color: string): Rgba {
  // 先规范化
  const normalized = normalizeTo6Hex(color)
  const hex = normalized.slice(1) // 去掉 #

  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)

  // 如果有 alpha 通道
  let a = 255
  if (hex.length === 8) {
    a = Number.parseInt(hex.slice(6, 8), 16)
  }

  return { r, g, b, a }
}

/**
 * 将 0-255 的数值转为 2 位 16 进制字符串
 */
function toHex(n: number): string {
  return Math.round(n).toString(16).padStart(2, '0')
}

export function rgba2Hex({ r, g, b, a }: Rgba): string {
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`

  // 如果 alpha 不是 255,添加 alpha 通道
  return a !== 255 ? `${hex}${toHex(a)}` : hex
}
