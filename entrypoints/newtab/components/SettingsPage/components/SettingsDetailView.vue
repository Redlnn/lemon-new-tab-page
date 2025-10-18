<script setup lang="ts">
import { useElementVisibility } from '@vueuse/core'

import type { SettingsRoute } from '@newtab/composables/useSettingsRouter'

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

<style lang="scss" scoped>
.settings-main {
  padding: 0 20px 0 30px;

  .is-mobile & {
    padding: 0 10px 0 20px;
  }

  .settings-content {
    height: 100%;

    :deep(.el-scrollbar__wrap) {
      padding-right: 10px;
    }

    &__title {
      padding: 0 10px;
      margin: 25px 0 20px;
      font-size: 28px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .is-mobile & &__title {
      margin: 20px 0 15px;
      font-size: 24px;
    }
  }
}

.settings-fade-enter-active,
.settings-fade-leave-active {
  transition: opacity 0.15s ease;
}

.settings-fade-enter-from,
.settings-fade-leave-to {
  opacity: 0;
}
</style>
