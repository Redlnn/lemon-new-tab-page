import { computed, ref } from 'vue'

export type SettingsRoute =
  | 'menu'
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
  current: 'menu',
  history: []
})

export function useSettingsRouter() {
  const currentRoute = computed(() => state.value.current)
  const canGoBack = computed(() => state.value.history.length > 0)

  function push(route: SettingsRoute) {
    if (state.value.current !== route) {
      state.value.history.push(state.value.current)
      state.value.current = route
    }
  }

  function back() {
    const previous = state.value.history.pop()
    if (previous) {
      state.value.current = previous
    }
  }

  function reset() {
    state.value.current = 'menu'
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
