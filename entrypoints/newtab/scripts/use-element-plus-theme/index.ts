import { BLACK, Levels, PRE, PRE_DARK, PRE_LIGHT, WHITE } from './token'

const html = document.documentElement

interface RGBColor {
  r: number
  g: number
  b: number
}

function parseHexColor(color: string): RGBColor {
  const hex = color.substring(1)
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
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
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
  if (!color) {
    console.warn('未获取到颜色的值')
    return
  }
  // 设置主要颜色变量 --el-color-primary
  html.style.setProperty(PRE, color)
  // 循环设置色阶颜色
  // --el-color-primary-light-${level}
  Levels.forEach((level) => {
    html.style.setProperty(`${PRE_LIGHT}-${level}`, mix(color, WHITE, level * 0.1))
  })
  // 设置主要暗色
  // --el-color-primary-dark-2
  const dark = mix(color, BLACK, 0.2)
  html.style.setProperty(`${PRE_DARK}-2`, dark)
}

export default changeTheme
