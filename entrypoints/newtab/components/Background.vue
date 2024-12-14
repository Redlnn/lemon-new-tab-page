<script lang="ts" setup>
import { useTimeoutFn } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'

import { useFocusStore, useSettingsStore, useBgSwtichStore } from '@/newtab/scripts/store'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const switchStore = useBgSwtichStore()
const backgroundWrapper = ref()
const background = ref()

const props = defineProps<{ bgurl: string }>()

watch(
  () => focusStore.isFocused,
  () => {
    if (focusStore.isFocused) {
      background.value.style.transition =
        'transform 0.2s cubic-bezier(0.65, 0.05, 0.1, 1), filter 0.2s cubic-bezier(0.65, 0.05, 0.1, 1)'
      background.value.style.filter = `blur(${settingsStore.background.bgBlur + 10}px)`
      background.value.style.transform = 'scale(1.1)'
    } else {
      background.value.style.filter = ''
      background.value.style.transform = ''
      useTimeoutFn(() => {
        background.value.style.transition = ''
      }, 200)
    }
  }
)

onMounted(() => {
  useTimeoutFn(() => {
    backgroundWrapper.value.style.opacity = '1'
  }, 100)
})
</script>

<template>
  <div ref="backgroundWrapper" class="background-wrapper">
    <div
      ref="background"
      class="background"
      :style="{
        '--bg-blur': `${settingsStore.background.bgBlur}px`,
        '--bg-mask-opacity': settingsStore.background.bgMaskPpacity / 100,
        backgroundImage: bgurl
      }"
    >
      <div class="transition" :style="{ opacity: switchStore.isSwitching ? 1 : 0 }"></div>
      <div class="mask" :style="{ backgroundColor: settingsStore.background.maskColor }"></div>
      <div v-if="settingsStore.background.bgDarkCorners" class="dark-corners"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.background-wrapper {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  z-index: -1000;
  background-color: var(--el-bg-color-page);
  transition:
    opacity 0.4s var(--el-transition-function-ease-in-out-bezier),
    background-color var(--el-transition-duration-fast) ease;

  .background {
    position: absolute;
    top: calc(var(--bg-blur) * -2);
    left: calc(var(--bg-blur) * -2);
    right: calc(var(--bg-blur) * -2);
    bottom: calc(var(--bg-blur) * -2);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(var(--bg-blur));

    .dark-corners {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 1) 166%);
      z-index: -997;
    }

    .mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: var(--bg-mask-opacity);
      transition: all var(--el-transition-duration-fast) ease;
      z-index: -998;
    }

    .transition {
      opacity: 0;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--el-bg-color-page);
      z-index: -999;
      transition: opacity 0.1s ease-in-out;
    }
  }
}
</style>
