import { useSettingsStore } from '@/shared/settings'
import { changeTheme, toggleDocumentClass } from '@/shared/theme'

/**
 * 监听主题与外观相关设置变化，自动应用 CSS 类和主题色。
 * 应在 App.vue setup 中调用一次。
 */
export function useThemeWatcher() {
  const settings = useSettingsStore()

  watch(
    () => settings.theme.primaryColor,
    (color) => {
      if (color === null) return
      changeTheme(color)
    },
  )

  watch(
    () => settings.theme.colorfulMode,
    (colorful) => {
      toggleDocumentClass('colorful', colorful)
    },
    { immediate: true },
  )

  watch(
    () => settings.perf.dialog.transparent,
    (enabled) => {
      toggleDocumentClass('dialog-transparent', enabled)
    },
    { immediate: true },
  )

  watch(
    () => settings.perf.dialog.blur,
    (enabled) => {
      toggleDocumentClass('dialog-acrylic', enabled)
    },
    { immediate: true },
  )
}
