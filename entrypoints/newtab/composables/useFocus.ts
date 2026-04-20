import { FOCUS_STATE } from '@newtab/shared/keys'
import type { FocusState } from '@newtab/shared/keys'

/** 创建聚焦状态（在 App.vue 中调用并 provide） */
export function createFocusState(): FocusState {
  const isFocused = ref(false)
  return reactive({
    isFocused,
    focus: () => {
      isFocused.value = true
    },
    blur: () => {
      isFocused.value = false
    },
  })
}

/** 注入聚焦状态（在子组件中调用） */
export function useFocusState(): FocusState {
  const state = inject(FOCUS_STATE)
  if (!state) throw new Error('FOCUS_STATE not provided — 请确保在 App.vue 中调用了 provide')
  return state
}
