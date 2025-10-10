export type SuggestFetcher = (text: string) => Promise<string[]>

export interface SuggestRunnerOptions {
  debounceMs?: number
  maxRetries?: number
  retryDelay?: number
}

export interface SuggestRunner {
  run: (text: string, fetcher: SuggestFetcher) => void
  cancel: () => void
  onResult: (cb: (list: string[]) => void) => void
  onError: (cb: (err: unknown) => void) => void
}

/**
 * 统一封装“请求 + 重试 + 取消 + 防抖”的建议获取器
 */
export function createSuggestRunner(options: SuggestRunnerOptions = {}): SuggestRunner {
  const { debounceMs = 200, maxRetries = 0, retryDelay = 100 } = options

  let timer: number | undefined
  let abortCurrent: (() => void) | undefined
  let resultCb: ((list: string[]) => void) | undefined
  let errorCb: ((err: unknown) => void) | undefined

  const cancel = () => {
    if (timer != null) {
      clearTimeout(timer)
      timer = undefined
    }
    abortCurrent?.()
    abortCurrent = undefined
  }

  const run = (text: string, fetcher: SuggestFetcher) => {
    cancel()
    // 防抖
    timer = setTimeout(async () => {
      // 简单的“取消”机制：使用一个已解析的 Promise 短路
      let canceled = false
      abortCurrent = () => {
        canceled = true
      }

      try {
        let attempt = 0
        while (true) {
          try {
            const list = await fetcher(text)
            if (!canceled) {
              resultCb?.(list)
            }
            break
          } catch (err) {
            if (canceled) {
              break
            }
            if (attempt >= maxRetries) {
              if (!canceled) {
                errorCb?.(err)
              }
              break
            }
            attempt += 1
            await new Promise((r) => setTimeout(r, retryDelay))
          }
        }
      } finally {
        abortCurrent = undefined
      }
    }, debounceMs) as unknown as number
  }

  return {
    run,
    cancel,
    onResult: (cb) => {
      resultCb = cb
    },
    onError: (cb) => {
      errorCb = cb
    }
  }
}
