export function isImageFile(file: Blob, extra?: string[]) {
  const imageType = ['png', 'jpeg', 'jpg', 'gif', 'webp', ...(extra || [])]

  let fileType = file.type
  fileType = fileType.substring(fileType.lastIndexOf('/') + 1, fileType.length)

  return imageType.includes(fileType)
}

export async function verifyImageUrl(url: string) {
  if (url.length === 0) {
    return false
  }

  const tempImg = new Image()
  tempImg.src = url

  try {
    await new Promise((resolve, reject) => {
      tempImg.onload = resolve
      tempImg.onerror = reject
    })
    return true
  } catch {
    return false
  } finally {
    tempImg.remove()
  }
}

export function convertBase64Svg(str: string) {
  // 将 data:image/svg+xml 开头的 svg 文件的 base64 字符串转换为 <svg> 标签
  const decodedSVG = atob(str.split(',')[1])
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(decodedSVG, 'image/svg+xml')
  return svgDoc.documentElement.outerHTML
}
