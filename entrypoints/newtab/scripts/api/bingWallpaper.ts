import i18next from 'i18next'

import { isImageFile, verifyImageUrl } from '@/shared/media'
import enhancedFetch from '@/shared/network/fetch'
import { saveSettings, useBingWallpaperStore, useSettingsStore } from '@/shared/settings'

interface BingWallpaperImage {
  startdate: number
  fullstartdate: number
  enddate: number
  url: string
  urlbase: string
  copyright: string
  copyrightlink: string
  title: string
  quiz: string
  wp: boolean
  hsh: string
  drk: number
  top: number
  bot: number
  hs: unknown[]
}

interface BingWallpaperResp {
  images: BingWallpaperImage[]
  tooltips: {
    loading: string
    previous: string
    next: string
    walle: string
    walls: string
  }
}

function formatUTCCompact(date: Date): number {
  const Y = date.getUTCFullYear()
  const M = date.getUTCMonth() + 1
  const D = date.getUTCDate()
  const h = date.getUTCHours()
  const m = date.getUTCMinutes()

  // 拼接成 202511111600 这种整数格式再转字符串
  return Y * 100000000 + M * 1000000 + D * 10000 + h * 100 + m
}

class BingWallpaperURLGetter {
  public url: Ref<string> = ref('')
  public info: Ref<BingWallpaperImage | null> = ref(null)
  public uhdUrl: Ref<string> = ref('')

  private async resolveLocalBingWallpaperURL(id: string, url: string) {
    const file = await useBingWallpaperStore.getItem<Blob>(id)
    if (file && isImageFile(file)) {
      const objectUrl = URL.createObjectURL(file)
      if (await verifyImageUrl(objectUrl)) {
        return objectUrl
      }
    }

    URL.revokeObjectURL(url)
    await useBingWallpaperStore.removeItem(id)
    await this.revokeSettingsURL()
    return null
  }

  private async revokeSettingsURL() {
    const settings = useSettingsStore()

    URL.revokeObjectURL(settings.bingBackground.url)
    settings.bingBackground.id = ''
    settings.bingBackground.url = ''
    void saveSettings(settings)
  }

  private toWebp(url: string) {
    return url.replace(/\/th\?id=([^&]+)_([0-9x]+|UHD)\.jpg.*$/, '/th?id=$1_$2.webp')
  }

  private updateUHDUrl(url: string) {
    this.uhdUrl.value = url.replace(
      /\/th\?id=([^&]+)_([0-9x]+|UHD)\.jpg.*$/,
      'https://bing.com/th?id=$1_UHD.jpg'
    )
  }

  public getBgUrl() {
    return this.url
  }

  public getInfo() {
    return this.info
  }

  public async refresh() {
    const settings = useSettingsStore()

    // 兼容旧版逻辑：如果 updateDate 存在，迁移到 startdate
    if (typeof settings.bingBackground.updateDate === 'string') {
      // 将旧版的 new Date().toDateString() 格式转换为 ISO 格式
      const parsedDate = new Date(settings.bingBackground.updateDate)
      if (!isNaN(parsedDate.getTime())) {
        settings.bingBackground.updateDate = formatUTCCompact(parsedDate)
        await saveSettings(settings)
      }
    }

    let data: BingWallpaperResp | null = null

    try {
      data = await enhancedFetch<BingWallpaperResp>(
        'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1',
        // &mkt=zh-CN 加上区域后会导致后续访问 www.bing.com 被跳转到 cn.bing.com
        { timeout: 500 }
      )
      this.info.value = data.images[0]!
      this.updateUHDUrl(data.images[0]!.url)
      if (data.images[0]!.fullstartdate === settings.bingBackground.updateDate) {
        return
      }
    } catch (error) {
      ElNotification({
        title: i18next.t('newtab:notification.bingWallpaper.error.title'),
        message: i18next.t('newtab:notification.bingWallpaper.error.message'),
        type: 'error'
      })
      throw error
    }

    ElMessage.primary(i18next.t('newtab:notification.bingWallpaper.get'))
    const imgUrl = this.toWebp(`https://www.bing.com${data.images[0]!.url}`)

    try {
      const response = await fetch(imgUrl)
      if (!response.ok) {
        this.url.value = imgUrl
        // 兜底：网络请求失败，直接使用在线URL
        return
      }

      const blob = await response.blob()
      const file = new File([blob], 'bing.jpg', { type: blob.type })

      const id = crypto.randomUUID()
      const url = URL.createObjectURL(file)
      const url_old = settings.bingBackground.url

      // 清除上次壁纸，ObjectURL可能导致内存溢出
      await useBingWallpaperStore.clear()
      if (url_old.startsWith('blob:')) {
        URL.revokeObjectURL(url_old)
      }

      // 保存图片到IndexedDB
      await useBingWallpaperStore.setItem<Blob>(id, file)
      settings.bingBackground = {
        id: id,
        url: url,
        updateDate: data.images[0]!.fullstartdate
      }
      await saveSettings(settings)
      this.url.value = url
    } catch (error) {
      console.error('Failed to get Bing wallpaper:', error)
      ElNotification({
        title: i18next.t('newtab:notification.bingWallpaper.error.title'),
        message: i18next.t('newtab:notification.bingWallpaper.error.message'),
        type: 'error'
      })
      throw error
    }
  }

  public init() {
    const settings = useSettingsStore()

    this.resolveLocalBingWallpaperURL(settings.bingBackground.id, settings.bingBackground.url).then(
      (localUrl) => {
        if (localUrl) {
          this.url.value = localUrl
        }
      }
    )

    void this.refresh()
  }
}

export const bingWallpaperURLGetter = new BingWallpaperURLGetter()
