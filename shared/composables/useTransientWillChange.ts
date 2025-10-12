import { useEventListener, useTimeoutFn } from '@vueuse/core'

export function useTransientWillChange(options?: {
  property?: string | string[]
  timeout?: number
}) {
  // 为了避免一直保留 will-change（可能导致性能/合成层开销），
  // 只在即将触发动画前添加 will-change，并在动画结束后移除。
  // 默认只处理 transform
  const propOpt = options?.property ?? 'transform'
  const timeout = options?.timeout ?? 1000

  // 规范化为属性数组
  const normalizeProps = (p: string | string[]) => (Array.isArray(p) ? p.map(String) : [String(p)])

  const trigger = async (el?: Ref<HTMLElement | undefined>, property?: string | string[]) => {
    if (!el) {
      return
    }

    const target = unref(el)

    if (!target) {
      return
    }

    const props = normalizeProps(property ?? propOpt)

    // 如果已包含所有属性，直接跳过
    const currentWill = (target.style.willChange || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    // 使用 Set 进行 O(1) 包含判断，避免在数组上多次 includes
    const currentSet = new Set(currentWill)
    const needToAdd = props.filter((p) => !currentSet.has(p))
    if (needToAdd.length === 0) {
      return
    }

    // 设置 will-change：保留已有并加入需要的属性
    const newWillSet = new Set<string>([...currentWill, ...needToAdd])
    target.style.willChange = [...newWillSet].join(', ')

    // 等待下一帧：使调用方可以 `await trigger(...)`，确保浏览器观测到 will-change
    // 再应用后续样式/类变更。使用 requestAnimationFrame 比通过读取 offsetHeight 强制回流更明确
    try {
      await new Promise<void>((res) => requestAnimationFrame(() => res()))
    } catch {}

    // 待完成集合：仍需等待 transitionend 的属性
    const pending = new Set(needToAdd)
    let cleared = false
    const node = target

    // 占位：稍后赋值，以便在 clearAll 中调用
    let stopListener: () => void = () => {}
    let timeoutStop: () => void = () => {}

    // 提前声明，便于阅读（回调中会引用该函数）
    const clearAll = () => {
      if (cleared) {
        return
      }
      cleared = true
      try {
        // 仅移除这次添加的属性；保留其他 will-change 的值
        const removeSet = new Set(needToAdd)
        const remain = (node.style.willChange || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .filter((v) => !removeSet.has(v))
        if (remain.length > 0) {
          node.style.willChange = remain.join(', ')
        } else {
          node.style.willChange = ''
        }
      } catch {}
      stopListener()
      timeoutStop()
    }

    const onEnd = (e: TransitionEvent) => {
      // 如果没有 propertyName，视为全部完成
      if (!e.propertyName) {
        clearAll()
        return
      }
      const name = e.propertyName
      if (pending.has(name)) {
        pending.delete(name)
      }
      if (pending.size === 0) {
        clearAll()
      }
    }

    stopListener = useEventListener(target, 'transitionend', onEnd)

    // fallback：如果 transitionend 没有触发，timeout 后强制清理
    {
      const { stop } = useTimeoutFn(() => {
        clearAll()
      }, timeout)
      timeoutStop = stop
    }
  }

  return { trigger }
}

export default useTransientWillChange
