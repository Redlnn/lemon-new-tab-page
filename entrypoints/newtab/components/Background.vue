<script lang="ts" setup>
import { ref } from 'vue'

import { useSettingsStore } from '@/shared/settings'

import { useBgSwtichStore, useFocusStore } from '@newtab/scripts/store'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const switchStore = useBgSwtichStore()
const backgroundWrapper = ref<HTMLDivElement>()
const background = ref<HTMLDivElement>()

defineProps<{ url: string }>()
</script>

<template>
  <div
    ref="backgroundWrapper"
    class="background-wrapper"
    :style="{
      '--mask-opacity': settingsStore.background.bgMaskOpacity / 100,
      '--mask-color__light': settingsStore.background.lightMaskColor,
      '--mask-color__night': settingsStore.background.nightMaskColor,
      '--blur-intensity': `${settingsStore.background.blurIntensity}px`
    }"
  >
    <div class="background-mask"></div>
    <div v-if="settingsStore.background.enableVignetting" class="background__vignette" />
    <Transition>
      <div
        v-show="!switchStore.isSwitching"
        ref="background"
        class="background"
        :class="{ 'background--focused': focusStore.isFocused }"
        :style="{
          backgroundImage: url
        }"
      />
    </Transition>
  </div>
</template>

<style lang="scss">
.background-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.background-mask {
  position: absolute;
  inset: calc(var(--blur-intensity) * -2);
  background-color: var(--mask-color__light);
  opacity: var(--mask-opacity);
  transition: background-color var(--el-transition-duration-fast) cubic-bezier(0.65, 0.05, 0.1, 1);

  html.dark & {
    background-color: var(--mask-color__night);
  }
}

.background {
  position: absolute;
  inset: calc(var(--blur-intensity) * -2);
  z-index: -2;
  background-color: var(--el-bg-color);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  filter: blur(var(--blur-intensity));
  transition:
    transform var(--el-transition-duration-fast) cubic-bezier(0.65, 0.05, 0.1, 1),
    filter var(--el-transition-duration-fast) cubic-bezier(0.65, 0.05, 0.1, 1);

  &--focused {
    filter: blur(calc(var(--blur-intensity) + 10px));
    transform: scale(1.1);
  }
}

.background__vignette {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: radial-gradient(rgb(0 0 0 / 0%) 33%, rgb(0 0 0 / 100%) 166%);
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
