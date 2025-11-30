import {
  AppstoreOutlined,
  ClockCircleOutlined,
  ControlOutlined,
  PictureOutlined,
  SearchOutlined
} from '@vicons/antd'
import {
  ApiRound,
  BookmarkBorderRound,
  ColorLensOutlined,
  FormatQuoteRound
} from '@vicons/material'

export enum SettingsRoute {
  MENU = 'menu',
  THEME = 'theme',
  CLOCK = 'clock',
  SEARCH = 'search',
  BACKGROUND = 'background',
  SHORTCUT = 'shortcut',
  BOOKMARK_SIDEBAR = 'bookmarkSidebar',
  YIYAN = 'yiyan',
  PERFORMANCE = 'performance',
  OTHER = 'other'
}

interface MenuItem {
  key: SettingsRoute
  icon: Component
  titleKey: string
}

export const MENU_ITEMS: MenuItem[] = [
  {
    key: SettingsRoute.THEME,
    icon: ColorLensOutlined,
    titleKey: 'theme.title'
  },
  {
    key: SettingsRoute.CLOCK,
    icon: ClockCircleOutlined,
    titleKey: 'clock.title'
  },
  {
    key: SettingsRoute.SEARCH,
    icon: SearchOutlined,
    titleKey: 'search.title'
  },
  {
    key: SettingsRoute.BACKGROUND,
    icon: PictureOutlined,
    titleKey: 'background.title'
  },
  {
    key: SettingsRoute.SHORTCUT,
    icon: AppstoreOutlined,
    titleKey: 'shortcut.title'
  },
  {
    key: SettingsRoute.BOOKMARK_SIDEBAR,
    icon: BookmarkBorderRound,
    titleKey: 'bookmarkSidebar.title'
  },
  {
    key: SettingsRoute.YIYAN,
    icon: FormatQuoteRound,
    titleKey: 'yiyan.title'
  },
  {
    key: SettingsRoute.PERFORMANCE,
    icon: ApiRound,
    titleKey: 'perf.title'
  },
  {
    key: SettingsRoute.OTHER,
    icon: ControlOutlined,
    titleKey: 'other.title'
  }
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
