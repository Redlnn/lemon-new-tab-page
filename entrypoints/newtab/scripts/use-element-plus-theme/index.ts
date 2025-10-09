import { BLACK, Levels, PRE, PRE_DARK, PRE_LIGHT, WHITE } from './token'

const html = document.documentElement

interface RGBColor {
  r: number
  g: number
  b: number
}

/**
 * 校验是否为支持的 HEX 颜色格式：#RGB/#RGBA/#RRGGBB/#RRGGBBAA
 */
function isValidHexColor(input: string): boolean {
  if (typeof input !== 'string') {
    return false
  }
  const color = input.trim()
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
}

/**
 * 将 #RGB/#RRGGBB 规范化为 #RRGGBB
 */
function normalizeTo6Hex(color: string): string {
  const hex = color.trim()
  if (!isValidHexColor(hex)) {
    throw new Error(`Invalid hex color: ${color}`)
  }
  const raw = hex.slice(1)
  if (raw.length === 3) {
    // #RGB 或 #RGBA
    const r = raw[0]!
    const g = raw[1]!
    const b = raw[2]!
    // 忽略 alpha: raw[3]
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  // 6 位或
  const r = raw.slice(0, 2)
  const g = raw.slice(2, 4)
  const b = raw.slice(4, 6)
  return `#${r}${g}${b}`.toLowerCase()
}

function parseHexColor(color: string): RGBColor {
  const normalized = normalizeTo6Hex(color)
  const hex = normalized.substring(1)
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  }
}

function componentToHex(c: number): string {
  const hex = Math.round(c).toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

function rgbToHex({ r, g, b }: RGBColor): string {
  // 保障边界：将数值限制在 0-255 范围
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  return '#' + componentToHex(clamp(r)) + componentToHex(clamp(g)) + componentToHex(clamp(b))
}

/**
 * 混合颜色
 */
function mix(color1: string, color2: string, weight: number): string {
  weight = Math.max(Math.min(Number(weight), 1), 0)
  const c1 = parseHexColor(color1)
  const c2 = parseHexColor(color2)

  return rgbToHex({
    r: c1.r * (1 - weight) + c2.r * weight,
    g: c1.g * (1 - weight) + c2.g * weight,
    b: c1.b * (1 - weight) + c2.b * weight
  })
}

/**
 * 更换颜色的方法
 * @param color 颜色
 */
function changeTheme(color?: string | null) {
  // 基本校验
  if (!color || typeof color !== 'string') {
    console.warn('未获取到颜色的值')
    return
  }
  const raw = color.trim()
  if (!isValidHexColor(raw)) {
    console.warn('无效的主题色（需为 #RGB/#RRGGBB）:', color)
    return
  }
  // 规范化为 #RRGGBB，避免后续解析歧义
  const normalized = normalizeTo6Hex(raw)
  // 设置主要颜色变量 --el-color-primary
  html.style.setProperty(PRE, normalized)
  // 循环设置色阶颜色
  // --el-color-primary-light-${level}
  Levels.forEach((level) => {
    html.style.setProperty(`${PRE_LIGHT}-${level}`, mix(normalized, WHITE, level * 0.1))
  })
  // 设置主要暗色
  // --el-color-primary-dark-2
  const dark = mix(normalized, BLACK, 0.2)
  html.style.setProperty(`${PRE_DARK}-2`, dark)
}

export default changeTheme
