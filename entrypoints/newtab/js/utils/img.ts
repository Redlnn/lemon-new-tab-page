export function isImageFile(file: Blob) {
  const imageType = ['png', 'jpeg', 'jpg', 'gif', 'webp']

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
