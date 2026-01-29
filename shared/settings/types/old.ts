import type { OldBgType } from '@/shared/enums'

export interface OldSettingsInterface {
  primaryColor: string
  isMeridiem: boolean
  showMeridiem: boolean
  selectedSearchSuggestionAPI: keyof typeof import('@newtab/shared/search').searchSuggestAPIs
  selectedSearchEngine: keyof typeof import('../migrate/map').searchEnginesMap
  searchInNewTab: boolean
  recordSearchHistory: boolean
  bgType: OldBgType
  bgDarkCorners: boolean
  bgBlur: number
  bgId: string
  bgUrl: string
  bgMaskPpacity: number
  enabled: boolean
  enableTopSites: boolean
  quickStartRows: number
  quickStartColumns: number
  quickStartItemWidth: number
  showQuickStartTitle: boolean
  showPinnedIcon: boolean
  enableYiyan: boolean
  bingWallpaper: {
    bgId: string
    url: string
    updateDate: string
  }
  version: string
}
