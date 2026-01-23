import { hex2rgba } from './utils'

// 缓存常用颜色的 RGBA 对象，避免重复解析
export const WHITE_COLOR = { r: 255, g: 255, b: 255, a: 255 } as Rgba
export const BLACK_COLOR = { r: 0, g: 0, b: 0, a: 255 } as Rgba

export const THEME_STYLE_ELEMENT_ID = 'lemon-element-plus-theme'
export const LIGHT_SELECTOR = 'html.light'
export const DARK_SELECTOR = 'html.dark'

/** 色阶 */
export const Levels = [3, 5, 7, 8, 9] as const

/** Element Plus 深色模式背景色 */
export const EL_BG_COLOR = '#1f1f1f' as const
export const EL_BG_COLOR_RGBA = hex2rgba(EL_BG_COLOR)
