import type { Browser } from 'wxt/browser'

// 打开搜索引擎偏好弹窗
export const OPEN_SEARCH_ENGINE_PREFERENCE: InjectionKey<() => void> = Symbol(
  'openSearchEnginePreference'
)

// 打开背景偏好弹窗
export const OPEN_BACKGROUND_PREFERENCE: InjectionKey<() => void> = Symbol(
  'openBackgroundPreference'
)

// 打开书签编辑弹窗
export const OPEN_BOOKMARK_EDIT_DIALOG: InjectionKey<
  (node: Browser.bookmarks.BookmarkTreeNode) => void
> = Symbol('openBookmarkEditDialog')

// 书签激活状态映射：depth -> 激活节点 id 列表
export const BOOKMARK_ACTIVE_MAP: InjectionKey<Ref<Record<number, string[]>>> =
  Symbol('bookmarkActiveMap')

// 关闭已打开的书签菜单的函数
export const BOOKMARK_OPENED_MENU_CLOSE_FN: InjectionKey<Ref<(() => void) | null>> = Symbol(
  'bookmarkOpenedMenuCloseFn'
)

// 关闭已打开的快捷方式菜单的函数
export const SHORTCUT_OPENED_MENU_CLOSE_FN: InjectionKey<Ref<(() => void) | null>> = Symbol(
  'shortcutOpenedMenuCloseFn'
)

// 关闭已打开的自定义搜索引擎菜单的函数
export const CUSTOM_ENGINE_OPENED_MENU_CLOSE_FN: InjectionKey<Ref<(() => void) | null>> = Symbol(
  'customEngineOpenedMenuCloseFn'
)
