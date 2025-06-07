<script lang="ts" setup>
import { ref } from 'vue'

import { useFocusStore, useSettingsStore, useBgSwtichStore } from '@/newtab/scripts/store'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const switchStore = useBgSwtichStore()
const backgroundWrapper = ref<HTMLDivElement>()
const background = ref<HTMLDivElement>()

defineProps<{ url: string }>()
</script>

<template>
  <Transition>
    <div
      v-show="!switchStore.isSwitching"
      ref="backgroundWrapper"
      class="background-wrapper"
      :style="{
        '--mask-opacity': settingsStore.background.bgMaskOpacity / 100,
        '--mask-color': settingsStore.background.maskColor,
        '--blur-intensity': `${settingsStore.background.blurIntensity}px`
      }"
    >
      <div
        ref="background"
        class="background"
        :class="{ 'background--focused': focusStore.isFocused }"
        :style="{
          backgroundImage: url
        }"
      />
      <div v-if="settingsStore.background.enableVignetting" class="background__vignette" />
    </div>
  </Transition>
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
  background-color: var(--el-bg-color-page);
  opacity: calc(1 - var(--mask-opacity));
}

.background {
  position: absolute;
  inset: calc(var(--blur-intensity) * -2);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  filter: blur(var(--blur-intensity));
  transition:
    transform 0.2s cubic-bezier(0.65, 0.05, 0.1, 1),
    filter 0.2s cubic-bezier(0.65, 0.05, 0.1, 1);

  &--focused {
    filter: blur(calc(var(--blur-intensity) + 10px));
    transform: scale(1.1);
  }
}

.background__vignette {
  position: absolute;
  top: 0;
  left: 0;
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
