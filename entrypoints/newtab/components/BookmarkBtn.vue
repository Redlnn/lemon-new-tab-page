<script lang="ts" setup>
import { BookmarkTwotone } from '@vicons/material'

import { useSettingsStore } from '@/shared/settings'

const emit = defineEmits<{
  (e: 'open-bookmark-sidebar'): void
}>()

const settings = useSettingsStore()
</script>

<template>
  <div
    class="action-btn bookmark-btn"
    :class="{
      'action-btn--tran': !settings.perf.disableSettingsBtnTransparent,
      'action-btn--blur': !(
        settings.perf.disableSettingsBtnBlur || settings.perf.disableSettingsBtnTransparent
      )
    }"
    @click="emit('open-bookmark-sidebar')"
  >
    <el-icon><bookmark-twotone /></el-icon>
  </div>
</template>
