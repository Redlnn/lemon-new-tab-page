/**
 * 优化方向：
 * 1. 将过滤/排序移到 Web Worker
 * 2. 虚拟列表(el-collapse能做吗？)
 */
import { defineStore } from 'pinia'

import i18next from 'i18next'
import type { Browser } from 'wxt/browser'

// 根据排序模式与原始索引表创建一个比较函数。将比较器提取到模块级可避免在每次比较时重复创建闭包。
function createComparator(mode: SortMode, origIndexMap: Map<string, number>) {
  return (a: chrome.bookmarks.BookmarkTreeNode, b: chrome.bookmarks.BookmarkTreeNode) => {
    const aIsFolder = Array.isArray(a.children)
    const bIsFolder = Array.isArray(b.children)

    if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1

    const bothFolders = aIsFolder && bIsFolder
    const bothLinks = !aIsFolder && !bIsFolder

    const titleA = a.title || ''
    const titleB = b.title || ''

    // 按本地化名称排序
    const compareName = () => titleA.localeCompare(titleB, i18next.language)

    // 按创建时间排序
    const compareCreated = () =>
      mode === SortMode.CreatedAsc
        ? (a.dateAdded ?? 0) - (b.dateAdded ?? 0)
        : (b.dateAdded ?? 0) - (a.dateAdded ?? 0)

    // 按修改时间排序（仅文件夹）
    const modA = a.dateGroupModified ?? 0
    const modB = b.dateGroupModified ?? 0
    const compareModified = () => (mode === SortMode.ModifiedAsc ? modA - modB : modB - modA)

    switch (mode) {
      case SortMode.NameAsc:
        return compareName()
      case SortMode.NameDesc:
        return -compareName()
      case SortMode.Original:
        return (origIndexMap.get(a.id) ?? 0) - (origIndexMap.get(b.id) ?? 0)
      case SortMode.CreatedAsc:
      case SortMode.CreatedDesc:
        return compareCreated()
      case SortMode.ModifiedAsc:
      case SortMode.ModifiedDesc:
        if (bothFolders) return compareModified()
        else if (bothLinks) return 0
    }
    return 0
  }
}

/**
 * 复制并按层排序书签树节点。
 * @param nodes 当前层节点
 * @param depth 当前深度（根为0）
 * @param mode 排序模式
 * @returns 排序后的节点树
 */
function cloneAndSortTree(
  nodes: chrome.bookmarks.BookmarkTreeNode[] | undefined,
  depth: number,
  mode: SortMode
): chrome.bookmarks.BookmarkTreeNode[] {
  if (!nodes || nodes.length === 0) return []

  const origIndexMap = new Map<string, number>()
  nodes.forEach((n, idx) => origIndexMap.set(n.id, idx))

  const copied = nodes.map((n) => {
    const c = { ...n }
    if (Array.isArray(n.children)) {
      c.children = cloneAndSortTree(n.children, depth + 1, mode)
    }
    return c as chrome.bookmarks.BookmarkTreeNode
  })

  // 仅对子层进行排序（保留根的原始顺序以便稳定性）
  if (depth > 0) {
    const comparator = createComparator(mode, origIndexMap)
    copied.sort(comparator)
  }

  return copied
}

// rebuild 会根据 matchedIds/keepIds 重建分支，
// 在首次发现匹配路径时调用 onFirstPath 回调传回路径。
function createRebuild(
  matchedIds: Set<string>,
  keepIds: Set<string>,
  onFirstPath: (p: string[]) => void
) {
  return function rebuild(
    node: chrome.bookmarks.BookmarkTreeNode,
    parents: string[] = []
  ): chrome.bookmarks.BookmarkTreeNode | null {
    if (!keepIds.has(node.id)) return null

    const isFolder = Array.isArray(node.children)

    if (matchedIds.has(node.id) && !isFolder) {
      onFirstPath(parents.slice())
    }

    const copy = { ...node }
    if (isFolder && node.children && node.children.length) {
      const children: chrome.bookmarks.BookmarkTreeNode[] = []
      for (const ch of node.children) {
        const c = rebuild(ch, [...parents, node.id])
        if (c) children.push(c)
      }
      if (children.length) copy.children = children
      else delete copy.children

      if (matchedIds.has(node.id) && (!copy.children || copy.children.length === 0)) {
        onFirstPath([...parents, node.id])
      }
    } else {
      if (matchedIds.has(node.id) && isFolder && (!node.children || node.children.length === 0)) {
        onFirstPath([...parents, node.id])
      }
    }

    return copy as chrome.bookmarks.BookmarkTreeNode
  }
}

// 当节点数超过阈值时启用完整树缓存以节省重复计算的开销
const CACHE_NODE_COUNT_THRESHOLD = 2000

function countNodes(nodes: chrome.bookmarks.BookmarkTreeNode[] | undefined): number {
  if (!nodes || nodes.length === 0) return 0
  let cnt = 0
  const stack: chrome.bookmarks.BookmarkTreeNode[] = [...nodes]
  while (stack.length) {
    const n = stack.pop()!
    cnt += 1
    if (Array.isArray(n.children) && n.children.length) stack.push(...n.children)
  }
  return cnt
}

export enum SortMode {
  Original = 'original',
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
    sortMode: SortMode.NameAsc,
    searchQuery: '',
    // 扁平索引：id -> { node, parents, titleLower, urlLower }
    indexMap: {} as Record<
      string,
      {
        node: chrome.bookmarks.BookmarkTreeNode
        parents: string[]
        titleLower: string
        urlLower: string
        isFolder: boolean
      }
    >,
    // 缓存最近一次查询的结果 id 列表（用于前缀查询优化）
    lastQuery: '',
    lastResultIds: [] as string[],
    // 首个匹配路径（按照排序/展示顺序），空数组表示无匹配
    firstMatchPath: [] as string[],
    // 根据查询/排序计算后的树结果（避免在 getter 中写状态）
    filteredResult: [] as chrome.bookmarks.BookmarkTreeNode[],
    //缓存排序树及其 sortMode 以避免重新计算
    cachedSortedTree: null as null | chrome.bookmarks.BookmarkTreeNode[],
    cachedSortedTreeKey: null as null | SortMode
  }),

  actions: {
    loadBookmarks(): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
      return new Promise((resolve) => {
        chrome.bookmarks.getTree((tree) => {
          const _tree = tree[0]?.children
          this.tree = _tree || []
          this.loaded = true
          // 构建扁平索引，供后续搜索使用
          this.buildIndex()
          // 初始化排序缓存（若较大）并过滤结果
          this.buildAndCacheSortedTree()
          this.updateFilteredResult()
          resolve(tree)
        })
      })
    },

    buildIndex() {
      const map: Record<
        string,
        {
          node: Browser.bookmarks.BookmarkTreeNode
          parents: string[]
          titleLower: string
          urlLower: string
          isFolder: boolean
        }
      > = {}

      const walk = (nodes: chrome.bookmarks.BookmarkTreeNode[] = [], parents: string[] = []) => {
        for (const node of nodes) {
          const isFolder = Array.isArray(node.children)
          map[node.id] = {
            node,
            parents: [...parents],
            titleLower: (node.title || '').toLowerCase(),
            urlLower: node.url ? (node.url || '').toLowerCase() : '',
            isFolder
          }

          if (isFolder) {
            walk(node.children!, [...parents, node.id])
          }
        }
      }

      walk(this.tree || [])
      this.indexMap = map
      // 重置缓存
      this.lastQuery = ''
      this.lastResultIds = []
      // 使已排序缓存无效（会在需要时由 buildAndCacheSortedTree 重新建立）
      this.cachedSortedTree = null
      this.cachedSortedTreeKey = null
    },

    setSortMode(mode: SortMode) {
      if (this.sortMode === mode) return
      this.sortMode = mode
      // 使排序后的缓存无效，并在新顺序下重新计算筛选结果
      this.cachedSortedTree = null
      this.cachedSortedTreeKey = null
      // 对于大树，先重建缓存以便后续读取更快；对于小树，buildAndCacheSortedTree 会选择不缓存
      this.buildAndCacheSortedTree()
      this.updateFilteredResult()
    },

    // 只读获取排序树（不会在 getter 中写状态）。优先返回已缓存版本（如果存在并匹配 sortMode），
    // 否则按需计算并返回，但不写入 cache（缓存由专用 action 管理）。
    getSortedTree(): chrome.bookmarks.BookmarkTreeNode[] {
      if (this.cachedSortedTree && this.cachedSortedTreeKey === this.sortMode) {
        return this.cachedSortedTree
      }
      return cloneAndSortTree(this.tree, 0, this.sortMode)
    },

    // 根据阈值决定是否构建并写入排序树缓存（供后续快速读取）。这是一个有副作用的 action，
    // 仅在明确需要缓存时调用（如加载书签或切换排序时）。
    buildAndCacheSortedTree() {
      const idxCount = Object.keys(this.indexMap || {}).length
      const nodeCount = idxCount || countNodes(this.tree)
      if (nodeCount < CACHE_NODE_COUNT_THRESHOLD) {
        // 对于小树不缓存，直接返回
        this.cachedSortedTree = null
        this.cachedSortedTreeKey = null
        return
      }

      const tree = cloneAndSortTree(this.tree, 0, this.sortMode)
      this.cachedSortedTree = tree
      this.cachedSortedTreeKey = this.sortMode
    },

    updateFilteredResult() {
      const q = (this.searchQuery || '').trim().toLowerCase()
      const source = this.getSortedTree() || []

      if (!q) {
        this.filteredResult = source
        // 使搜索缓存和首匹配路径失效，以便在新的排序下重新计算 getter
        this.lastQuery = ''
        this.lastResultIds = []
        this.firstMatchPath = []
        return
      }

      // 1) 确定候选 id 集（若为前缀查询则使用上次缓存减少扫描）
      const allIds = Object.keys(this.indexMap || {})
      let candidateIds: string[] = allIds
      if (this.lastQuery && q.startsWith(this.lastQuery) && this.lastResultIds?.length) {
        candidateIds = this.lastResultIds
      }

      // 2) 在候选中找出直接匹配的节点 id
      const matchedIds = new Set<string>()
      for (const id of candidateIds) {
        const entry = this.indexMap[id]
        if (!entry) continue
        if (entry.titleLower.includes(q) || (entry.urlLower && entry.urlLower.includes(q))) {
          matchedIds.add(id)
        }
      }

      if (matchedIds.size === 0) {
        this.lastQuery = q
        this.lastResultIds = []
        this.firstMatchPath = []
        this.filteredResult = []
        return
      }

      // 3) 扩展结果集以包含匹配节点的所有祖先（以便能在树结构中展示匹配路径）
      const keepIds = new Set<string>()
      for (const id of matchedIds) {
        keepIds.add(id)
        const parents = this.indexMap[id]?.parents || []
        for (const p of parents) keepIds.add(p)
      }

      // 4) 基于 keepIds 从排序树中重建仅保留需要的分支（只遍历保留分支）
      //    同时在一次遍历中确定首个匹配路径以避免重复遍历。
      let firstPath: string[] | null = null
      const onFirstPath = (p: string[]) => {
        if (!firstPath) firstPath = p
      }

      const rebuild = createRebuild(matchedIds, keepIds, onFirstPath)

      const result = source
        .map((n) => rebuild(n, []))
        .filter((n): n is chrome.bookmarks.BookmarkTreeNode => n !== null)

      // 5) 更新缓存（用于前缀查询加速）以及首个匹配路径
      this.lastQuery = q
      this.lastResultIds = Array.from(keepIds)
      this.firstMatchPath = firstPath || []
      this.filteredResult = result
    }
  },

  getters: {
    // 根据 `searchQuery` 过滤后的树。如果查询为空则返回完整的排序树。
    filteredTree(): chrome.bookmarks.BookmarkTreeNode[] {
      const q = (this.searchQuery || '').trim().toLowerCase()
      if (!q) return (this as ReturnType<typeof useBookmarkStore>).getSortedTree()
      return this.filteredResult || []
    }
  }
})
