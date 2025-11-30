import { defineStore } from 'pinia'

import i18next from 'i18next'
import { browser, type Browser } from 'wxt/browser'

import { SortMode } from './types'

let worker: Worker | null = null

export { SortMode }

export const useBookmarkStore = defineStore('bookmark', {
  state: () => ({
    tree: [] as Browser.bookmarks.BookmarkTreeNode[],
    loaded: false,
    sortMode: SortMode.NameAsc,
    searchQuery: '',
    // 根据查询/排序计算后的树结果
    filteredResult: [] as Browser.bookmarks.BookmarkTreeNode[],
    // 首个匹配路径（按照排序/展示顺序），空数组表示无匹配
    firstMatchPath: [] as string[]
  }),

  actions: {
    initWorker() {
      if (worker) return
      worker = new Worker(new URL('./bookmark.worker.ts', import.meta.url), { type: 'module' })
      worker.onmessage = (e) => {
        const { type, filteredResult, firstMatchPath } = e.data
        if (type === 'INIT_DONE' || type === 'FILTER_DONE') {
          this.filteredResult = filteredResult
          this.firstMatchPath = firstMatchPath
          if (type === 'INIT_DONE') this.loaded = true
        }
      }
    },

    async loadBookmarks(): Promise<Browser.bookmarks.BookmarkTreeNode[]> {
      this.initWorker()
      const tree = await browser.bookmarks.getTree()
      const _tree = tree[0]?.children || []
      this.tree = _tree

      worker?.postMessage({
        type: 'INIT',
        payload: {
          tree: _tree,
          language: i18next.language,
          sortMode: this.sortMode
        }
      })
      return tree
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
