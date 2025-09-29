import { type Ref, unref } from 'vue'
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

  // normalize to array of properties
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

    // If already contains all properties, skip
    const currentWill = (target.style.willChange || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const needToAdd = props.filter((p) => !currentWill.includes(p))
    if (needToAdd.length === 0) {
      return
    }

    // set will-change to include existing + needed
    const newWill = Array.from(new Set([...currentWill, ...needToAdd]))
    target.style.willChange = newWill.join(', ')

    // Wait for the next animation frame so callers can `await trigger(...)`
    // to ensure the browser observes the new will-change before applying
    // subsequent style/class changes. Using requestAnimationFrame is
    // clearer than forcing layout via reading offsetHeight.
    try {
      await new Promise<void>((res) => requestAnimationFrame(() => res()))
    } catch {}

    // pending set: properties that still need transitionend
    const pending = new Set(needToAdd)
    let cleared = false
    const node = target

    const onEnd = (e: TransitionEvent) => {
      // if no propertyName, treat as all finished
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

    const stopListener = useEventListener(target, 'transitionend', onEnd)

    // fallback：如果 transitionend 没有触发，timeout 后强制清理
    const { stop } = useTimeoutFn(() => {
      clearAll()
    }, timeout)

    const clearAll = () => {
      if (cleared) {
        return
      }
      cleared = true
      try {
        // remove only the properties we added; keep other will-change values
        const remain = (node.style.willChange || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .filter((v) => !needToAdd.includes(v))
        if (remain.length > 0) {
          node.style.willChange = remain.join(', ')
        } else {
          node.style.willChange = ''
        }
      } catch {}
      stopListener()
      stop()
    }
  }

  return { trigger }
}

export default useTransientWillChange
