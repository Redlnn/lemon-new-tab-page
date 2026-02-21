import { defineStore } from 'pinia'

import i18next from 'i18next'
import { browser, type Browser } from 'wxt/browser'

import { SortMode } from '@/shared/enums'

import BookmarkWorker from './bookmark.worker?worker'

let worker: Worker | null = null

const bookmarkListeners: {
  created?: (id: string, bookmark: Browser.bookmarks.BookmarkTreeNode) => void
  removed?: (
    id: string,
    removeInfo: {
      parentId: string
      index: number
      node: Browser.bookmarks.BookmarkTreeNode
    }
  ) => void
  changed?: (
    id: string,
    changeInfo: {
      title: string
      url?: string | undefined
    }
  ) => void
  moved?: (
    id: string,
    moveInfo: {
      parentId: string
      index: number
      oldParentId: string
      oldIndex: number
    }
  ) => void
  importEnded?: () => void
} = {}

export const useBookmarkStore = defineStore('bookmark', {
  state: () => ({
    tree: [] as Browser.bookmarks.BookmarkTreeNode[],
    loaded: false,
    sortMode: SortMode.Original as SortMode,
    searchQuery: '',
    // 根据查询/排序计算后的树结果
    filteredResult: [] as Browser.bookmarks.BookmarkTreeNode[],
    // 首个匹配路径（按照排序/展示顺序），空数组表示无匹配
    firstMatchPath: [] as string[]
  }),

  actions: {
    initWorker() {
      if (worker) return
      worker = new BookmarkWorker()
      i18next.on('languageChanged', (lang) => {
        worker?.postMessage({
          type: 'UPDATE_SETTINGS',
          payload: {
            language: lang
          }
        })
        this.triggerFilter()
      })

      worker.onmessage = (e) => {
        const { type, filteredResult, firstMatchPath } = e.data
        if (type === 'INIT_DONE' || type === 'FILTER_DONE') {
          this.filteredResult = filteredResult
          this.firstMatchPath = firstMatchPath
          if (type === 'INIT_DONE') this.loaded = true
        }
      }

      // 添加书签变更监听，变更时重新加载书签并刷新 worker 缓存
      if (!bookmarkListeners.created) {
        bookmarkListeners.created = () => {
          this.loadBookmarks().catch(() => {})
        }
        browser.bookmarks.onCreated.addListener(bookmarkListeners.created)
      }

      if (!bookmarkListeners.removed) {
        bookmarkListeners.removed = () => {
          this.loadBookmarks().catch(() => {})
        }
        browser.bookmarks.onRemoved.addListener(bookmarkListeners.removed)
      }

      if (!bookmarkListeners.changed) {
        bookmarkListeners.changed = () => {
          this.loadBookmarks().catch(() => {})
        }
        browser.bookmarks.onChanged.addListener(bookmarkListeners.changed)
      }

      if (!bookmarkListeners.moved) {
        bookmarkListeners.moved = () => {
          this.loadBookmarks().catch(() => {})
        }
        browser.bookmarks.onMoved.addListener(bookmarkListeners.moved)
      }

      if (!bookmarkListeners.importEnded) {
        bookmarkListeners.importEnded = () => {
          this.loadBookmarks().catch(() => {})
        }
        // importEnded 在导入书签完成时触发（可选）
        try {
          browser.bookmarks.onImportEnded.addListener(bookmarkListeners.importEnded)
        } catch {
          // 某些浏览器/环境可能不支持该事件，忽略错误
        }
      }
    },

    async loadBookmarks() {
      this.initWorker()
      const tree = await browser.bookmarks.getTree()
      const _tree = tree[0]?.children ?? []
      this.tree = _tree

      worker?.postMessage({
        type: 'INIT',
        payload: {
          tree: _tree,
          language: i18next.language,
          sortMode: this.sortMode
        }
      })
    },

    _setSortMode(mode: SortMode) {
      if (this.sortMode === mode) return
      this.sortMode = mode
    },

    setSortMode(mode: SortMode) {
      if (this.sortMode === mode) return
      this.sortMode = mode
      this.triggerFilter()
    },

    updateFilteredResult() {
      this.triggerFilter()
    },

    triggerFilter() {
      worker?.postMessage({
        type: 'FILTER',
        payload: {
          query: this.searchQuery,
          sortMode: this.sortMode,
          language: i18next.language
        }
      })
    },

    terminateWorker() {
      // 移除书签事件监听
      if (bookmarkListeners.created) {
        try {
          browser.bookmarks.onCreated.removeListener(bookmarkListeners.created)
        } catch {}
        delete bookmarkListeners.created
      }
      if (bookmarkListeners.removed) {
        try {
          browser.bookmarks.onRemoved.removeListener(bookmarkListeners.removed)
        } catch {}
        delete bookmarkListeners.removed
      }
      if (bookmarkListeners.changed) {
        try {
          browser.bookmarks.onChanged.removeListener(bookmarkListeners.changed)
        } catch {}
        delete bookmarkListeners.changed
      }
      if (bookmarkListeners.moved) {
        try {
          browser.bookmarks.onMoved.removeListener(bookmarkListeners.moved)
        } catch {}
        delete bookmarkListeners.moved
      }
      if (bookmarkListeners.importEnded) {
        try {
          browser.bookmarks.onImportEnded.removeListener(bookmarkListeners.importEnded)
        } catch {}
        delete bookmarkListeners.importEnded
      }

      if (worker) {
        worker.terminate()
        worker = null
      }
    }
  },

  getters: {
    // 根据 `searchQuery` 过滤后的树。如果查询为空则返回完整的排序树。
    filteredTree(): Browser.bookmarks.BookmarkTreeNode[] {
      return this.filteredResult
    }
  }
})
