import { defaultSettings, type SettingsInterfaceVer8, type SettingsInterfaceVer9 } from '..'

function clockSizeToNumber(size: 'small' | 'medium' | 'large'): number {
  switch (size) {
    case 'small':
      return 40
    case 'medium':
      return 50
    case 'large':
      return 70
    default:
      return 50
  }
}

export function migrateFromVer8To9(oldSettings: SettingsInterfaceVer8): SettingsInterfaceVer9 {
  return {
    ...oldSettings,
    clock: {
      ...oldSettings.clock,
      size: clockSizeToNumber(oldSettings.clock.size)
    },
    dock: {
      ...oldSettings.dock,
      launchpad: defaultSettings.dock.launchpad
    },
    shortcut: {
      ...oldSettings.shortcut,
      enablePaging: !oldSettings.shortcut.disablePaging
    },
    perf: {
      enableBookmarkTransparent: !oldSettings.perf.disableBookmarkTransparent,
      enableBookmarkBlur: !oldSettings.perf.disableBookmarkBlur,
      enableDialogTransparent: !oldSettings.perf.disableDialogTransparent,
      enableDialogBlur: !oldSettings.perf.disableDialogBlur,
      enableDialogAnimation: !oldSettings.perf.disableDialogAnimation,
      enableFocusScale: !oldSettings.perf.disableFocusScale,
      enableFocusBlur: !oldSettings.perf.disableFocusBlur,
      enableShortcutTransparent: !oldSettings.perf.disableShortcutTransparent,
      enableShortcutBlur: !oldSettings.perf.disableShortcutBlur,
      enableSearchBarTransparent: !oldSettings.perf.disableSearchBarTransparent,
      enableSearchBarBlur: !oldSettings.perf.disableSearchBarBlur,
      enableYiyanTransparent: !oldSettings.perf.disableYiyanTransparent,
      enableYiyanBlur: !oldSettings.perf.disableYiyanBlur,
      enableYiyanRipple: defaultSettings.perf.enableYiyanRipple,
      enableSettingsBtnBlur: !oldSettings.perf.disableSettingsBtnBlur,
      enableSettingsBtnTransparent: !oldSettings.perf.disableSettingsBtnTransparent,
      enableBgSwitchAnim: !oldSettings.perf.disableBgSwitchAnim,
      enableDockScale: defaultSettings.perf.enableDockScale
    },
    bookmark: {
      ...oldSettings.bookmark,
      showBtn: !oldSettings.bookmark.hideBtn
    },
    background: {
      ...oldSettings.background,
      online: {
        ...oldSettings.background.online,
        enableCache: oldSettings.background.online.cacheEnable
      }
    },
    version: 9
  } satisfies SettingsInterfaceVer9
}
