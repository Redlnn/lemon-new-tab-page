import { promiseTimeout, useDark } from '@vueuse/core'

import type { InputInstance, UploadProps, UploadRequestOptions } from 'element-plus'
import i18next from 'i18next'
import { browser } from 'wxt/browser'

import { isMediaFile } from '@/shared/media'
import {
  BgType,
  uploadBackground,
  useDarkWallpaperStore,
  useSettingsStore,
  useWallpaperStore
} from '@/shared/settings'

// 大小阈值 (字节)，超过会提示。这里设置为 50MB
const WARN_SIZE_BYTES = 50 * 1024 * 1024

const settings = useSettingsStore()

const isDark = useDark()

function useBackgroundSwitcher() {
  const isDarkBg = ref(false)

  // 存储上传后的元信息
  const metaLight = ref<{
    width?: number
    height?: number
    duration?: number
    size?: number
  } | null>(null)
  const metaDark = ref<{
    width?: number
    height?: number
    duration?: number
    size?: number
  } | null>(null)

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const readMediaMeta = (
    file: File,
    cb: (meta: { width?: number; height?: number; duration?: number }) => void
  ) => {
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

  const beforeBackgroundUpload: UploadProps['beforeUpload'] = async (rawFile: File) => {
    if (!isMediaFile(rawFile)) {
      ElMessage.error(i18next.t('settings:background.warning.fileIsNotImage'))
      return false
    }

    // 检查大小
    if (rawFile.size > WARN_SIZE_BYTES) {
      // 提示用户文件较大，确认是否继续
      try {
        await ElMessageBox.confirm(
          i18next.t('settings:background.warning.tooLarge.message', {
            size: formatBytes(rawFile.size)
          }),
          i18next.t('settings:background.warning.tooLarge.title'),
          { type: 'warning' }
        )
      } catch {
        // 用户取消上传
        return false
      }
    }

    return true
  }

  const handleUpload = async (option: UploadRequestOptions) => {
    const file = option.file as File

    await uploadBackground(file, isDarkBg.value)

    // 上传完成后立即读取元信息以展示
    const setMeta = (m: { width?: number; height?: number; duration?: number }) => {
      if (isDarkBg.value) {
        metaDark.value = { ...metaDark.value, ...m, size: file.size }
      } else {
        metaLight.value = { ...metaLight.value, ...m, size: file.size }
      }
    }

    readMediaMeta(file, setMeta)
  }

  const deleteLocalBg = async () => {
    if (isDarkBg.value) {
      const oldUrl = settings.localDarkBackground.url
      settings.localDarkBackground = { id: '', url: '', mediaType: undefined }
      metaDark.value = null
      await nextTick()
      await promiseTimeout(200)
      try {
        URL.revokeObjectURL(oldUrl)
      } catch {}
      useDarkWallpaperStore.clear()
    } else {
      const oldUrl = settings.localBackground.url
      settings.localBackground = { id: '', url: '', mediaType: undefined }
      metaLight.value = null
      await nextTick()
      await promiseTimeout(200)
      try {
        URL.revokeObjectURL(oldUrl)
      } catch {}
      useWallpaperStore.clear()
    }
  }

  // 在线壁纸相关
  const onlineUrlInput = ref<InputInstance>()
  const localUrl = ref('') // 用于在线壁纸输入框的临时存储，避免频繁修改 settingsStore
  const isChrome = import.meta.env.CHROME || import.meta.env.EDGE

  const onlineImageWarn = async () => {
    if (settings.background.onlineUrl) {
      settings.background.bgType = BgType.Online
      return
    }
    ElMessageBox.confirm(
      i18next.t('settings:background.warning.unknownSource'),
      i18next.t('settings:background.warning.title'),
      {
        type: 'warning'
      }
    )
      .then(() => {
        settings.background.bgType = BgType.Online
      })
      .catch(() => {
        settings.background.bgType = BgType.None
      })
  }

  const handlePermissions = async (_url: string, hostname: string) => {
    const permissions = { origins: [`*://${hostname}/*`] }
    try {
      const granted = await browser.permissions.contains(permissions)
      if (granted) {
        settings.background.onlineUrl = _url
        return
      }

      const confirmed = await ElMessageBox.confirm(
        i18next.t('settings:background.warning.securityPolicy', { host: hostname })
      )

      if (confirmed) {
        const requested = await browser.permissions.request(permissions)
        if (requested) {
          ElMessage.success(i18next.t('settings:background.warning.granted'))
          settings.background.onlineUrl = _url
        } else {
          ElMessage.error(i18next.t('settings:background.warning.notGranted'))
          settings.background.bgType = BgType.None
          localUrl.value = ''
        }
      }
    } catch {
      // 用户取消或报错
      settings.background.bgType = BgType.None
      localUrl.value = ''
    }
  }

  const changeOnlineBg = (e: Event) => {
    onlineUrlInput.value?.blur()
    const _url = (e.target as HTMLInputElement).value
    if (!_url) {
      settings.background.bgType = BgType.None
      settings.background.onlineUrl = ''
      localUrl.value = ''
      return
    }
    const { hostname } = new URL(_url)

    if (!isChrome) {
      settings.background.onlineUrl = _url
      return
    }

    handlePermissions(_url, hostname)
  }

  onMounted(async () => {
    isDarkBg.value = settings.localDarkBackground.id ? isDark.value : false

    const tasks: Array<Promise<void>> = []

    if (settings.localBackground?.id) {
      tasks.push(
        (async () => {
          try {
            const file = await useWallpaperStore.getItem<Blob>(settings.localBackground.id)
            if (file) {
              metaLight.value = { size: (file as File).size }
              readMediaMeta(file as File, (m) => {
                metaLight.value = { ...metaLight.value, ...m }
              })
              if (!settings.localBackground.mediaType) {
                settings.localBackground.mediaType = file.type.startsWith('video/')
                  ? 'video'
                  : 'image'
              }
            }
          } catch {}
        })()
      )
    }

    if (settings.localDarkBackground?.id) {
      tasks.push(
        (async () => {
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
        })()
      )
    }

    await Promise.all(tasks)

    if (settings.background.onlineUrl) {
      localUrl.value = settings.background.onlineUrl
    }
  })

  return {
    isDarkBg,
    metaLight,
    metaDark,
    formatBytes,
    beforeBackgroundUpload,
    handleUpload,
    deleteLocalBg,
    onlineUrlInput,
    localUrl,
    changeOnlineBg,
    onlineImageWarn
  }
}

export default useBackgroundSwitcher
