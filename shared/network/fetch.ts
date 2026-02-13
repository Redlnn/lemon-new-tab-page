interface FetchOptions extends RequestInit {
  timeout?: number
  responseType?: 'json' | 'text'
  responseEncoding?: string
}

/**
 * 封装的 fetch 函数，支持超时和错误处理
 */
export async function enhancedFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 2000, responseType = 'json', responseEncoding, ...fetchOptions } = options

  // 添加默认 headers
  const headers = new Headers(fetchOptions.headers)
  // 仅当存在 body 或非 GET 请求时设置默认 Content-Type
  const method = (fetchOptions.method || 'GET').toUpperCase()
  if ((!headers.has('Content-Type') && fetchOptions.body) || method !== 'GET') {
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    // 处理 HTTP 错误状态码
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (responseType === 'text') {
      // 如果指定了编码，使用 TextDecoder 解码
      if (responseEncoding) {
        const buffer = await response.arrayBuffer()
        const decoder = new TextDecoder(responseEncoding)
        return decoder.decode(buffer) as T
      }
      return response.text() as Promise<T>
    }

    return response.json() as Promise<T>
  } catch (error) {
    if (error instanceof Error) {
      // 区分超时/中止错误
      if (error.name === 'AbortError') {
        console.error(`Fetch aborted after ${timeout}ms:`, url)
      } else {
        console.error('Fetch error:', error.message)
      }
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export default enhancedFetch
