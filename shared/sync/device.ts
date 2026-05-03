const detectBrowserName = (ua: string): string => {
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('OPR/')) return 'Opera'
  if (ua.includes('Chrome/')) return 'Chrome'
  if (ua.includes('Safari/')) return 'Safari'
  return 'Browser'
}

const detectPlatformName = (platform: string, ua: string): string => {
  if (platform.includes('Win')) return 'Windows'
  if (platform.includes('Mac')) return 'macOS'
  if (platform.includes('Linux')) return 'Linux'
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  return 'Unknown OS'
}

export const createDeviceId = (): string => crypto.randomUUID()

export function detectDeviceName(): string {
  const ua = navigator.userAgent || ''
  const platform = navigator.platform || ''
  const browser = detectBrowserName(ua)
  const os = detectPlatformName(platform, ua)
  return `${browser} on ${os}`
}
