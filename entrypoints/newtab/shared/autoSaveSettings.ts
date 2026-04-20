import { useDebounceFn } from '@vueuse/core'

import { defaultSettings, useSettingsStore } from '@/shared/settings'

export function setupAutoSaveSettings(settings: ReturnType<typeof useSettingsStore>) {
  let lastSavedState: string | null = null

  const saveSettingsDebounced = useDebounceFn(async () => {
    const currentState = JSON.stringify(settings.$state)

    if (lastSavedState === currentState) {
      return
    }

    lastSavedState = currentState
    await settings.save()
  }, 1500)

  settings.$subscribe(async (_mutation, state) => {
    if (state.theme.primaryColor === null) {
      state.theme.primaryColor = defaultSettings.theme.primaryColor
    }

    await saveSettingsDebounced()
  })
}
