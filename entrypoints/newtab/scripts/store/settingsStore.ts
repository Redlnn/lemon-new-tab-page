import _ from 'lodash'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import { isImageFile } from '@/newtab/scripts/img'
import {
  CURRENT_CONFIG_VERSION,
  type OldSettingsInterface,
  settingsStorage,
  type SettingsInterface,
  defaultSettings
} from '../storages/settingsStorage'
import { useWallpaperStore } from './wallpaperStore'

function migrate(oldSettings: OldSettingsInterface): SettingsInterface {
  return {
    primaryColor: oldSettings.primaryColor,
    time: {
      isMeridiem: oldSettings.isMeridiem,
      showMeridiem: oldSettings.showMeridiem,
      showDate: true,
      showLunar: true
    },
    search: {
      autoFocus: false,
      selectedSearchSuggestionAPI: oldSettings.selectedSearchSuggestionAPI,
      selectedSearchEngine: oldSettings.selectedSearchEngine,
      searchInNewTab: oldSettings.searchInNewTab,
      recordSearchHistory: oldSettings.recordSearchHistory,
      enableYiyan: oldSettings.enableYiyan
    },
    background: {
      bgType: oldSettings.bgType,
      bgDarkCorners: oldSettings.bgDarkCorners,
      bgBlur: oldSettings.bgBlur,
      bgMaskPpacity: oldSettings.bgMaskPpacity,
      maskColor: '#000'
    },
    localBackground: {
      bgId: oldSettings.bgId,
      bgUrl: oldSettings.bgUrl
    },
    bingBackground: {
      bgId: oldSettings.bingWallpaper.bgId,
      bgUrl: oldSettings.bingWallpaper.url,
      updateDate: oldSettings.bingWallpaper.updateDate
    },
    quickStart: {
      enabled: oldSettings.enabled,
      enableTopSites: oldSettings.enableTopSites,
      quickStartRows: oldSettings.quickStartRows,
      quickStartColumns: oldSettings.quickStartColumns,
      quickStartItemWidth: oldSettings.quickStartItemWidth,
      showQuickStartTitle: oldSettings.showQuickStartTitle,
      showPinnedIcon: oldSettings.showPinnedIcon,
      showQuickStartContainerBg: true
    },
    pluginVersion: oldSettings.version,
    version: CURRENT_CONFIG_VERSION
  }
}

const searchSuggestAPIsMap: Record<string, string> = {
  百度: 'baidu',
  必应: 'bing',
  谷歌: 'google'
}

export async function initSettings() {
  let settings
  if (import.meta.env.CHROME || import.meta.env.EDGE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const oldSettings = (await chrome.storage.local.get('settings')) as any as
      | { settings: OldSettingsInterface }
      | undefined
      | null

    settings = await settingsStorage.getValue()

    if (oldSettings?.settings) {
      if (
        Object.keys(searchSuggestAPIsMap).includes(oldSettings.settings.selectedSearchSuggestionAPI)
      ) {
        oldSettings.settings.selectedSearchSuggestionAPI =
          searchSuggestAPIsMap[oldSettings.settings.selectedSearchSuggestionAPI]
      }
      if (oldSettings.settings.version && typeof oldSettings.settings.version === 'string') {
        settings = migrate(oldSettings.settings)
        await saveSettings(settings)
      } else if (!oldSettings.settings.version) {
        settings = migrate({ ...oldSettings.settings, version: '' })
        await saveSettings(settings)
      }
    }
  } else {
    settings = await settingsStorage.getValue()
  }

  const settingsStore = useSettingsStore()
  settingsStore.$patch(settings)
}

export async function saveSettings(settings: SettingsInterface) {
  await settingsStorage.setValue(settings)
}

export const useSettingsStore = defineStore('opiton', {
  state: () => {
    return _.cloneDeep(defaultSettings)
  }
})

export async function uploadBackgroundImage(imageFile: File) {
  const settingsStore = useSettingsStore()

  // https://github.com/Devifish/light-tab

  const id = uuidv4()
  const url = URL.createObjectURL(imageFile)
  const url_old = settingsStore.localBackground.bgUrl

  // 清除上次壁纸，ObjectURL可能导致内存溢出
  await useWallpaperStore.clear()
  if (url_old.startsWith('blob:')) {
    URL.revokeObjectURL(url_old)
  }

  // 保存图片到IndexedDB
  await useWallpaperStore.setItem<Blob>(id, imageFile)
  settingsStore.localBackground = {
    bgId: id,
    bgUrl: url
  }
}

export async function reloadBackgroundImage() {
  const settingsStore = useSettingsStore()

  const id = settingsStore.localBackground.bgId
  const file = await useWallpaperStore.getItem<Blob>(id)

  // 校验图片数据是否可用，否则删除该数据
  if (file && isImageFile(file)) {
    const url = URL.createObjectURL(file)
    settingsStore.localBackground.bgUrl = url
    // await saveSettings(settingsStore) // 会导致启动时卡死、CPU吃满和内存泄漏
  } else {
    URL.revokeObjectURL(settingsStore.localBackground.bgUrl)
    settingsStore.localBackground.bgId = ''
    settingsStore.localBackground.bgUrl = ''
    await useWallpaperStore.removeItem(id)
  }
}
