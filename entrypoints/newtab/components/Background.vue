<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useDark, useDocumentVisibility, useWindowFocus } from '@vueuse/core'

import { useSettingsStore } from '@/shared/settings'

import { useBgSwtichStore, useFocusStore } from '@newtab/scripts/store'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const switchStore = useBgSwtichStore()
const backgroundWrapper = ref<HTMLDivElement>()
const background = ref<HTMLDivElement>()
const videoRef = ref<HTMLVideoElement>()

defineProps<{ url: string }>()

const isDark = useDark()
const isWindowFocused = useWindowFocus()

function updateVideoPlayback() {
  const vid = videoRef.value
  if (!vid) return
  // If not focused or page hidden, pause; otherwise play
  if (
    document.visibilityState === 'hidden' ||
    (settingsStore.background.pauseWhenBlur && !isWindowFocused.value)
  ) {
    try {
      vid.pause()
    } catch {}
  } else {
    try {
      // play returns a promise; ignore rejection to avoid uncaught
      void vid.play()
    } catch {}
  }
}

const backgroundCss = {
  'background--deafult-scale': settingsStore.perf.disableFocusScale,
  'background--focused__scale': focusStore.isFocused && !settingsStore.perf.disableFocusScale,
  'background--focused__blur': focusStore.isFocused && !settingsStore.perf.disableFocusBlur
}

const visibility = useDocumentVisibility()

watch(isWindowFocused, updateVideoPlayback)
watch(visibility, updateVideoPlayback)
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
      <div v-show="!switchStore.isSwitching" ref="background">
        <video
          v-if="
            (!isDark && settingsStore.localBackground.mediaType === 'video') ||
            (isDark && settingsStore.localDarkBackground.mediaType === 'video')
          "
          class="background background--video"
          :class="backgroundCss"
          ref="videoRef"
          :src="url || ''"
          autoplay
          muted
          loop
          playsinline
        ></video>
        <div
          v-else
          class="background"
          :class="backgroundCss"
          :style="{
            backgroundImage: url ? (url.startsWith('url') ? url : `url(${url})`) : undefined
          }"
        ></div>
      </div>
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
  background-color: var(--el-bg-color-page);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  filter: blur(var(--blur-intensity));
  transition:
    transform var(--el-transition-duration-fast) cubic-bezier(0.65, 0.05, 0.1, 1),
    filter var(--el-transition-duration-fast) cubic-bezier(0.65, 0.05, 0.1, 1);

  &--deafult-scale {
    transform: scale(1.1);
  }

  &--focused {
    &__scale {
      transform: scale(1.1);
    }

    &__blur {
      filter: blur(calc(var(--blur-intensity) + 10px));
    }
  }
}

video.background {
  width: calc(100% + 4 * var(--blur-intensity));
  height: calc(100% + 4 * var(--blur-intensity));
  object-fit: cover;
  will-change: transform;
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
