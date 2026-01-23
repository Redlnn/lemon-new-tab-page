import { mixLegacy } from './mix'
import {
  BLACK_COLOR,
  DARK_SELECTOR,
  EL_BG_COLOR_RGBA,
  Levels,
  LIGHT_SELECTOR,
  THEME_STYLE_ELEMENT_ID,
  WHITE_COLOR
} from './token'
import { hex2rgba, isValidHexColor, normalizeTo6Hex, rgba2Hex } from './utils'

const themeEntriesBySelector = new Map<string, Array<[string, string]>>()

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
 * 应用主题色到 CSS 变量
 * @param baseColor 基础颜色对象
 * @param lightMixColor 用于混合生成浅色色阶的颜色
 * @param darkMixColor 用于混合生成暗色的颜色
 */
function generateThemeEntries(
  baseColor: Rgba,
  lightMixColor: Rgba,
  darkMixColor: Rgba,
  pre: string
) {
  const entries: Array<[string, string]> = []

  // 循环设置色阶颜色
  // --el-color-primary-light-${level}
  for (let i = 0; i < Levels.length; i++) {
    const level = Levels[i]!
    const mixed = mixLegacy(baseColor, lightMixColor, 100 - level * 10)
    entries.push([`${pre}-light-${level}`, rgba2Hex(mixed)])
  }

  // 设置主要暗色
  // --el-color-primary-dark-2
  const dark = mixLegacy(baseColor, darkMixColor, 80)
  entries.push([`${pre}-dark-2`, rgba2Hex(dark)])

  return entries
}

/**
 * 更换主题色
 * @param color HEX 格式的颜色值
 */
export function changeTheme(color: string) {
  const trimmedColor = color.trim()
  if (!isValidHexColor(trimmedColor)) {
    console.warn('[主题] 无效的主题色（需为 #RGB/#RGBA/#RRGGBB/#RRGGBBAA）:', color)
    return
  }

  // 规范化为 #RRGGBB，避免后续解析歧义
  const normalized = normalizeTo6Hex(color)

  const baseColor = hex2rgba(normalized)

  const lightEntries: Array<[string, string]> = [
    ['--el-color-primary', normalized],
    ...generateThemeEntries(baseColor, WHITE_COLOR, BLACK_COLOR, '--el-color-primary')
  ]

  const darkEntries: Array<[string, string]> = [
    ['--el-color-primary', normalized],
    ...generateThemeEntries(baseColor, EL_BG_COLOR_RGBA, WHITE_COLOR, '--el-color-primary')
  ]

  themeEntriesBySelector.set(LIGHT_SELECTOR, lightEntries)
  themeEntriesBySelector.set(DARK_SELECTOR, darkEntries)

  updateThemeStyleElement()
}
