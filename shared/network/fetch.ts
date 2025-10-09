/**
 * 创建一个可以被中止的 Promise
 */
function createAbortablePromise<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const controller = new AbortController()
  const { signal } = controller

  const timeoutPromise = new Promise<T>((_, reject) => {
    const timeout = setTimeout(() => {
      controller.abort()
      reject(new Error(`Request timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    // 清理定时器
    signal.addEventListener('abort', () => clearTimeout(timeout))
  })

  const fetchPromise = promise.finally(() => controller.abort())

  return Promise.race([fetchPromise, timeoutPromise])
}

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
  const { signal } = controller

  try {
    const response = await createAbortablePromise(
      fetch(url, {
        ...fetchOptions,
        headers,
        signal
      }),
      timeout
    )

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
      console.error('Fetch error:', error.message)
    }
    throw error
  }
}

export default enhancedFetch
