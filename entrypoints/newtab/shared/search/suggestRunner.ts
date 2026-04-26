export type SuggestFetcher = (text: string) => Promise<string[]>

export interface SuggestRunnerOptions {
  debounceMs?: number
  maxRetries?: number
  retryDelay?: number
}

export interface SuggestRunnerResult {
  text: string
  list: string[]
}

export interface SuggestRunner {
  run: (text: string, fetcher: SuggestFetcher) => void
  cancel: () => void
  onResult: (cb: (result: SuggestRunnerResult) => void) => void
  onError: (cb: (err: unknown, text: string) => void) => void
}

/**
 * 统一封装“请求 + 重试 + 取消 + 防抖”的建议获取器
 */
export function createSuggestRunner(options: SuggestRunnerOptions = {}): SuggestRunner {
  const { debounceMs = 200, maxRetries = 0, retryDelay = 100 } = options

  let timer: ReturnType<typeof setTimeout> | undefined
  let abortCurrent: (() => void) | undefined
  let resultCb: ((result: SuggestRunnerResult) => void) | undefined
  let errorCb: ((err: unknown, text: string) => void) | undefined
  let runVersion = 0

  const cancel = () => {
    runVersion += 1
    if (timer != null) {
      clearTimeout(timer)
      timer = undefined
    }
    abortCurrent?.()
    abortCurrent = undefined
  }

  const run = (text: string, fetcher: SuggestFetcher) => {
    const currentRunVersion = ++runVersion
    if (timer != null) {
      clearTimeout(timer)
      timer = undefined
    }
    abortCurrent?.()
    abortCurrent = undefined
    // 防抖
    timer = setTimeout(async () => {
      if (currentRunVersion !== runVersion) {
        return
      }
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
            if (!canceled && currentRunVersion === runVersion) {
              resultCb?.({ text, list })
            }
            break
          } catch (err) {
            if (canceled) {
              break
            }
            if (attempt >= maxRetries) {
              if (!canceled && currentRunVersion === runVersion) {
                errorCb?.(err, text)
              }
              break
            }
            attempt += 1
            await new Promise((r) => setTimeout(r, retryDelay))
          }
        }
      } finally {
        if (currentRunVersion === runVersion) {
          abortCurrent = undefined
        }
      }
    }, debounceMs)
  }

  return {
    run,
    cancel,
    onResult: (cb) => {
      resultCb = cb
    },
    onError: (cb) => {
      errorCb = cb
    },
  }
}
