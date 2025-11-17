import { EL_BG_COLOR, Levels, PRE, PRE_DARK, PRE_LIGHT } from './token'

const THEME_STYLE_ELEMENT_ID = 'lemon-element-plus-theme'
const LIGHT_SELECTOR = 'html:not(.dark)'
const DARK_SELECTOR = 'html.dark'

const themeEntriesBySelector = new Map<string, Array<[string, string]>>()

interface Color {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
  a: number // 0-1
}

// 缓存常用颜色的 RGBA 对象，避免重复解析
const WHITE_COLOR = { r: 255, g: 255, b: 255, a: 1 } as Color
const BLACK_COLOR = { r: 0, g: 0, b: 0, a: 1 } as Color
const EL_BG_COLOR_RGBA = hex2rgba(EL_BG_COLOR)

function getThemeStyleElement(): HTMLStyleElement {
  let style = document.getElementById(THEME_STYLE_ELEMENT_ID) as HTMLStyleElement | null

  if (!style) {
    style = document.createElement('style')
    style.id = THEME_STYLE_ELEMENT_ID
    style.type = 'text/css'
    // 使用专用 style 标签存放主题变量，避免污染其他内联样式
    document.head.appendChild(style)
  }

  return style
}

function updateThemeStyleElement() {
  const style = getThemeStyleElement()

  const blocks = Array.from(themeEntriesBySelector.entries()).map(([sel, decls]) => {
    const declarations = decls.map(([name, value]) => `  ${name}: ${value};`).join('\n')
    return `${sel} {\n${declarations}\n}`
  })

  style.textContent = blocks.join('\n')
}

/**
 * 校验是否为支持的 HEX 颜色格式：#RGB/#RGBA/#RRGGBB/#RRGGBBAA
 */
function isValidHexColor(input: string): boolean {
  // 支持 #RGB, #RGBA, #RRGGBB, #RRGGBBAA
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(input)
}

/**
 * 将 #RGB/#RGBA 规范化为 #RRGGBB/#RRGGBBAA
 */
function normalizeTo6Hex(color: string): string {
  const hex = color.slice(1) // 去掉 #
  const len = hex.length

  // 如果已经是 6 位或 8 位,直接返回
  if (len === 6 || len === 8) {
    return color
  }

  // 如果是 3 位或 4 位,展开每一位
  // #RGB -> #RRGGBB, #RGBA -> #RRGGBBAA
  if (len === 3 || len === 4) {
    return (
      '#' +
      hex
        .split('')
        .map((c) => c + c)
        .join('')
    )
  }

  return color
}

function hex2rgba(color: string): Color {
  // 先规范化
  const normalized = normalizeTo6Hex(color)
  const hex = normalized.slice(1) // 去掉 #

  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)

  // 如果有 alpha 通道
  let a = 1
  if (hex.length === 8) {
    a = Number.parseInt(hex.slice(6, 8), 16) / 255
  }

  return { r, g, b, a }
}

/**
 * 将 0-255 的数值转为 2 位 16 进制字符串
 */
function toHex(n: number): string {
  return Math.round(n).toString(16).padStart(2, '0')
}

function rgba2Hex({ r, g, b, a }: Color): string {
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`

  // 如果 alpha 不是 1,添加 alpha 通道
  return a !== 1 ? `${hex}${toHex(a * 255)}` : hex
}

/**
 * Sass legacy color.mix 算法
 * https://github.com/sass/dart-sass/blame/main/lib/src/functions/color.dart#L1509
 * @param color1 第一个颜色（legacy）
 * @param color2 第二个颜色（legacy）
 * @param weight 权重 0-100，默认 50
 * @returns 混合后的颜色
 */
function mixLegacy(color1: Color, color2: Color, weight: number = 50): Color {
  // 1. 限制权重在 0-100
  const w = Math.min(Math.max(weight, 0), 100) / 100

  // 2. 归一化到 [-1, 1]
  const wNorm = w * 2 - 1

  // 3. Alpha 差值
  const aDiff = color1.a - color2.a

  // 4. 组合权重
  let combined: number
  if (wNorm * aDiff === -1) {
    combined = wNorm
  } else {
    combined = (wNorm + aDiff) / (1 + wNorm * aDiff)
  }

  // 5. 转回 [0,1]
  const weight1 = (combined + 1) / 2
  const weight2 = 1 - weight1

  // 6. RGB 加权
  const r = color1.r * weight1 + color2.r * weight2
  const g = color1.g * weight1 + color2.g * weight2
  const b = color1.b * weight1 + color2.b * weight2

  // 7. Alpha 加权（直接线性）
  const a = color1.a * w + color2.a * (1 - w)

  return { r, g, b, a }
}

/**
 * 应用主题色到 CSS 变量
 * @param baseColor 基础颜色对象
 * @param lightMixColor 用于混合生成浅色色阶的颜色
 * @param darkMixColor 用于混合生成暗色的颜色
 */
function applyThemeColors(baseColor: Color, lightMixColor: Color, darkMixColor: Color) {
  const entries: Array<[string, string]> = []

  // 循环设置色阶颜色
  // --el-color-primary-light-${level}
  Levels.forEach((level) => {
    const mixed = mixLegacy(baseColor, lightMixColor, 100 - level * 10)
    entries.push([`${PRE_LIGHT}-${level}`, rgba2Hex(mixed)])
  })

  // 设置主要暗色
  // --el-color-primary-dark-2
  const dark = mixLegacy(baseColor, darkMixColor, 80)
  entries.push([`${PRE_DARK}-2`, rgba2Hex(dark)])

  return entries
}

/**
 * 更换主题色
 * @param color HEX 格式的颜色值
 * @param isDark 是否为深色模式
 */
function changeTheme(color: string) {
  const trimmedColor = color.trim()
  if (!isValidHexColor(trimmedColor)) {
    console.warn('[主题] 无效的主题色（需为 #RGB/#RGBA/#RRGGBB/#RRGGBBAA）:', color)
    return
  }

  // 规范化为 #RRGGBB，避免后续解析歧义
  const normalized = normalizeTo6Hex(color)

  const baseColor = hex2rgba(normalized)

  const lightEntries: Array<[string, string]> = [
    [PRE, normalized],
    ...applyThemeColors(baseColor, WHITE_COLOR, BLACK_COLOR)
  ]

  const darkEntries: Array<[string, string]> = [
    [PRE, normalized],
    ...applyThemeColors(baseColor, EL_BG_COLOR_RGBA, WHITE_COLOR)
  ]

  themeEntriesBySelector.set(LIGHT_SELECTOR, lightEntries)
  themeEntriesBySelector.set(DARK_SELECTOR, darkEntries)

  updateThemeStyleElement()
}

export default changeTheme
