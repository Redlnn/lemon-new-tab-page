import i18next from 'i18next'

import { isImageFile, verifyImageUrl } from '@/shared/media'
import enhancedFetch from '@/shared/network/fetch'
import { saveSettings, useBingWallpaperStore, useSettingsStore } from '@/shared/settings'

import { bingInfoCache } from '../storages/bingInfoCache'

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
  public info: Ref<BingWallpaperImage> = ref({
    startdate: 0,
    fullstartdate: 0,
    enddate: 0,
    url: '',
    urlbase: '',
    copyright: '',
    copyrightlink: '',
    title: '',
    quiz: '',
    wp: false,
    hsh: '',
    drk: 0,
    top: 0,
    bot: 0,
    hs: []
  })
  public uhdUrl: Ref<string> = ref('')

  public getBgUrl() {
    return this.url
  }

  public getInfo() {
    return this.info
  }

  private setUrlSafe(newUrl: string | null) {
    // 在替换 this.url.value 前撤销旧的 blob URL
    const old = this.url.value
    try {
      if (old && old.startsWith('blob:') && old !== (newUrl ?? '')) {
        URL.revokeObjectURL(old)
      }
    } catch {}
    this.url.value = newUrl ?? ''
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

  public async init() {
    const settings = useSettingsStore()

    // 兼容旧版逻辑：如果 updateDate 存在，迁移到 startdate
    if (typeof settings.bingBackground.updateDate === 'string') {
      // 将旧版的 new Date().toDateString() 格式转换为 ISO 格式
      const parsedDate = new Date(settings.bingBackground.updateDate)
      if (!isNaN(parsedDate.getTime())) {
        settings.bingBackground.updateDate = formatUTCCompact(parsedDate)
        // await saveSettings(settings)
      }
    }

    const localUrl = await this.resolveLocalBingWallpaperURL()

    if (localUrl) {
      this.setUrlSafe(localUrl)
    }

    await this.refresh()
  }

  private async resolveLocalBingWallpaperURL() {
    const settings = useSettingsStore()
    const { id, url } = settings.bingBackground

    // 如果 settings 中已有有效的 blob url，优先复用
    try {
      if (url && url.startsWith('blob:')) {
        if (await verifyImageUrl(url)) {
          return url
        }
        // 如果现有 settings blob URL 无效，撤销并继续
        await this.revokeSettingsURL()
      }
    } catch {}

    const file = await useBingWallpaperStore.getItem<Blob>(settings.bingBackground.id)
    if (file && isImageFile(file)) {
      const objectUrl = URL.createObjectURL(file)
      const ok = await verifyImageUrl(objectUrl)
      if (ok) {
        settings.bingBackground.url = objectUrl
        const cache = await bingInfoCache.getValue()
        this.info.value.url = cache.url
        this.info.value.copyright = cache.copyright
        this.info.value.copyrightlink = cache.copyrightlink
        this.info.value.title = cache.title
        this.updateUHDUrl(cache.url)
        return objectUrl
      } else {
        // 验证失败时立即撤销临时 objectUrl
        try {
          URL.revokeObjectURL(objectUrl)
        } catch {}
      }
    }

    // 如果文件不存在或不是图片，则清除相关数据和缓存
    settings.bingBackground.id = ''
    settings.bingBackground.updateDate = 0
    await bingInfoCache.setValue({
      url: '',
      copyright: '',
      copyrightlink: '',
      title: ''
    })
    await useBingWallpaperStore.removeItem(id)
    await this.revokeSettingsURL()
    return null
  }

  private async revokeSettingsURL() {
    const settings = useSettingsStore()

    try {
      if (settings.bingBackground.url && settings.bingBackground.url.startsWith('blob:')) {
        URL.revokeObjectURL(settings.bingBackground.url)
      }
    } catch {}
    settings.bingBackground.url = ''
  }

  public async refresh() {
    const settings = useSettingsStore()

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
        // 最新更新日期等于上次更新日期
        return
      }
      // 不等于则重新获取（跳出try）并更新info
      await bingInfoCache.setValue({
        url: data.images[0]!.url,
        copyright: data.images[0]!.copyright,
        copyrightlink: data.images[0]!.copyrightlink,
        title: data.images[0]!.title
      })
    } catch (error) {
      console.error(error)
      const cache = await bingInfoCache.getValue()
      if (cache.url.length === 0) {
        // 如果没有缓存
        this.info.value.copyright = i18next.t('newtab:notification.bingWallpaper.error.message')
        this.info.value.title = i18next.t('newtab:notification.bingWallpaper.error.title')
      }
      return
    }

    const imgUrl = this.toWebp(`https://www.bing.com${data.images[0]!.url}`)

    ElMessage.primary(i18next.t('newtab:notification.bingWallpaper.get'))
    try {
      const response = await fetch(imgUrl)
      if (!response.ok) {
        // 兜底：网络请求失败，直接使用在线URL
        this.setUrlSafe(imgUrl)
        return
      }

      const blob = await response.blob()
      const file = new File([blob], 'bing.jpg', { type: blob.type })

      // 清除上次壁纸
      await useBingWallpaperStore.clear()
      await this.revokeSettingsURL()

      // 保存图片到IndexedDB
      const id = crypto.randomUUID()
      const url = URL.createObjectURL(file)
      await useBingWallpaperStore.setItem<Blob>(id, file)
      settings.bingBackground = {
        id: id,
        url: url,
        updateDate: data.images[0]!.fullstartdate
      }
      await saveSettings(settings)
      this.setUrlSafe(url)
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
}

export const bingWallpaperURLGetter = new BingWallpaperURLGetter()
