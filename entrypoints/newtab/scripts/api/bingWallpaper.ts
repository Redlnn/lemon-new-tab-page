import { v4 as uuidv4 } from 'uuid'

import { i18n } from '@/.wxt/i18n'
import axios from '@/newtab/scripts/plugins/axios'
import { useBingWallpaperStore } from '@/newtab/scripts/store/wallpaperStore'
import { isImageFile, verifyImageUrl } from '@/newtab/scripts/img'
import { saveSettings, useSettingsStore } from '@/newtab/scripts/store/settingsStore'

interface BingWallpaperResp {
  images: {
    startdate: string
    fullstartdate: string
    enddate: string
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
  }[]
  tooltips: {
    loading: string
    previous: string
    next: string
    walle: string
    walls: string
  }
}

export async function getBingWallpaperURL() {
  const settingsStore = useSettingsStore()
  if (settingsStore.bingBackground.updateDate === new Date().toDateString()) {
    const { id } = settingsStore.bingBackground
    const file = await useBingWallpaperStore.getItem<Blob>(id)

    // 校验图片数据是否可用，否则删除该数据
    if (file && isImageFile(file)) {
      const url = URL.createObjectURL(file)
      if (await verifyImageUrl(url)) {
        return url
      }
    }

    URL.revokeObjectURL(settingsStore.bingBackground.url)
    settingsStore.bingBackground.id = ''
    settingsStore.bingBackground.url = ''
    await saveSettings(settingsStore)
    await useBingWallpaperStore.removeItem(id)
  }

  ElMessage(i18n.t('newtab.notification.bingWallpaper.get'))
  try {
    const response = await axios.get(
      'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'
      // &mkt=zh-CN 加上区域后会导致后续访问 www.bing.com 被跳转到 cn.bing.com
    )

    if (response.status !== 200) {
      console.warn(response)
      throw new Error()
    }

    const data: BingWallpaperResp = response.data
    const resp = await axios.get(`https://www.bing.com${data.images[0].url}`, {
      responseType: 'arraybuffer'
    })

    if (resp.status !== 200) {
      return `https://www.bing.com${data.images[0].url}`
    }

    const blob = new Blob([resp.data], {
      type: resp.headers['content-type']
    })
    const file = new File([blob], 'bing.jpg', { type: blob.type })

    const id = uuidv4()
    const url = URL.createObjectURL(file)

    const url_old = settingsStore.bingBackground.url

    // 清除上次壁纸，ObjectURL可能导致内存溢出
    await useBingWallpaperStore.clear()
    if (url_old.startsWith('blob:')) {
      URL.revokeObjectURL(url_old)
    }

    // 保存图片到IndexedDB
    await useBingWallpaperStore.setItem<Blob>(id, file)
    settingsStore.bingBackground = {
      id: id,
      url: url,
      updateDate: new Date().toDateString()
    }
    return url
  } catch {
    ElNotification({
      title: i18n.t('newtab.notification.bingWallpaper.error.title'),
      message: i18n.t('newtab.notification.bingWallpaper.error.message'),
      type: 'error'
    })
    return ''
  }
}
