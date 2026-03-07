function parseMajorMinor(value: string): [number, number] | null {
  const [majorStr, minorStr] = value.split('.')
  if (majorStr == null || minorStr == null) return null
  const major = Number(majorStr)
  const minor = Number(minorStr)
  if (Number.isNaN(major) || Number.isNaN(minor)) return null
  return [major, minor]
}

export function shouldShowChangelog(previousVersion: string, nextVersion: string): boolean {
  const nextMajorMinor = parseMajorMinor(nextVersion)
  if (!nextMajorMinor) return false
  const previousMajorMinor = parseMajorMinor(previousVersion)
  if (!previousMajorMinor) return true
  if (previousMajorMinor[0] < nextMajorMinor[0]) return true
  if (previousMajorMinor[0] > nextMajorMinor[0]) return false
  return previousMajorMinor[1] < nextMajorMinor[1]
}

/**
 * 校验 URL 是否合法
 */
export function isValidUrl(url: string) {
  try {
    const urlToCheck = url.includes('://') ? url : `http://${url}`
    new URL(urlToCheck)
    return true
  } catch {
    return false
  }
}

/**
 * 格式化 URL，如果没有协议则自动补全 https://
 */
export function formatUrl(url: string) {
  let finalUrl = url.trim()
  if (!finalUrl.includes('://')) {
    finalUrl = `https://${finalUrl}`
  }
  return finalUrl
}
