import { computed, ref } from 'vue'

export type SettingsRoute =
  | 'theme'
  | 'clock'
  | 'search'
  | 'background'
  | 'shortcut'
  | 'yiyan'
  | 'performance'
  | 'other'

interface RouteState {
  current: SettingsRoute
  history: SettingsRoute[]
}

const state = ref<RouteState>({
  current: 'theme',
  history: []
})

export function useSettingsRouter() {
  const currentRoute = computed(() => state.value.current)
  const canGoBack = computed(() => state.value.history.length > 0)

  const push = (route: SettingsRoute) => {
    if (state.value.current !== route) {
      state.value.history.push(state.value.current)
      state.value.current = route
    }
  }

  const back = () => {
    const previous = state.value.history.pop()
    if (previous) {
      state.value.current = previous
    }
  }

  const reset = () => {
    state.value.current = 'theme'
    state.value.history = []
  }

  return {
    currentRoute,
    canGoBack,
    push,
    back,
    reset
  }
}
