import type { Rgba } from '@material/material-color-utilities'

/**
 * Sass legacy color.mix 算法
 * https://github.com/sass/dart-sass/blame/main/lib/src/functions/color.dart#L1509
 * @param color1 第一个颜色（legacy）
 * @param color2 第二个颜色（legacy）
 * @param weight 权重 0-100，默认 50
 * @returns 混合后的颜色 { r, g, b, a }
 */
export function mixLegacy(color1: Rgba, color2: Rgba, weight: number = 50): Rgba {
  // 1. 限制权重在 0-100
  const w = Math.min(Math.max(weight, 0), 100) / 100

  // 2. 归一化到 [-1, 1]
  const wNorm = w * 2 - 1

  // 3. Alpha 差值
  const a1 = color1.a > 1 ? color1.a / 255 : color1.a
  const a2 = color2.a > 1 ? color2.a / 255 : color2.a
  const aDiff = a1 - a2

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
