import type { Browser } from 'wxt/browser'

// 打开搜索引擎偏好弹窗（SearchEnginesSwitcher）
export const OPEN_SEARCH_ENGINE_PREFERENCE: InjectionKey<() => void> = Symbol(
  'openSearchEnginePreference'
)

// 打开背景偏好弹窗（BackgroundPreference）
export const OPEN_BACKGROUND_PREFERENCE: InjectionKey<() => void> = Symbol(
  'openBackgroundPreference'
)

// 打开书签编辑弹窗（BookmarkEditDialog）
export const OPEN_BOOKMARK_EDIT_DIALOG: InjectionKey<
  (node: Browser.bookmarks.BookmarkTreeNode) => void
> = Symbol('openBookmarkEditDialog')
