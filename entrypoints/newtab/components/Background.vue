<script lang="ts" setup>
import { useTimeoutFn } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'

import { useFocusStore } from '../js/store'
import { useSettingsStore } from '../js/store/settingsStore'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const backgroundWrapper = ref()
const background = ref()

const props = defineProps<{ bgurl: string }>()

watch(
  () => focusStore.isFocused,
  () => {
    if (focusStore.isFocused) {
      background.value.style.transition =
        'transform 0.2s cubic-bezier(0.65, 0.05, 0.1, 1), filter 0.2s cubic-bezier(0.65, 0.05, 0.1, 1)'
      background.value.style.filter = 'blur(10px)'
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

onMounted(async () => {
  backgroundWrapper.value.style.opacity = '1'
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
        backgroundImage: props.bgurl
      }"
    >
      <div class="dark-corners"></div>
      <div class="mask" v-if="settingsStore.background.bgDarkCorners"></div>
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
  transition: opacity 0.4s ease-in-out;
  background-color: var(--el-bg-color-page);

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
    transition: background 0.3s;

    .mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 1) 166%);
      z-index: -999;
    }
    .dark-corners {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: var(--bg-mask-opacity);
      background-color: #000;
      z-index: -999;
    }
  }
}
</style>
