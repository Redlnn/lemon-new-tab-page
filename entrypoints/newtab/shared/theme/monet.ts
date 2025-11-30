import {
  argbFromRgb,
  hexFromArgb,
  QuantizerCelebi,
  type Rgba,
  rgbaFromArgb,
  Scheme,
  Score,
  themeFromSourceColor
} from '@material/material-color-utilities'

import { mixLegacy } from './mix'
import { BLACK_COLOR, EL_BG_COLOR_RGBA, WHITE_COLOR } from './token'
import { rgba2Hex } from './utils'

const shadeCache = new WeakMap<Rgba, ReturnType<typeof buildColorShades>>()

function getColorShades(base: Rgba) {
  if (!shadeCache.has(base)) shadeCache.set(base, buildColorShades(base))
  return shadeCache.get(base)!
}

/** 生成明/暗色调 */
function buildColorShades(base: Rgba) {
  return {
    light: {
      3: rgba2Hex(mixLegacy(base, WHITE_COLOR, 70)),
      5: rgba2Hex(mixLegacy(base, WHITE_COLOR, 50)),
      7: rgba2Hex(mixLegacy(base, WHITE_COLOR, 30)),
      8: rgba2Hex(mixLegacy(base, WHITE_COLOR, 20)),
      9: rgba2Hex(mixLegacy(base, WHITE_COLOR, 10)),
      dark2: rgba2Hex(mixLegacy(base, BLACK_COLOR, 70))
    },
    dark: {
      3: rgba2Hex(mixLegacy(base, EL_BG_COLOR_RGBA, 70)),
      5: rgba2Hex(mixLegacy(base, EL_BG_COLOR_RGBA, 50)),
      7: rgba2Hex(mixLegacy(base, EL_BG_COLOR_RGBA, 30)),
      8: rgba2Hex(mixLegacy(base, EL_BG_COLOR_RGBA, 20)),
      9: rgba2Hex(mixLegacy(base, EL_BG_COLOR_RGBA, 10)),
      dark2: rgba2Hex(mixLegacy(base, WHITE_COLOR, 70))
    }
  }
}

/** 生成变量表（减少重复） */
function buildCssVars(scheme: Scheme, mode: 'light' | 'dark') {
  const textMix = mode === 'light' ? WHITE_COLOR : EL_BG_COLOR_RGBA

  const pHex = hexFromArgb(scheme.primary)
  const sHex = hexFromArgb(scheme.tertiary)
  const eHex = hexFromArgb(scheme.error)
  const iHex = hexFromArgb(scheme.secondary)

  const primary = rgbaFromArgb(scheme.primary)
  const success = rgbaFromArgb(scheme.tertiary)
  const error = rgbaFromArgb(scheme.error)
  const info = rgbaFromArgb(scheme.secondary)

  const pShades = getColorShades(primary)[mode]
  const sShades = getColorShades(success)[mode]
  const eShades = getColorShades(error)[mode]
  const iShades = getColorShades(info)[mode]

  return {
    '--el-color-primary': pHex,
    '--el-color-primary-light-3': pShades[3],
    '--el-color-primary-light-5': pShades[5],
    '--el-color-primary-light-7': pShades[7],
    '--el-color-primary-light-8': pShades[8],
    '--el-color-primary-light-9': pShades[9],
    '--el-color-primary-dark-2': pShades.dark2,

    '--el-color-success': sHex,
    '--el-color-success-light-3': sShades[3],
    '--el-color-success-light-5': sShades[5],
    '--el-color-success-light-7': sShades[7],
    '--el-color-success-light-8': sShades[8],
    '--el-color-success-light-9': sShades[9],
    '--el-color-success-dark-2': sShades.dark2,

    '--el-color-warning': mode === 'light' ? '#835500' : '#ffb955',
    '--el-color-warning-light-3': mode === 'light' ? '#a8884d' : '#bc8b45',
    '--el-color-warning-light-5': mode === 'light' ? '#c1aa80' : '#8f6c3a',
    '--el-color-warning-light-7': mode === 'light' ? '#daccb3' : '#624d2f',
    '--el-color-warning-light-8': mode === 'light' ? '#e6ddcc' : '#4c3e2a',
    '--el-color-warning-light-9': mode === 'light' ? '#f3eee6' : '#352e24',
    '--el-color-warning-dark-2': mode === 'light' ? '#5c3b00' : '#ffce88',

    '--el-color-danger': eHex,
    '--el-color-danger-light-3': eShades[3],
    '--el-color-danger-light-5': eShades[5],
    '--el-color-danger-light-7': eShades[7],
    '--el-color-danger-light-8': eShades[8],
    '--el-color-danger-light-9': eShades[9],
    '--el-color-danger-dark-2': eShades.dark2,

    '--el-color-error': eHex,
    '--el-color-error-light-3': eShades[3],
    '--el-color-error-light-5': eShades[5],
    '--el-color-error-light-7': eShades[7],
    '--el-color-error-light-8': eShades[8],
    '--el-color-error-light-9': eShades[9],
    '--el-color-error-dark-2': eShades.dark2,

    '--el-color-info': iHex,
    '--el-color-info-light-3': iShades[3],
    '--el-color-info-light-5': iShades[5],
    '--el-color-info-light-7': iShades[7],
    '--el-color-info-light-8': iShades[8],
    '--el-color-info-light-9': iShades[9],
    '--el-color-info-dark-2': iShades.dark2,

    '--el-bg-color': hexFromArgb(scheme.surface),
    '--el-bg-color-page': hexFromArgb(scheme.background),
    '--el-bg-color-overlay': hexFromArgb(scheme.surface),

    '--el-text-color-primary': hexFromArgb(scheme.onSurface),
    '--el-text-color-regular': hexFromArgb(scheme.onSurfaceVariant),
    '--el-text-color-secondary': rgba2Hex(
      mixLegacy(rgbaFromArgb(scheme.onSurfaceVariant), textMix, 60)
    )
  }
}

/**
 * 重写了 @material/material-color-utilities 中基于图片提取主题色的逻辑
 * 将图片缩放至128x128以内，并可选择只裁剪中心区域
 * 以便给 QuantizerCelebi.quantize 传入裁剪和缩放后的像素数据，控制性能和效果
 *
 * @param image HTMLImageElement
 * @param cropCenter 是否裁剪只要中心区域
 */
async function getSourceColorFromImage(
  image: HTMLImageElement,
  cropCenter = false
): Promise<number> {
  if (!image.complete) {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Image load failed'))
    })
  }

  const MAX_SIZE = 128
  const { naturalWidth, naturalHeight } = image

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  let sx = 0
  let sy = 0
  let sw = naturalWidth
  let sh = naturalHeight

  if (cropCenter) {
    sx = Math.floor(naturalWidth * 0.25)
    sy = Math.floor(naturalHeight * 0.25)
    sw = Math.floor(naturalWidth * 0.5)
    sh = Math.floor(naturalHeight * 0.5)
  }

  let width = sw
  let height = sh

  if (sw > MAX_SIZE || sh > MAX_SIZE) {
    const ratio = Math.min(MAX_SIZE / sw, MAX_SIZE / sh)
    width = Math.round(sw * ratio)
    height = Math.round(sh * ratio)
  }

  canvas.width = width
  canvas.height = height
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height)

  // 获取像素数据
  const imageData = ctx.getImageData(0, 0, width, height).data
  const pixels: number[] = []

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i]
    const g = imageData[i + 1]
    const b = imageData[i + 2]
    const a = imageData[i + 3]

    if (a === undefined || r === undefined || g === undefined || b === undefined || a < 255) {
      continue
    }

    pixels.push(argbFromRgb(r, g, b))
  }

  // 量化和评分
  const result = QuantizerCelebi.quantize(pixels, 128)
  const ranked = Score.score(result)
  const top = ranked[0]

  if (top === undefined) {
    throw new Error('No suitable color found')
  }

  return top
}

export async function applyMonet(image: HTMLImageElement | undefined, cropCenter = false) {
  if (!image) return

  const STYLE_ID = 'monet'
  let styleTag = document.getElementById(STYLE_ID) as HTMLStyleElement | null

  if (!styleTag) {
    styleTag = document.createElement('style')
    styleTag.id = STYLE_ID
    styleTag.type = 'text/css'
    document.head.appendChild(styleTag)
  }

  let sourceColor: number
  try {
    sourceColor = await getSourceColorFromImage(image, cropCenter)
  } catch (e) {
    console.error('Failed to extract source color for Monet theme:', e)
    return
  }

  const theme = themeFromSourceColor(sourceColor)

  const cssLight = buildCssVars(theme.schemes.light, 'light')
  const cssDark = buildCssVars(theme.schemes.dark, 'dark')

  const toCssText = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `${k}: ${v};`)
      .join('')

  styleTag.textContent = `html.monet{${toCssText(cssLight)}}html.dark.monet{${toCssText(cssDark)}}`
}
