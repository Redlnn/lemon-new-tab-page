import type { Store } from 'pinia'
import { useDebounceFn } from '@vueuse/core'

import { type CURRENT_CONFIG_INTERFACE, defaultSettings, saveSettings } from '@/shared/settings'

export function setupAutoSaveSettings(settings: Store<'option', CURRENT_CONFIG_INTERFACE>) {
  let lastSavedState: string | null = null

  const saveSettingsDebounced = useDebounceFn(async (state: typeof settings.$state) => {
    const currentState = JSON.stringify(state)

    if (lastSavedState === currentState) {
      return
    }

    lastSavedState = currentState
    await saveSettings(state)
  }, 500)

  settings.$subscribe(async (_mutation, state) => {
    if (state.theme.primaryColor === null) {
      state.theme.primaryColor = defaultSettings.theme.primaryColor
    }

    await saveSettingsDebounced(state)
  })
}
