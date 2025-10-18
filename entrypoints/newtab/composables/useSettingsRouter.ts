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

// Special route for mobile menu view
export type SettingsRouteOrMenu = SettingsRoute | 'menu'

interface RouteState {
  current: SettingsRouteOrMenu
  history: SettingsRouteOrMenu[]
}

const state = ref<RouteState>({
  current: 'theme',
  history: []
})

export function useSettingsRouter() {
  const currentRoute = computed(() => state.value.current)
  const canGoBack = computed(() => state.value.history.length > 0)
  const isAtMenu = computed(() => state.value.current === 'menu')

  const push = (route: SettingsRouteOrMenu) => {
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

  const reset = (initialRoute: SettingsRouteOrMenu = 'theme') => {
    state.value.current = initialRoute
    state.value.history = []
  }

  return {
    currentRoute,
    canGoBack,
    isAtMenu,
    push,
    back,
    reset
  }
}
