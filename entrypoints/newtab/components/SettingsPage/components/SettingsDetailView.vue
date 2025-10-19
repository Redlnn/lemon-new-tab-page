<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useElementVisibility } from '@vueuse/core'

import type { SettingsRoute } from '../composables/useSettingsRouter'

interface Props {
  currentRoute: SettingsRoute | 'menu'
  title: string
  isMobile?: boolean
  disableTransition?: boolean
}

const props = defineProps<Props>()

const titleRef = ref<HTMLDivElement>()
const titleIsVisible = useElementVisibility(titleRef)

const asyncViewMap: Record<SettingsRoute, ReturnType<typeof defineAsyncComponent>> = {
  theme: defineAsyncComponent(() => import('../Settings/ThemeSettings.vue')),
  clock: defineAsyncComponent(() => import('../Settings/ClockSettings.vue')),
  search: defineAsyncComponent(() => import('../Settings/SearchSettings.vue')),
  background: defineAsyncComponent(() => import('../Settings/BackgroundSettings.vue')),
  shortcut: defineAsyncComponent(() => import('../Settings/ShortcutSettings.vue')),
  yiyan: defineAsyncComponent(() => import('../Settings/YiyanSettings.vue')),
  performance: defineAsyncComponent(() => import('../Settings/PerformanceSettings.vue')),
  other: defineAsyncComponent(() => import('../Settings/OtherSettings.vue'))
}

const activeView = computed(() => {
  if (props.currentRoute === 'menu') return null
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
