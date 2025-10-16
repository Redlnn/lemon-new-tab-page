<script lang="ts" setup>
import { useDark, useDocumentVisibility, useWindowFocus } from '@vueuse/core'

import useTransientWillChange from '@/shared/composables/useTransientWillChange'
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
  'background--deafult-scale': settings.perf.disableFocusScale,
  'background--focused__scale': focusStore.isFocused && !settings.perf.disableFocusScale,
  'background--focused__blur': focusStore.isFocused && !settings.perf.disableFocusBlur
}))

// 仅在“视频壁纸”时才处理播放/暂停
const isVideoWallpaper = computed(
  () =>
    settings.background.bgType === BgType.Local &&
    (isDark.value
      ? settings.localDarkBackground.mediaType !== 'image'
      : settings.localBackground.mediaType === 'video')
)

let stopFocusWatch: (() => void) | null = null
let stopVisWatch: (() => void) | null = null

watch(
  [isVideoWallpaper, () => settings.background.pauseWhenBlur],
  ([isVideo, pauseWhenBlur]) => {
    // 先清理旧的监听，避免重复注册
    if (stopFocusWatch) {
      stopFocusWatch()
      stopFocusWatch = null
    }
    if (stopVisWatch) {
      stopVisWatch()
      stopVisWatch = null
    }

    if (isVideo) {
      // 文档可见性：视频壁纸时始终关注（不可见时一律暂停）
      stopVisWatch = watch(documentVisibility, updateVideoPlayback)
      // 窗口焦点：仅在设置开启“失焦暂停”时才关注
      if (pauseWhenBlur) {
        stopFocusWatch = watch(isWindowFocused, updateVideoPlayback)
      }
    } else {
      // 切换为非视频壁纸时，确保视频被暂停
      const vid = videoRef.value
      if (vid) {
        try {
          vid.pause()
        } catch {}
      }
    }
  },
  { immediate: true }
)

// 当 focus 状态变化会触发缩放类的切换，在 DOM 更新（class 变更）之前
// 先设置 will-change，这样浏览器可以在合成层上做优化。使用 flush: 'pre'。
const { trigger: triggerWillChange } = useTransientWillChange({
  property: 'transform',
  timeout: 1000
})

watch(
  () => focusStore.isFocused,
  async () => {
    await Promise.all([
      // 如果视频/图片存在，通过等待下一个 rAF触发确保在 DOM 变更之前应用 will-change。
      videoRef.value ? triggerWillChange(videoRef) : Promise.resolve(),
      imageRef.value ? triggerWillChange(imageRef) : Promise.resolve()
    ])
  },
  { flush: 'pre' }
)

onUnmounted(() => {
  stopFocusWatch?.()
  stopVisWatch?.()
})
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
    <Transition>
      <div v-show="!switchStore.isSwitching">
        <video
          v-if="isVideoWallpaper"
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
          ref="imageRef"
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
