<script setup lang="ts">
import { promiseTimeout } from '@vueuse/core'

import { Plus } from '@vicons/fa'
import { CloseRound, CloudOffRound } from '@vicons/material'
import type { InputInstance, UploadProps, UploadRequestOptions } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import { browser } from 'wxt/browser'

import { isMediaFile } from '@/shared/media'
import {
  BgType,
  uploadBackground,
  useDarkWallpaperStore,
  useSettingsStore,
  useWallpaperStore
} from '@/shared/settings'

const { t } = useTranslation('settings')

const settings = useSettingsStore()
const isChrome = import.meta.env.CHROME || import.meta.env.EDGE
const tmpUrl = ref('') // 用于在线壁纸输入框的临时存储，避免频繁修改 settingsStore
const onlineUrlInput = ref<InputInstance>()

const predefineMaskColor = ['#f2f3f5', '#000']

// 大小阈值 (字节)，超过会提示用户。这里设置为 50MB
const WARN_SIZE_BYTES = 50 * 1024 * 1024

// 存储上传后的元信息，用于在 UI 显示：{ width, height, duration?, size }
const metaLight = ref<{ width?: number; height?: number; duration?: number; size?: number } | null>(
  null
)
const metaDark = ref<{ width?: number; height?: number; duration?: number; size?: number } | null>(
  null
)

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 当本地壁纸被上传/更改时，自动读取并显示元信息
// 自定义上传处理：调用 uploadBackground 并在上传完成后读取并显示媒体元信息
async function handleUpload(option: UploadRequestOptions, isDark = false) {
  const file = option.file as File

  await uploadBackground(file, isDark)

  // 上传完成后立即读取元信息以展示
  const setMeta = (m: { width?: number; height?: number; duration?: number }) => {
    if (isDark) {
      metaDark.value = { ...metaDark.value, ...m, size: file.size }
    } else {
      metaLight.value = { ...metaLight.value, ...m, size: file.size }
    }
  }

  readMediaMeta(file, setMeta)
}

const beforeBackgroundUpload: UploadProps['beforeUpload'] = async (rawFile) => {
  if (!isMediaFile(rawFile)) {
    ElMessage.error(t('background.warning.fileIsNotImage'))
    return false
  }

  // 检查大小
  if (rawFile.size > WARN_SIZE_BYTES) {
    // 提示用户文件较大，确认是否继续
    try {
      await ElMessageBox.confirm(
        t('background.warning.tooLarge.message', {
          size: formatBytes(rawFile.size)
        }),
        t('background.warning.tooLarge.title'),
        { type: 'warning' }
      )
    } catch {
      // 用户取消上传
      return false
    }
  }

  return true
}

async function handlePermissions(_url: string, hostname: string) {
  const permissions = { origins: [`*://${hostname}/*`] }
  try {
    const granted = await browser.permissions.contains(permissions)
    if (granted) {
      settings.background.onlineUrl = _url
      return
    }

    const confirmed = await ElMessageBox.confirm(
      t('background.warning.securityPolicy', { host: hostname })
    )

    if (confirmed) {
      const requested = await browser.permissions.request(permissions)
      if (requested) {
        ElMessage.success(t('background.warning.granted'))
        settings.background.onlineUrl = _url
      } else {
        ElMessage.error(t('background.warning.notGranted'))
        settings.background.bgType = BgType.None
        tmpUrl.value = ''
      }
    }
  } catch {
    // 用户取消或报错
    settings.background.bgType = BgType.None
    tmpUrl.value = ''
  }
}

function changeOnlineBg(e: Event) {
  onlineUrlInput.value?.blur()
  const _url = (e.target as HTMLInputElement).value
  if (!_url) {
    settings.background.bgType = BgType.None
    settings.background.onlineUrl = ''
    tmpUrl.value = ''
    return
  }
  const hostname = new URL(_url).hostname

  if (!isChrome) {
    settings.background.onlineUrl = _url
    return
  }

  handlePermissions(_url, hostname)
}

function onlineImageWarn() {
  if (settings.background.onlineUrl) return
  ElMessageBox.confirm(t('background.warning.unknownSource'), t('background.warning.title'), {
    type: 'warning'
  }).catch(() => {
    settings.background.bgType = BgType.None
  })
}

async function deleteLocalBg(isDark = false) {
  if (isDark) {
    const oldUrl = settings.localDarkBackground.url
    settings.localDarkBackground = { id: '', url: '', mediaType: undefined }
    metaDark.value = null
    await promiseTimeout(1000) // 确保 UI 更新完毕释放占用后再清除
    URL.revokeObjectURL(oldUrl)
    useDarkWallpaperStore.clear()
  } else {
    const oldUrl = settings.localBackground.url
    settings.localBackground = { id: '', url: '', mediaType: undefined }
    metaLight.value = null
    await promiseTimeout(1000)
    URL.revokeObjectURL(oldUrl)
    useWallpaperStore.clear()
  }
}

function readMediaMeta(
  file: File,
  cb: (meta: { width?: number; height?: number; duration?: number }) => void
) {
  if (!file) return
  if (file.type.startsWith('image/')) {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      cb({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      cb({})
    }
    img.src = url
  } else if (file.type.startsWith('video/')) {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    const cleanup = () => {
      video.onloadedmetadata = null
      video.onerror = null
      video.src = ''
      URL.revokeObjectURL(url)
    }
    video.onloadedmetadata = () => {
      cb({ width: video.videoWidth, height: video.videoHeight, duration: video.duration })
      cleanup()
    }
    video.onerror = () => {
      cleanup()
      cb({})
    }
    video.src = url
  } else {
    cb({})
  }
}

onMounted(async () => {
  if (settings.background.onlineUrl) {
    tmpUrl.value = settings.background.onlineUrl
  }

  // 加载已存在的本地壁纸元数据（light & dark）以便在设置页显示
  if (settings.localBackground?.id) {
    try {
      const file = await useWallpaperStore.getItem<Blob>(settings.localBackground.id)
      if (file) {
        metaLight.value = { size: (file as File).size }
        readMediaMeta(file as File, (m) => {
          metaLight.value = { ...metaLight.value, ...m }
        })
        // 如果没有 mediaType，则根据文件类型自动设置
        if (!settings.localBackground.mediaType) {
          settings.localBackground.mediaType = file.type.startsWith('video/') ? 'video' : 'image'
        }
      }
    } catch {}
  }

  if (settings.localDarkBackground?.id) {
    try {
      const file = await useDarkWallpaperStore.getItem<Blob>(settings.localDarkBackground.id)
      if (file) {
        metaDark.value = { size: (file as File).size }
        readMediaMeta(file as File, (m) => {
          metaDark.value = { ...metaDark.value, ...m }
        })
        if (!settings.localDarkBackground.mediaType) {
          settings.localDarkBackground.mediaType = file.type.startsWith('video/')
            ? 'video'
            : 'image'
        }
      }
    } catch {}
  }
})

const isVideoBg = computed(
  () =>
    settings.background.bgType === BgType.Local &&
    (settings.localBackground.mediaType === 'video' ||
      settings.localDarkBackground.mediaType === 'video')
)
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--vertical">
      <div class="settings__label">
        {{ t('background.type.title') }}
        <cloud-off-round />
      </div>
      <el-radio-group v-model="settings.background.bgType">
        <el-radio :value="BgType.None">
          {{ t('background.type.none') }}
        </el-radio>
        <el-radio :value="BgType.Local">
          {{ t('background.type.local') }}
        </el-radio>
        <el-radio :value="BgType.Bing">
          {{ t('background.type.bing') }}
        </el-radio>
        <el-radio :value="BgType.Online" @change="onlineImageWarn">
          {{ t('background.type.online') }}
        </el-radio>
      </el-radio-group>
    </div>
    <el-input
      v-if="settings.background.bgType === BgType.Online"
      ref="onlineUrlInput"
      v-model="tmpUrl"
      @blur="changeOnlineBg"
      @keydown.enter="changeOnlineBg"
      placeholder="https://example.com/image.jpg"
    ></el-input>
    <ul v-if="settings.background.bgType === BgType.Online" class="settings__online-bg-tips">
      <li>{{ t('background.onlineTips.a') }}</li>
      <li>{{ t('background.onlineTips.b') }}</li>
      <li>{{ t('background.onlineTips.c') }}</li>
      <li>{{ t('background.onlineTips.d') }}</li>
    </ul>
    <p v-if="settings.background.bgType === BgType.Local" class="settings__item--note">
      {{ t('background.tip') }}
    </p>
    <div v-if="settings.background.bgType === BgType.Local" class="settings__bg-uploader-container">
      <div class="settings__bg-uploader-wrapper">
        <el-upload
          class="settings__bg-uploader"
          :show-file-list="false"
          :http-request="(option: UploadRequestOptions) => handleUpload(option)"
          :before-upload="beforeBackgroundUpload"
          accept="image/*,video/*"
        >
          <template v-if="settings.localBackground.id">
            <video
              v-if="settings.localBackground.mediaType === 'video'"
              :src="settings.localBackground.url"
              class="settings__bg-uploader-img"
              muted
              loop
              playsinline
            ></video>
            <img v-else :src="settings.localBackground.url" class="settings__bg-uploader-img" />
          </template>
          <el-icon v-else class="settings__bg-uploader-icon"><plus /></el-icon>
        </el-upload>
        <div
          v-if="settings.localBackground.id"
          class="settings__bg-uploader-delete"
          @click="deleteLocalBg()"
        >
          <el-icon><CloseRound /></el-icon>
        </div>
        <div class="settings__bg-uploader-title">
          {{ t('theme.lightMode') }}
        </div>
        <div v-if="metaLight" class="settings__bg-uploader-meta">
          <div>
            {{ metaLight.size ? formatBytes(metaLight.size) : '' }}
            {{ metaLight.width ? `${metaLight.width}×${metaLight.height}` : '' }}
            {{ metaLight.duration ? `${metaLight.duration.toFixed(1)}s` : '' }}
          </div>
        </div>
      </div>
      <div class="settings__bg-uploader-wrapper">
        <el-upload
          class="settings__bg-uploader"
          :show-file-list="false"
          :http-request="(option: UploadRequestOptions) => handleUpload(option, true)"
          :before-upload="beforeBackgroundUpload"
          accept="image/*,video/*"
        >
          <template v-if="settings.localDarkBackground.id">
            <video
              v-if="settings.localDarkBackground.mediaType === 'video'"
              :src="settings.localDarkBackground.url"
              class="settings__bg-uploader-img"
              muted
              loop
              playsinline
            ></video>
            <img v-else :src="settings.localDarkBackground.url" class="settings__bg-uploader-img" />
          </template>
          <el-icon v-else class="settings__bg-uploader-icon"><plus /></el-icon>
        </el-upload>
        <div
          v-if="settings.localDarkBackground.id"
          class="settings__bg-uploader-delete"
          @click="deleteLocalBg(true)"
        >
          <el-icon><CloseRound /></el-icon>
        </div>
        <div class="settings__bg-uploader-title">
          {{ t('theme.darkMode') }}
        </div>
        <div v-if="metaDark" class="settings__bg-uploader-meta">
          <div>
            {{ metaDark.size ? formatBytes(metaDark.size) : '' }}
            {{ metaDark.width ? `${metaDark.width}×${metaDark.height}` : '' }}
            {{ metaDark.duration ? `${metaDark.duration.toFixed(1)}s` : '' }}
          </div>
        </div>
      </div>
    </div>
    <p v-if="isVideoBg" class="settings__item--note" style="margin-top: 0.5em">
      {{ t('background.videoWarning') }}
    </p>
    <div v-if="isVideoBg" class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.pauseWhenBlur') }}</div>
      <el-switch v-model="settings.background.pauseWhenBlur" />
    </div>
    <p v-if="isVideoBg" class="settings__item--note">
      {{ t('background.videoBlurTip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.enableVignetting') }}</div>
      <el-switch v-model="settings.background.enableVignetting" />
    </div>
    <div
      v-if="settings.background.bgType !== BgType.None"
      class="settings__item settings__item--vertical"
    >
      <div class="settings__label">{{ t('background.blur') }}</div>
      <el-slider v-model="settings.background.blurIntensity" :show-tooltip="false" />
    </div>
    <div class="settings__item">
      <div class="settings__label settings__item--vertical">
        {{ t('background.maskOpacity') }}
      </div>
      <el-slider v-model="settings.background.bgMaskOpacity" :show-tooltip="false" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.maskColor') }}</div>
      <span>
        <span>{{ t('theme.lightMode') }}:&ensp;</span>
        <el-color-picker
          v-model="settings.background.lightMaskColor"
          :predefine="predefineMaskColor"
          @change="
            () => {
              if (settings.background.lightMaskColor === null) {
                settings.background.lightMaskColor = '#f2f3f5'
              }
            }
          "
        />
        <span style="margin-left: 1em">{{ t('theme.darkMode') }}:&ensp;</span>
        <el-color-picker
          v-model="settings.background.nightMaskColor"
          :predefine="predefineMaskColor"
          @change="
            () => {
              if (settings.background.nightMaskColor === null) {
                settings.background.nightMaskColor = '#000'
              }
            }
          "
        />
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings__bg-uploader-container {
  display: flex;
  gap: 15px;
  margin-top: -6px;
}

.settings__bg-uploader-delete {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--el-color-white);
  cursor: pointer;
  background-color: var(--el-color-danger);
  border-radius: 50%;
  box-shadow: var(--el-box-shadow-lighter);
}

.settings__bg-uploader-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.settings__bg-uploader-wrapper {
  position: relative;
  width: 100%;
}

.settings__bg-uploader-title {
  margin-top: 8px;
  font-size: var(--el-font-size-small);
  color: var(--el-text-color-secondary);
  text-align: center;
}

.settings__bg-uploader-meta {
  margin-top: 6px;
  font-size: var(--el-font-size-extra-small);
  color: var(--el-text-color-placeholder);
  text-align: center;
}

.settings__bg-uploader {
  flex: 1;
  height: 150px;

  .settings__bg-uploader-icon {
    font-size: 28px;
    color: var(--el-text-color-placeholder);
    text-align: center;
    transition: var(--el-transition-duration-fast);
  }

  &:deep() .el-upload {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: pointer;
    border: 1px dashed var(--el-text-color-placeholder);
    border-radius: 6px;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);

      .settings__bg-uploader-icon {
        color: var(--el-color-primary);
      }
    }
  }
}

.settings__online-bg-tips {
  padding: 5px 15px 0;
  margin-top: 5px;
  font-size: var(--el-font-size-extra-small);
  color: var(--el-text-color-placeholder);

  li {
    margin: 3px 0;
  }
}

:deep() .el-radio {
  margin-right: 15px;

  &__label {
    display: flex;
    align-items: center;

    svg {
      width: 1em;
      height: 1em;
      margin-left: 0.5em;
      opacity: 0.5;
    }
  }
}
</style>
