import axios from '@/entrypoints/newtab/js/plugins/axios'
import { useBingWallpaperStore } from '@/entrypoints/newtab/js/store/wallpaperStore'
import { v4 as uuidv4 } from 'uuid'
import { isImageFile, verifyImageUrl } from '@/entrypoints/newtab/js/img'
import { saveSettings, useSettingsStore } from '@/entrypoints/newtab/js/store/settingsStore'

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
    hs: any[]
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
    const id = settingsStore.bingBackground.bgId
    const file = await useBingWallpaperStore.getItem<Blob>(id)

    // 校验图片数据是否可用，否则删除该数据
    if (file && isImageFile(file)) {
      const url = URL.createObjectURL(file)
      if (await verifyImageUrl(url)) {
        return url
      }
    }

    URL.revokeObjectURL(settingsStore.bingBackground.bgUrl)
    settingsStore.bingBackground.bgId = ''
    settingsStore.bingBackground.bgUrl = ''
    await saveSettings(settingsStore)
    await useBingWallpaperStore.removeItem(id)
  }

  const response = await axios.get(
    'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN'
  )

  if (response.status !== 200) {
    return ''
  }

  const data: BingWallpaperResp = response.data
  const resp = await axios.get(`https://cn.bing.com${data.images[0].url}`, {
    responseType: 'arraybuffer'
  })

  if (resp.status !== 200) {
    return `https://cn.bing.com${data.images[0].url}`
  }

  const blob = new Blob([resp.data], {
    type: resp.headers['content-type']
  })
  const file = new File([blob], 'bing.jpg', { type: blob.type })

  const id = uuidv4()
  const url = URL.createObjectURL(file)

  const url_old = settingsStore.bingBackground.bgUrl

  // 清除上次壁纸，ObjectURL可能导致内存溢出
  await useBingWallpaperStore.clear()
  if (url_old && url_old.startsWith('blob:')) {
    URL.revokeObjectURL(url_old)
  }

  // 保存图片到IndexedDB
  await useBingWallpaperStore.setItem<Blob>(id, file)
  settingsStore.bingBackground = {
    bgId: id,
    bgUrl: url,
    updateDate: new Date().toDateString()
  }
  return url
}
