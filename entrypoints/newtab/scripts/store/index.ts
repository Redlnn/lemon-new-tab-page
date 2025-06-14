import { useBgSwtichStore } from './backgroundSwitchStore'
import { initBookmark, saveBookmark, useBookmarkStore } from './bookmarkStore'
import { useFocusStore } from './focusStore'
import {
  initSettings,
  reloadBackgroundImage,
  uploadBackgroundImage,
  useSettingsStore,
  saveSettings
} from './settingsStore'
import { initSyncSettings, useSyncSettingsStore } from './syncSettingsStore'
import { useBingWallpaperStore, useWallpaperStore } from './wallpaperStore'

export {
  useBgSwtichStore,
  initBookmark,
  saveBookmark,
  useBookmarkStore,
  useFocusStore,
  useBingWallpaperStore,
  useWallpaperStore,
  initSettings,
  reloadBackgroundImage,
  uploadBackgroundImage,
  useSettingsStore,
  saveSettings,
  initSyncSettings,
  useSyncSettingsStore
}
