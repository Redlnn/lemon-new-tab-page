const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/apng',
  'image/avif',
  'image/bmp',
  'image/tiff'
]

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

/**
 * 检查文件是否为有效的图片文件
 * @param file - 要检查的文件
 * @param extraTypes - 额外允许的MIME类型数组
 * @returns 是否为有效的图片文件
 */
export function isImageFile(file: Blob, extraTypes: string[] = []): boolean {
  const allowedTypes = new Set([...ALLOWED_IMAGE_TYPES, ...extraTypes])
  return allowedTypes.has(file.type)
}

/**
 * 检查文件是否为视频文件
 */
export function isVideoFile(file: Blob, extraTypes: string[] = []): boolean {
  const allowedTypes = new Set([...ALLOWED_VIDEO_TYPES, ...extraTypes])
  return allowedTypes.has(file.type)
}

/**
 * 检查是否为支持的媒体文件（图片或视频）
 */
export function isMediaFile(file: Blob): boolean {
  return isImageFile(file) || isVideoFile(file)
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
 * 验证视频URL是否可访问
 * @param url - 要验证的视频URL
 * @returns Promise<boolean> - URL是否可访问
 */
export async function verifyVideoUrl(url: string): Promise<boolean> {
  if (!url) {
    return false
  }

  return new Promise<boolean>((resolve) => {
    const video = document.createElement('video')
    const cleanup = () => {
      video.onloadeddata = video.onerror = null // 清理事件监听器
      video.src = '' // 清除视频源，帮助浏览器更快地进行垃圾回收
    }

    video.onloadeddata = () => {
      cleanup()
      resolve(true)
    }
    video.onerror = () => {
      cleanup()
      resolve(false)
    }
    video.src = url
  })
}
