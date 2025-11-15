<script lang="ts" setup>
import { promiseTimeout, useDark, useDocumentVisibility, useWindowFocus } from '@vueuse/core'

import { verifyImageUrl, verifyVideoUrl } from '@/shared/media'
import { BgType, reloadBackground, useSettingsStore } from '@/shared/settings'

import { bingWallpaperURLGetter } from '@newtab/scripts/api/bingWallpaper'
import { useBgSwtichStore, useFocusStore } from '@newtab/scripts/store'

const isDark = useDark()
const focusStore = useFocusStore()
const settings = useSettingsStore()
const switchStore = useBgSwtichStore()
const backgroundWrapper = ref<HTMLDivElement>()
const imageRef = ref<HTMLDivElement>()
const videoRef = ref<HTMLVideoElement>()
const bgURL = ref<string>('')

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

// 壁纸更新相关逻辑

interface BgURLProvider {
  getURL: () => Promise<string> | Ref<string>
  verify?: () => Promise<boolean>
}

const bgTypeProviders: Record<BgType, BgURLProvider> = {
  [BgType.Bing]: {
    getURL: () => bingWallpaperURLGetter.getBgUrl()
  },
  [BgType.Local]: {
    getURL: async () =>
      isDark.value
        ? settings.localDarkBackground.id
          ? settings.localDarkBackground.url
          : settings.localBackground.url
        : settings.localBackground.url,
    verify: async () => {
      const { localBackground, localDarkBackground } = useSettingsStore()

      // 如果没 url，则尝试加载
      if (!localBackground.url) {
        await reloadBackground(false)
        if (!localDarkBackground.id) return true
      }
      if (localDarkBackground.id && !localDarkBackground.url) {
        await reloadBackground(true)
        return true
      }

      // 校验 URL 是否有效
      const verifyLight = () => {
        if (localBackground.mediaType === 'image') {
          return verifyImageUrl(localBackground.url)
        }
        if (localBackground.mediaType === 'video') {
          // 对于视频，简单判断 URL 可达即可
          return verifyVideoUrl(localBackground.url)
        }
      }
      const verifyDark = () => {
        if (!localDarkBackground.id) return Promise.resolve(true)
        if (localDarkBackground.mediaType === 'image') {
          return verifyImageUrl(localDarkBackground.url)
        }
        if (localDarkBackground.mediaType === 'video') {
          // 对于视频，简单判断 URL 可达即可
          return verifyVideoUrl(localDarkBackground.url)
        }
      }

      const [isValid, isValidDark] = await Promise.all([verifyLight(), verifyDark()])

      // 如无效则重新加载
      if (!isValid) {
        await reloadBackground(false)
      }
      if (!isValidDark && localDarkBackground.id) {
        await reloadBackground(true)
      }

      return true
    }
  },
  [BgType.Online]: {
    getURL: () => Promise.resolve(settings.background.onlineUrl)
  },
  [BgType.None]: {
    getURL: () => Promise.resolve('')
  }
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

// 动态watch管理
let stopBingBgWatch: (() => void) | undefined
let stopLocalBgWatch: (() => void) | null = null
let stopOnlineBgWatch: (() => void) | null = null

async function updateBackgroundURL(type: BgType): Promise<void> {
  const provider = bgTypeProviders[type]
  if (!provider) return

  switchStore.start()

  if (provider.verify) {
    await provider.verify()
  }
  const newUrl = await provider.getURL()

  // 等待过渡动画
  await promiseTimeout(300)
  bgURL.value = ''
  // 不直接赋值是因为避免看到壁纸变形
  // 直接赋值为原始 URL（Background 组件会决定是否包裹 url()）
  stopBingBgWatch?.() // 切换 provider 时清除旧监听
  stopBingBgWatch = await assignMaybeRef(bgURL, newUrl)

  switchStore.end()
}

// 本地背景URL变化处理器
async function handleLocalBgChange() {
  const shouldUseDark = isDark.value && settings.localDarkBackground?.id
  const currentUrl = shouldUseDark ? settings.localDarkBackground.url : settings.localBackground.url

  // 只在URL真正变化时才执行切换动画
  if (bgURL.value === currentUrl) return

  if (settings.localDarkBackground?.id) {
    await bgTypeProviders[BgType.Local].verify?.()
  }

  switchStore.start()
  await promiseTimeout(300)
  bgURL.value = ''
  // 不直接赋值是因为避免看到壁纸变形
  bgURL.value = currentUrl
  switchStore.end()
}

// 在线背景URL变化处理器
async function handleOnlineBgChange(newUrl: string) {
  if (bgURL.value === newUrl) return

  switchStore.start()
  await promiseTimeout(300)
  bgURL.value = ''
  bgURL.value = newUrl
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
    stopLocalBgWatch = watch(
      [() => settings.localBackground.url, () => settings.localDarkBackground.url, isDark],
      handleLocalBgChange
    )
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

onMounted(async () => {
  bingWallpaperURLGetter.init()
  await updateBackgroundURL(settings.background.bgType)

  // 初始化时激活当前背景类型的watch
  activateBackgroundWatch(settings.background.bgType)
})

// 组件卸载时清理watch
onUnmounted(() => {
  stopLocalBgWatch?.()
  stopOnlineBgWatch?.()
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
        <div
          v-else
          class="background"
          ref="imageRef"
          :style="{
            backgroundImage: bgURL ? (bgURL.startsWith('url') ? bgURL : `url(${bgURL})`) : undefined
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
