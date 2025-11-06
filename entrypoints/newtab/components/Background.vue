<script lang="ts" setup>
import { useDark, useDocumentVisibility, useWindowFocus } from '@vueuse/core'

import { BgType, useSettingsStore } from '@/shared/settings'

import { useBgSwtichStore, useFocusStore } from '@newtab/scripts/store'

const focusStore = useFocusStore()
const settings = useSettingsStore()
const switchStore = useBgSwtichStore()
const backgroundWrapper = ref<HTMLDivElement>()
const imageRef = ref<HTMLDivElement>()
const videoRef = ref<HTMLVideoElement>()

defineProps<{ url: string }>()

const isDark = useDark()
const isWindowFocused = useWindowFocus()
const documentVisibility = useDocumentVisibility()

function updateVideoPlayback() {
  const vid = videoRef.value
  if (!vid) return
  // 如果页面不可见，或者窗口失去焦点且设置了失去焦点时暂停视频，则暂停视频
  if (
    document.visibilityState === 'hidden' ||
    (settings.background.pauseWhenBlur && !isWindowFocused.value)
  ) {
    try {
      vid.pause()
    } catch {}
  } else {
    try {
      // play() 会返回一个 Promise，使用 void 忽略未处理的 Promise 警告
      void vid.play()
    } catch {}
  }
}

const backgroundCss = computed(() => ({
  'background-container--default-scale': settings.perf.disableFocusScale,
  'background-container--focused__scale': focusStore.isFocused && !settings.perf.disableFocusScale,
  'background-container--focused__blur': focusStore.isFocused && !settings.perf.disableFocusBlur
}))

const isVideoWallpaper = computed(() => {
  if (settings.background.bgType !== BgType.Local) {
    return false
  }

  const mediaType = isDark.value
    ? (settings.localDarkBackground.mediaType ?? settings.localBackground.mediaType)
    : settings.localBackground.mediaType

  return mediaType === 'video'
})

watch(
  [isVideoWallpaper, documentVisibility, isWindowFocused, () => settings.background.pauseWhenBlur],
  ([isVideo]) => {
    if (!isVideo) {
      // 非视频壁纸，确保视频被暂停
      const vid = videoRef.value
      if (vid) {
        try {
          vid.pause()
        } catch {}
      }
      return
    }

    updateVideoPlayback()
  },
  { immediate: true }
)
</script>

<template>
  <div
    ref="backgroundWrapper"
    class="background-wrapper"
    :style="{
      '--mask-opacity': settings.background.bgMaskOpacity / 100,
      '--mask-color__light': settings.background.lightMaskColor,
      '--mask-color__night': settings.background.nightMaskColor,
      '--blur-intensity': `${settings.background.blurIntensity}px`
    }"
  >
    <div class="background-mask"></div>
    <div v-if="settings.background.enableVignetting" class="background__vignette" />
    <Transition name="v-fade">
      <div
        v-show="!switchStore.isSwitching"
        ref="bgRef"
        class="background-container"
        :class="backgroundCss"
      >
        <video
          v-if="isVideoWallpaper"
          class="background background--video"
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
          ref="imageRef"
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

.background-container {
  position: absolute;
  inset: calc(var(--blur-intensity) * -2);
  z-index: -2;
  filter: blur(var(--blur-intensity));
  transition:
    transform var(--el-transition-duration-fast) cubic-bezier(0.65, 0.05, 0.1, 1),
    filter var(--el-transition-duration-fast) cubic-bezier(0.65, 0.05, 0.1, 1),
    opacity var(--el-transition-duration-fast) ease-in-out;

  &--default-scale {
    transform: scale(1.05);
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

.background {
  width: 100%;
  height: 100%;
  background-color: var(--el-bg-color-page);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

video.background {
  width: calc(100% + 4 * var(--blur-intensity));
  height: calc(100% + 4 * var(--blur-intensity));
  object-fit: cover;
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
</style>
