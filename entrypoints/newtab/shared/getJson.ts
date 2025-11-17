export function downloadJSON<T>(obj: T, filename: string) {
  const jsonStr = JSON.stringify(obj, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename

  // 直接 click，不插入 DOM
  a.click()

  URL.revokeObjectURL(url)
}
