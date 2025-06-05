import _ from 'lodash'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import { isImageFile } from '@/newtab/scripts/img'
import { settingsStorage } from '../storages/settingsStorage'
import { useWallpaperStore } from './wallpaperStore'
import type {
  OldSettingsInterface,
  SettingsInterfaceVer2,
  SettingsInterfaceVer4
} from '../settings/types'
import { migrateFromVer1To4, migrateFromVer2To4, defaultSettings } from '../settings'

const searchSuggestAPIsMap: Record<string, string> = {
  百度: 'baidu',
  必应: 'bing',
  谷歌: 'google'
}

export async function initSettings() {
  let settings = await settingsStorage.getValue()
  if (import.meta.env.CHROME || import.meta.env.EDGE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const oldSettings = (await chrome.storage.local.get('settings')) as any as
      | { settings: OldSettingsInterface }
      | undefined
      | null

    if (oldSettings?.settings) {
      const selectedAPI = oldSettings.settings.selectedSearchSuggestionAPI
      if (searchSuggestAPIsMap[selectedAPI]) {
        oldSettings.settings.selectedSearchSuggestionAPI = searchSuggestAPIsMap[selectedAPI]
      }
      // 最旧版本的设置中储存的是插件版本号，需要迁移
      if (typeof oldSettings.settings.version === 'string') {
        settings = migrateFromVer1To4(oldSettings.settings)
        await saveSettings(settings)
      } else if (!oldSettings.settings.version) {
        // 某些情况下没有 version 字段的问题
        settings = migrateFromVer1To4({ ...oldSettings.settings, version: '' })
        await saveSettings(settings)
      }
    }
  }

  // 由于前期没有使用wxt的配置版本管理，所以刷新页面以应用新的配置
  if (settings.version == 2) {
    settings = migrateFromVer2To4(settings as unknown as SettingsInterfaceVer2)
  }

  const settingsStore = useSettingsStore()
  settingsStore.$patch(settings)
}

export async function saveSettings(settings: SettingsInterfaceVer4) {
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
  const url_old = settingsStore.localBackground.url

  // 清除上次壁纸，ObjectURL可能导致内存溢出
  await useWallpaperStore.clear()
  if (url_old.startsWith('blob:')) {
    URL.revokeObjectURL(url_old)
  }

  // 保存图片到IndexedDB
  await useWallpaperStore.setItem<Blob>(id, imageFile)
  settingsStore.localBackground = {
    id: id,
    url: url
  }
}

export async function reloadBackgroundImage() {
  const settingsStore = useSettingsStore()

  const { id } = settingsStore.localBackground
  const file = await useWallpaperStore.getItem<Blob>(id)

  // 校验图片数据是否可用，否则删除该数据
  if (file && isImageFile(file)) {
    const url = URL.createObjectURL(file)
    settingsStore.localBackground.url = url
    // await saveSettings(settingsStore) // 会导致启动时卡死、CPU吃满和内存泄漏
  } else {
    URL.revokeObjectURL(settingsStore.localBackground.url)
    settingsStore.localBackground.id = ''
    settingsStore.localBackground.url = ''
    await useWallpaperStore.removeItem(id)
  }
}
