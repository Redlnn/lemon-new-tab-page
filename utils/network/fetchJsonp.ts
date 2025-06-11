import { enhancedFetch } from './fetch'

interface fetchJsonpOptions {
  url: string
  params: Record<string, string>
  callbackParam: string
  callbackName: string
  parser: (data: string) => string[]
  encoding?: string // 可选的编码参数
}

/**
 * JSONP 请求实现
 * @param options JSONP 选项
 * @returns 搜索建议列表
 */
async function fetchJsonp(options: fetchJsonpOptions): Promise<string[]> {
  const { url, params, callbackParam, callbackName } = options
  const queryParams = new URLSearchParams(params)
  queryParams.set(callbackParam, callbackName)

  const fullUrl = `${url}?${queryParams.toString()}`

  try {
    const response = await enhancedFetch<string>(fullUrl, {
      responseType: 'text',
      responseEncoding: options.encoding,
      headers: {
        'Content-Type': 'text/plain'
      }
    })

    return options.parser(response)
  } catch (error) {
    console.error('JSONP request failed:', error)
    return [] // 返回空数组作为降级处理
  }
}

export default fetchJsonp
