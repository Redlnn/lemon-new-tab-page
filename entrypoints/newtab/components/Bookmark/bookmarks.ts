import { defineStore } from 'pinia'

export enum SortMode {
  NameAsc = 'name-asc',
  NameDesc = 'name-desc',
  CreatedAsc = 'created-asc',
  CreatedDesc = 'created-desc',
  ModifiedAsc = 'modified-asc',
  ModifiedDesc = 'modified-desc'
}

export const useBookmarkStore = defineStore('bookmark', {
  state: () => ({
    tree: [] as chrome.bookmarks.BookmarkTreeNode[],
    loaded: false,
    sortMode: SortMode.NameAsc
  }),

  actions: {
    loadBookmarks(): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
      return new Promise((resolve) => {
        chrome.bookmarks.getTree((tree) => {
          const _tree = tree[0]?.children
          this.tree = _tree || []
          this.loaded = true
          resolve(tree)
        })
      })
    },

    setSortMode(mode: SortMode) {
      this.sortMode = mode
    }
  },

  getters: {
    sortedTree(state): chrome.bookmarks.BookmarkTreeNode[] {
      const clone: chrome.bookmarks.BookmarkTreeNode[] = JSON.parse(JSON.stringify(state.tree))

      const sortNodes = (list: chrome.bookmarks.BookmarkTreeNode[], depth: number) => {
        if (depth > 0) {
          list.sort((a, b) => {
            const mode = state.sortMode

            const aIsFolder = Array.isArray(a.children)
            const bIsFolder = Array.isArray(b.children)

            // ------------------------------------------------
            // 1. 始终保持文件夹在前
            // ------------------------------------------------
            if (aIsFolder !== bIsFolder) {
              return aIsFolder ? -1 : 1
            }

            const bothFolders = aIsFolder && bIsFolder
            const bothLinks = !aIsFolder && !bIsFolder

            // helper: 名称排序（本地化）
            const compareName = () =>
              (a.title || '').localeCompare(b.title || '', navigator.language)

            // helper: 创建时间
            const compareCreated = () =>
              mode === SortMode.CreatedAsc
                ? (a.dateAdded ?? 0) - (b.dateAdded ?? 0)
                : (b.dateAdded ?? 0) - (a.dateAdded ?? 0)

            // helper: 修改时间（仅文件夹）
            const modA = a.dateGroupModified ?? 0
            const modB = b.dateGroupModified ?? 0
            const compareModified = () =>
              mode === SortMode.ModifiedAsc ? modA - modB : modB - modA

            // ------------------------------------------------
            // 2. 根据模式进行排序
            // ------------------------------------------------
            switch (mode) {
              case SortMode.NameAsc:
                return compareName()
              case SortMode.NameDesc:
                return -compareName()

              case SortMode.CreatedAsc:
              case SortMode.CreatedDesc:
                return compareCreated()

              case SortMode.ModifiedAsc:
              case SortMode.ModifiedDesc:
                if (bothFolders) {
                  return compareModified()
                } else if (bothLinks) {
                  // 链接不排序，保持原顺序
                  return 0
                }
            }

            return 0
          })
        }

        // 递归排序子节点
        list.forEach((node) => {
          if (Array.isArray(node.children)) {
            sortNodes(node.children, depth + 1)
          }
        })
      }

      sortNodes(clone, 0)
      return clone
    }
  }
})
