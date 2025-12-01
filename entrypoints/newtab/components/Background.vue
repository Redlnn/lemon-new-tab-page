<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import {
  promiseTimeout,
  useDark,
  useDocumentVisibility,
  useTimeoutFn,
  useWindowFocus
} from '@vueuse/core'

import { browser } from '#imports'

import { BgType, useSettingsStore } from '@/shared/settings'

import { useBgSwtichStore, useFocusStore } from '@newtab/shared/store'
import { applyMonet } from '@newtab/shared/theme'
import { bingWallpaperURLGetter, useWallpaperUrlStore } from '@newtab/shared/wallpaper'

const isDark = useDark()

const focusStore = useFocusStore()
const settings = useSettingsStore()
const wallpaperUrlStore = useWallpaperUrlStore()
const { lightUrl, darkUrl } = storeToRefs(wallpaperUrlStore)
const switchStore = useBgSwtichStore()

const backgroundWrapper = ref<HTMLDivElement>()
const imageRef = ref<HTMLImageElement>()
const videoRef = ref<HTMLVideoElement>()
const bgURL = ref<string>('')

const bgURLreg = new RegExp('url\\((["\']?)(.*?)\\1\\)', 'i')
const isChrome = import.meta.env.CHROME || import.meta.env.EDGE

// 视频壁纸相关逻辑

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

// 壁纸更新相关逻辑

const currentLocalUrl = computed(() => {
  if (isDark.value && settings.localDarkBackground.id) {
    return darkUrl
  }
  return lightUrl
})

const bgTypeProviders: Record<
  BgType,
  () => string | Promise<string> | Ref<string> | Promise<Ref<string>>
> = {
  [BgType.Bing]: () => bingWallpaperURLGetter.getBgUrl(),
  [BgType.Local]: () => currentLocalUrl.value,
  [BgType.Online]: async () => {
    if (!settings.monetColor) {
      return settings.background.onlineUrl
    }
    if (isChrome) {
      const allGranted = await browser.permissions.contains({ origins: [`*://*/*`] })
      if (!allGranted) {
        return settings.background.onlineUrl
      }
    }
    console.log('Fetching online background for Monet color extraction...')
    try {
      const response = await fetch(settings.background.onlineUrl)
      if (!response.ok) throw new Error(response.statusText)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      return blobUrl
    } catch {
      return settings.background.onlineUrl
    }
  },
  [BgType.None]: () => Promise.resolve('')
}

async function assignMaybeRef<T>(
  target: Ref<T>,
  source: T | Ref<T> | Promise<T> | Promise<Ref<T>>
) {
  let stop: (() => void) | undefined

  const process = async () => {
    const resolved = await source
    if (isRef(resolved)) {
      stop?.() // 停止旧的 watch（避免重复）
      stop = watch(resolved, (v) => (target.value = v), { immediate: true })
    } else {
      target.value = resolved
    }
  }

  process()
  return () => stop?.()
}

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

// 动态watch管理
let stopBgWatch: (() => void) | undefined
let stopLocalBgWatch: (() => void) | null = null
let stopOnlineBgWatch: (() => void) | null = null

async function updateBackgroundURL(type: BgType): Promise<void> {
  const provider = bgTypeProviders[type]
  if (!provider) return

  switchStore.start()
  const newUrl = await provider()

  // 等待过渡动画
  if (bgURL.value !== '') {
    // 首次打开默认白屏，不需要等待白屏动画
    await promiseTimeout(300)
    bgURL.value = ''
  }
  // 不直接赋值是因为避免看到壁纸变形
  // 直接赋值为原始 URL（Background 组件会决定是否包裹 url()）
  stopBgWatch?.() // 切换 provider 时清除旧监听
  stopBgWatch = await assignMaybeRef(bgURL, newUrl)

  switchStore.end()
}

// 本地背景URL变化处理器
async function handleLocalBgChange() {
  const newUrl = currentLocalUrl.value

  // 只在URL真正变化时才执行切换动画
  if (bgURL.value === newUrl.value) return

  switchStore.start()
  await promiseTimeout(300)
  bgURL.value = ''
  // 不直接赋值是因为避免看到壁纸变形
  bgURL.value = newUrl.value
  switchStore.end()
}

// 在线背景URL变化处理器
async function handleOnlineBgChange() {
  switchStore.start()
  await promiseTimeout(300)
  bgURL.value = ''
  const provider = bgTypeProviders[BgType.Online]
  const newUrl = await provider()
  await assignMaybeRef(bgURL, newUrl)
  switchStore.end()
}

// 根据背景类型激活对应的watch
function activateBackgroundWatch(type: BgType) {
  // 清理旧的watch
  stopLocalBgWatch?.()
  stopOnlineBgWatch?.()
  stopLocalBgWatch = null
  stopOnlineBgWatch = null

  // 根据类型激活对应的watch
  if (type === BgType.Local) {
    // 只在使用本地背景时监听本地背景变化
    stopLocalBgWatch = watch(currentLocalUrl, handleLocalBgChange)
  } else if (type === BgType.Online) {
    // 只在使用在线背景时监听在线URL变化
    stopOnlineBgWatch = watch(() => settings.background.onlineUrl, handleOnlineBgChange)
  }
  // Bing和None类型不需要watch，因为它们不会动态变化
}

// 监听背景类型切换，动态激活/停用对应的watch
watch(
  () => settings.background.bgType,
  async (newType) => {
    await updateBackgroundURL(newType)
    activateBackgroundWatch(newType)
  }
)

watch(
  () => settings.monetColor,
  async (statu) => {
    if (statu) {
      document.documentElement.classList.add('monet')
      if (bgURL.value !== '' && !isVideoWallpaper.value) {
        // 设置界面切换开关时才触发计算（此时有背景）
        await applyMonet(imageRef.value)
      }
    } else {
      document.documentElement.classList.remove('monet')
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await bingWallpaperURLGetter.init()
  await updateBackgroundURL(settings.background.bgType)

  // 初始化时激活当前背景类型的watch
  activateBackgroundWatch(settings.background.bgType)
})

// 组件卸载时清理watch
onUnmounted(() => {
  stopLocalBgWatch?.()
  stopOnlineBgWatch?.()
})

async function onImgLoaded() {
  if (!(settings.monetColor || isVideoWallpaper.value)) return
  if (bgURL.value.startsWith('http')) return
  // 不加延迟会导致刷新开屏卡住切换动画
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      useTimeoutFn(() => applyMonet(imageRef.value), 0)
    })
  })
}
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
          :src="bgURL || ''"
          autoplay
          muted
          loop
          playsinline
        ></video>
        <img
          v-else
          class="background"
          ref="imageRef"
          :src="
            bgURL ? (bgURL.startsWith('url') ? bgURL.replace(bgURLreg, '$2') : bgURL) : undefined
          "
          @load="onImgLoaded"
        />
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
  object-fit: cover;
}

video.background {
  width: calc(100% + 4 * var(--blur-intensity));
  height: calc(100% + 4 * var(--blur-intensity));
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
