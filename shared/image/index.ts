const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/**
 * 检查文件是否为有效的图片文件
 * @param file - 要检查的文件
 * @param extraTypes - 额外允许的MIME类型数组
 * @returns 是否为有效的图片文件
 */
export function isImageFile(file: Blob, extraTypes: string[] = []): boolean {
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...extraTypes]
  return allowedTypes.includes(file.type)
}

/**
 * 验证图片URL是否可访问
 * @param url - 要验证的图片URL
 * @returns Promise<boolean> - URL是否可访问
 */
export async function verifyImageUrl(url: string): Promise<boolean> {
  if (!url) {
    return false
  }

  return new Promise<boolean>((resolve) => {
    const img = new Image()
    const cleanup = () => {
      img.onload = img.onerror = null // 清理事件监听器
      img.src = '' // 清除图片源，帮助浏览器更快地进行垃圾回收
    }

    img.onload = () => {
      cleanup()
      resolve(true)
    }
    img.onerror = () => {
      cleanup()
      resolve(false)
    }
    img.src = url
  })
}

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
