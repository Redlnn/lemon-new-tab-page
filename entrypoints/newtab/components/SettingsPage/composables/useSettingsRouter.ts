import { computed, ref } from 'vue'

export enum SettingsRoute {
  MENU = 'menu',
  THEME = 'theme',
  CLOCK = 'clock',
  SEARCH = 'search',
  BACKGROUND = 'background',
  SHORTCUT = 'shortcut',
  YIYAN = 'yiyan',
  PERFORMANCE = 'performance',
  OTHER = 'other'
}

interface MenuItem {
  key: SettingsRoute
  titleKey: string
}

export const MENU_ITEMS: MenuItem[] = [
  { key: SettingsRoute.THEME, titleKey: 'newtab:settings.theme.title' },
  { key: SettingsRoute.CLOCK, titleKey: 'newtab:settings.clock.title' },
  { key: SettingsRoute.SEARCH, titleKey: 'newtab:settings.search.title' },
  { key: SettingsRoute.BACKGROUND, titleKey: 'newtab:settings.background.title' },
  { key: SettingsRoute.SHORTCUT, titleKey: 'newtab:settings.shortcut.title' },
  { key: SettingsRoute.YIYAN, titleKey: 'newtab:settings.yiyan.title' },
  { key: SettingsRoute.PERFORMANCE, titleKey: 'newtab:settings.perf.title' },
  { key: SettingsRoute.OTHER, titleKey: 'newtab:settings.other.title' }
] as const

interface RouteState {
  current: SettingsRoute
  history: SettingsRoute[]
  isForward: boolean // 追踪导航方向以进行动画处理
}

const state = ref<RouteState>({
  current: SettingsRoute.THEME,
  history: [],
  isForward: true
})

export function useSettingsRouter() {
  const currentRoute = computed(() => state.value.current)
  const canGoBack = computed(() => state.value.history.length > 0)
  const isAtMenu = computed(() => state.value.current === SettingsRoute.MENU)
  const isForward = computed(() => state.value.isForward)

  const push = (route: SettingsRoute) => {
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

  const reset = (initialRoute: SettingsRoute = SettingsRoute.THEME) => {
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
