import _ from 'lodash'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import { isImageFile } from '@/utils/image'
import { settingsStorage } from '../storages/settingsStorage'
import { useWallpaperStore } from './wallpaperStore'
import type {
  OldSettingsInterface,
  SettingsInterfaceVer2,
  SettingsInterfaceVer4
} from '../settings/types'
import { migrateFromVer1To4, defaultSettings } from '../settings'

const searchSuggestAPIsMap: Record<string, string> = {
  百度: 'baidu',
  必应: 'bing',
  谷歌: 'google'
}

type OldStorageSettings = OldSettingsInterface | SettingsInterfaceVer2

async function migrateSettings(
  settings: OldStorageSettings
): Promise<SettingsInterfaceVer4 | null> {
  if (!settings.version) {
    settings.version = '' // 太旧版本可能没有version字段
  }

  // 判断版本类型来确定具体的设置类型
  if (typeof settings.version === 'string') {
    const oldSettings = settings as OldSettingsInterface
    if (searchSuggestAPIsMap[oldSettings.selectedSearchSuggestionAPI]) {
      oldSettings.selectedSearchSuggestionAPI =
        searchSuggestAPIsMap[oldSettings.selectedSearchSuggestionAPI]
    }
    return migrateFromVer1To4(oldSettings)
  }

  return null
}

export async function initSettings() {
  let settings = await settingsStorage.getValue()
  if (import.meta.env.CHROME || import.meta.env.EDGE) {
    const oldSettings: { settings: OldStorageSettings | null } = await chrome.storage.local.get({
      settings: null
    })

    if (oldSettings.settings) {
      // 迁移旧版本设置
      const migratedSettings = await migrateSettings(oldSettings.settings)
      if (migratedSettings) {
        settings = migratedSettings
        await saveSettings(settings)
      }
    }
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
