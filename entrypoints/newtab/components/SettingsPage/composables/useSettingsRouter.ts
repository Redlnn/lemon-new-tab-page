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

// 移动端才有'menu'选项
export type SettingsRouteOrMenu = SettingsRoute | 'menu'

interface RouteState {
  current: SettingsRouteOrMenu
  history: SettingsRouteOrMenu[]
  isForward: boolean // 追踪导航方向以进行动画处理
}

const state = ref<RouteState>({
  current: 'theme',
  history: [],
  isForward: true
})

export function useSettingsRouter() {
  const currentRoute = computed(() => state.value.current)
  const canGoBack = computed(() => state.value.history.length > 0)
  const isAtMenu = computed(() => state.value.current === 'menu')
  const isForward = computed(() => state.value.isForward)

  const push = (route: SettingsRouteOrMenu) => {
    if (state.value.current !== route) {
      state.value.history.push(state.value.current)
      state.value.current = route
      state.value.isForward = true // 向前导航
    }
  }

  const back = () => {
    const previous = state.value.history.pop()
    if (previous) {
      state.value.isForward = false // 向后导航
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
    isForward,
    push,
    back,
    reset
  }
}
