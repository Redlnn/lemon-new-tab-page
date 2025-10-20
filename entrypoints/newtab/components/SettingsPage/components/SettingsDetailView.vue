<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useElementVisibility, useTimeoutFn } from '@vueuse/core'

import { SettingsRoute } from '../composables/useSettingsRouter'

interface Props {
  currentRoute: SettingsRoute
  title: string
  isMobile?: boolean
  disableTransition?: boolean
  dialogOpened?: boolean
}

const props = defineProps<Props>()

const titleRef = ref<HTMLDivElement>()
const titleIsVisible = useElementVisibility(titleRef)

// 延迟加载组件，等待对话框动画完成
const shouldLoadContent = ref(false)

onMounted(() => {
  if (props.dialogOpened) {
    useTimeoutFn(() => {
      shouldLoadContent.value = true
    }, 150)
  }
})

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
  // 对话框打开动画完成前不加载组件
  if (!shouldLoadContent.value) return null
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
