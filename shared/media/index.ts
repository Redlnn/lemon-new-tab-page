export * from './verify'

/**
 * 将Base64编码的SVG转换为SVG标签字符串
 * @param base64String - Base64编码的SVG字符串
 * @returns SVG标签字符串
 * @throws 如果输入不是有效的SVG Base64字符串
 */
export function convertBase64Svg(base64String: string): string {
  try {
    const parts = base64String.split(',', 2)
    if (parts.length !== 2 || !parts[0]!.includes('data:image/svg+xml')) {
      throw new Error('Invalid SVG Base64 string format')
    }

    const decodedSVG = atob(parts[1]!)
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(decodedSVG, 'image/svg+xml')

    if (svgDoc.querySelector('parsererror')) {
      throw new Error('Invalid SVG content')
    }

    return svgDoc.documentElement.outerHTML
  } catch (error) {
    console.error('SVG conversion error:', error)
    throw error
  }
}
