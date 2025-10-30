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

export function getFaviconURLChrome(url: string, size = '128') {
  const _url = new URL(chrome.runtime.getURL('/_favicon/'))
  _url.searchParams.set('pageUrl', encodeURI(url)) // 同时对 URL 本身进行编码
  _url.searchParams.set('size', size)
  return _url.toString()
}

export function getFaviconURL(url: string | null): Ref<string> {
  const iconUrl = ref('/favicon.png')

  if (!url) {
    return iconUrl
  }

  if (import.meta.env.CHROME || import.meta.env.EDGE) {
    iconUrl.value = getFaviconURLChrome(url)
    return iconUrl
  }

  const primary = new URL('/favicon.ico', url).toString()

  const img = new Image()
  img.onload = () => (iconUrl.value = primary)
  img.onerror = () => (iconUrl.value = '/favicon.png')
  img.src = primary

  return iconUrl
}
