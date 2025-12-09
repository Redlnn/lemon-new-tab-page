import { SettingsRoute } from '../composables/useSettingsRouter'

// 维护所有设置子页面的异步加载器，便于集中预取与复用
const settingsViewLoaders: Record<SettingsRoute, (() => Promise<{ default: Component }>) | null> = {
  [SettingsRoute.MENU]: null,
  [SettingsRoute.THEME]: () => import('../Settings/ThemeSettings.vue'),
  [SettingsRoute.CLOCK]: () => import('../Settings/ClockSettings.vue'),
  [SettingsRoute.SEARCH]: () => import('../Settings/SearchSettings.vue'),
  [SettingsRoute.BACKGROUND]: () => import('../Settings/BackgroundSettings.vue'),
  [SettingsRoute.SHORTCUT]: () => import('../Settings/ShortcutSettings.vue'),
  [SettingsRoute.BOOKMARK_SIDEBAR]: () => import('../Settings/BookmarkSidebarSettings.vue'),
  [SettingsRoute.YIYAN]: () => import('../Settings/YiyanSettings.vue'),
  [SettingsRoute.PERFORMANCE]: () => import('../Settings/PerformanceSettings.vue'),
  [SettingsRoute.OTHER]: () => import('../Settings/OtherSettings.vue')
} as const

const settingsAsyncViewMap: Record<SettingsRoute, Component | null> = Object.keys(
  settingsViewLoaders
).reduce(
  (map, route) => {
    const typedRoute = route as SettingsRoute
    const loader = settingsViewLoaders[typedRoute]
    map[typedRoute] = loader ? defineAsyncComponent(loader) : null
    return map
  },
  {} as Record<SettingsRoute, Component | null>
)

export const getSettingsView = (route: SettingsRoute): Component | null =>
  settingsAsyncViewMap[route]

export const prefetchSettingsView = async (route: SettingsRoute) => {
  const loader = settingsViewLoaders[route]
  if (!loader) return

  try {
    await loader()
  } catch (error) {
    // 预取失败不应中断主流程，简单警告便于排查
    console.warn('[settings] failed to prefetch settings view', route, error)
  }
}
