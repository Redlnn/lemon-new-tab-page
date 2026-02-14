import { browser } from '#imports'

import { handleInvaildSettings } from './handleInvaild'

export async function shouldStartApp() {
  const wxtSettingsVer: { $settings: number | null } = await browser.storage.local.get({
    $settings: null
  })
  if (wxtSettingsVer.$settings && wxtSettingsVer.$settings <= 6) {
    await handleInvaildSettings()
    return
  }

  const localSettings: {
    settings: { version: string | number | null; [key: string]: unknown }
  } = await browser.storage.local.get({ settings: { version: null } })

  if (localSettings.settings.version) {
    let isInvaildSettings: boolean = false

    if (typeof localSettings.settings.version === 'string') {
      // 远古配置文件
      isInvaildSettings = true
    } else if (localSettings.settings.version <= 6) {
      isInvaildSettings = true
    }
    if (!('pluginVersion' in localSettings.settings)) {
      // 早期版本没有 pluginVersion 字段，说明配置文件非常古老，直接清除重置
      isInvaildSettings = true
    }

    if (isInvaildSettings) {
      await handleInvaildSettings()
    }
  }
}
