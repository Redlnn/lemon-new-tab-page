<script setup lang="ts">
import { useElementVisibility } from '@vueuse/core'

import type { SettingsRoute } from '../composables/useSettingsRouter'
import BackgroundSettings from '../Settings/BackgroundSettings.vue'
import ClockSettings from '../Settings/ClockSettings.vue'
import OtherSettings from '../Settings/OtherSettings.vue'
import PerformanceSettings from '../Settings/PerformanceSettings.vue'
import SearchSettings from '../Settings/SearchSettings.vue'
import ShortcutSettings from '../Settings/ShortcutSettings.vue'
import ThemeSettings from '../Settings/ThemeSettings.vue'
import YiyanSettings from '../Settings/YiyanSettings.vue'

interface Props {
  currentRoute: SettingsRoute | 'menu'
  title: string
  isMobile?: boolean
  disableTransition?: boolean
}

defineProps<Props>()

const titleRef = ref<HTMLDivElement>()
const titleIsVisible = useElementVisibility(titleRef)

defineExpose({
  titleRef,
  titleIsVisible
})
</script>

<template>
  <el-main class="settings-main">
    <el-scrollbar class="settings-content">
      <h2 ref="titleRef" class="settings-content__title">{{ title }}</h2>
      <Transition :name="disableTransition ? undefined : 'settings-fade'" mode="out-in">
        <theme-settings v-if="currentRoute === 'theme'" key="theme" />
        <clock-settings v-else-if="currentRoute === 'clock'" key="clock" />
        <search-settings v-else-if="currentRoute === 'search'" key="search" />
        <background-settings v-else-if="currentRoute === 'background'" key="background" />
        <shortcut-settings v-else-if="currentRoute === 'shortcut'" key="shortcut" />
        <yiyan-settings v-else-if="currentRoute === 'yiyan'" key="yiyan" />
        <performance-settings v-else-if="currentRoute === 'performance'" key="performance" />
        <other-settings v-else-if="currentRoute === 'other'" key="other" />
      </Transition>
    </el-scrollbar>
  </el-main>
</template>
