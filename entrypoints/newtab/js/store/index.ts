import { useFocusStore } from './foucsStore'
import { BgType, readSettings, saveSettings, useSettingsStore } from './settingsStore'
import { readBookmark, saveBookmark, useBookmarkStore } from './bookmarkStore'
import { useBingWallpaperStore, useWallpaperStore } from './wallpaperStore'

export {
  useFocusStore,
  useBingWallpaperStore,
  useWallpaperStore,
  useSettingsStore,
  saveSettings,
  readSettings,
  BgType
}
export { readBookmark, saveBookmark, useBookmarkStore }
