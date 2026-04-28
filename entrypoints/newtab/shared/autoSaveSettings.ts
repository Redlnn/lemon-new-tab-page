import { useDebounceFn } from '@vueuse/core'

import { defaultSettings, useSettingsStore } from '@/shared/settings'

export function setupAutoSaveSettings(settings: ReturnType<typeof useSettingsStore>) {
  let mutationVersion = 0
  let savedVersion = 0
  let saving = false
  let consecutiveFailures = 0
  let blockedVersion = -1
  const MAX_SAVE_RETRIES = 5

  const saveSettingsDebounced = useDebounceFn(async () => {
    if (saving || mutationVersion === savedVersion || blockedVersion === mutationVersion) {
      return
    }

    saving = true
    const targetVersion = mutationVersion
    try {
      await settings.save()
      savedVersion = targetVersion
      consecutiveFailures = 0
      blockedVersion = -1
    } catch (error) {
      consecutiveFailures += 1
      console.error('[settings] auto save failed', error)
      if (consecutiveFailures >= MAX_SAVE_RETRIES) {
        blockedVersion = mutationVersion
      }
    } finally {
      saving = false
      if (mutationVersion !== savedVersion && blockedVersion !== mutationVersion) {
        void saveSettingsDebounced()
      }
    }
  }, 1500)

  settings.$subscribe((_mutation, state) => {
    if (state.theme.primaryColor === null) {
      state.theme.primaryColor = defaultSettings.theme.primaryColor
    }

    mutationVersion += 1
    consecutiveFailures = 0
    blockedVersion = -1
    void saveSettingsDebounced()
  })
}
