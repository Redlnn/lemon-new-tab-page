export { BgType } from './types'
export {
  migrateFromVer1,
  migrateFromVer2To3,
  migrateFromVer3To4,
  migrateFromVer4To5,
  migrateFromVer5To6,
  migrateFromVer6To7,
  migrateFromVer7To8
} from './migrate'
export type {
  OldSettingsInterface,
  SettingsInterfaceVer2,
  SettingsInterfaceVer3,
  SettingsInterfaceVer4,
  SettingsInterfaceVer5,
  SettingsInterfaceVer6,
  SettingsInterfaceVer7,
  SettingsInterfaceVer8
} from './types'
export {
  initSettings,
  reloadBackground,
  saveSettings,
  uploadBackground,
  useSettingsStore
} from './settingsStore'
export { settingsStorage } from './settingsStorage'
export { useBingWallpaperStore, useDarkWallpaperStore, useWallpaperStore } from './wallpaperStore'
export { type CURRENT_CONFIG_INTERFACE, CURRENT_CONFIG_VERSION } from './current'
export { defaultSettings } from './default'
