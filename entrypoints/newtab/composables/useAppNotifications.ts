import { useTranslation } from 'i18next-vue'

import { version } from '@/package.json'

import { useSettingsStore } from '@/shared/settings'
import { setSyncEventCallback } from '@/shared/sync/syncDataStore'

import { shownFaviconCacheHintStorage } from '@newtab/shared/storages/notificationStorage'

import { shouldShowChangelog } from '../shared/utils'

/**
 * 处理应用级通知（欢迎、图标缓存提示、版本更新、同步错误）。
 * @param changelogRef 传入 Changelog 组件的 template ref，用于自动弹出更新日志。
 */
export function useAppNotifications(changelogRef: Ref<{ show: () => void } | undefined>) {
  const settings = useSettingsStore()
  const { t } = useTranslation('sync')
  const { t: tNewtab } = useTranslation('newtab')

  onMounted(async () => {
    // 全新用户欢迎通知
    if (settings.pluginVersion === '') {
      ElNotification.success({
        title: tNewtab('notification.welcome.title'),
        message: tNewtab('notification.welcome.message'),
        duration: 8000,
      })
    }

    // 图标缓存提示通知（仅展示一次）
    if (!settings.faviconCacheEnabled) {
      const alreadyShown = await shownFaviconCacheHintStorage.getValue()
      if (!alreadyShown) {
        await shownFaviconCacheHintStorage.setValue(true)
        ElNotification.info({
          title: tNewtab('notification.faviconCacheHint.title'),
          message: tNewtab('notification.faviconCacheHint.message'),
          duration: 10000,
        })
      }
    }

    if (settings.pluginVersion !== version) {
      settings.readChangeLog = false
      ElMessage.primary(t('newtab:changelog.newVersionMsg', { version }))

      const canAutoShow = shouldShowChangelog(settings.pluginVersion, version)

      if (canAutoShow && !settings.hideMajorChangelog) {
        watch(
          () => changelogRef.value,
          (instance) => {
            if (!instance) return
            instance.show()
          },
          { once: true, flush: 'post' },
        )
      } else {
        settings.pluginVersion = version
      }
    }

    // 注册同步事件回调
    setSyncEventCallback((type, payload) => {
      if (type === 'version-mismatch') {
        const p = payload as { cloud: string; local: string }
        ElNotification.error({
          title: t('fail.title'),
          message: t('fail.message', { cloud: p.cloud, local: p.local }),
        })
      } else if (type === 'sync-error') {
        const err = payload as Error
        ElNotification.error({
          title: t('error.title'),
          message: err.message || 'Unknown error.',
        })
      }
    })
  })
}
