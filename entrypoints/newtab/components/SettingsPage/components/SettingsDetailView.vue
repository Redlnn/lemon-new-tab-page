<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useElementVisibility } from '@vueuse/core'

import { SettingsRoute } from '../composables/useSettingsRouter'

interface Props {
  currentRoute: SettingsRoute
  title: string
  isMobile?: boolean
  disableTransition?: boolean
}

const props = defineProps<Props>()

const titleRef = ref<HTMLDivElement>()
const titleIsVisible = useElementVisibility(titleRef)

const asyncViewMap: Record<SettingsRoute, Component | null> = {
  [SettingsRoute.MENU]: null,
  [SettingsRoute.THEME]: defineAsyncComponent(() => import('../Settings/ThemeSettings.vue')),
  [SettingsRoute.CLOCK]: defineAsyncComponent(() => import('../Settings/ClockSettings.vue')),
  [SettingsRoute.SEARCH]: defineAsyncComponent(() => import('../Settings/SearchSettings.vue')),
  [SettingsRoute.BACKGROUND]: defineAsyncComponent(
    () => import('../Settings/BackgroundSettings.vue')
  ),
  [SettingsRoute.SHORTCUT]: defineAsyncComponent(() => import('../Settings/ShortcutSettings.vue')),
  [SettingsRoute.YIYAN]: defineAsyncComponent(() => import('../Settings/YiyanSettings.vue')),
  [SettingsRoute.PERFORMANCE]: defineAsyncComponent(
    () => import('../Settings/PerformanceSettings.vue')
  ),
  [SettingsRoute.OTHER]: defineAsyncComponent(() => import('../Settings/OtherSettings.vue'))
} as const

const activeView = computed(() => {
  return asyncViewMap[props.currentRoute]
})

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
        <KeepAlive>
          <component v-if="activeView" :is="activeView" :key="currentRoute" />
        </KeepAlive>
      </Transition>
    </el-scrollbar>
  </el-main>
</template>
