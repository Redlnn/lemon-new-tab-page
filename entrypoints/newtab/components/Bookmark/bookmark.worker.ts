import type { Browser } from 'wxt/browser'

import { SortMode } from './types'

type BookmarkTreeNode = Browser.bookmarks.BookmarkTreeNode

let tree: BookmarkTreeNode[] = []
// 扁平索引：id -> { node, parents, titleLower, urlLower }
let indexMap: Record<
  string,
  {
    node: BookmarkTreeNode
    parents: string[]
    titleLower: string
    urlLower: string
    isFolder: boolean
  }
> = {}

//缓存排序树及其 sortMode 以避免重新计算
let cachedSortedTree: BookmarkTreeNode[] | null = null
let cachedSortedTreeKey: SortMode | null = null
let currentLanguage = 'zh-CN'

// 缓存最近一次查询的结果 id 列表（用于前缀查询优化）
let lastQuery = ''
let lastResultIds: string[] = []

// --------------------------------------------------------------------------
// 辅助函数
// --------------------------------------------------------------------------

function createComparator(mode: SortMode, origIndexMap: Map<string, number>, language: string) {
  return (a: BookmarkTreeNode, b: BookmarkTreeNode) => {
    const aIsFolder = Array.isArray(a.children)
    const bIsFolder = Array.isArray(b.children)

    if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1

    const bothFolders = aIsFolder && bIsFolder
    const bothLinks = !aIsFolder && !bIsFolder

    const titleA = a.title || ''
    const titleB = b.title || ''

    // 按本地化名称排序
    const compareName = () => titleA.localeCompare(titleB, language)

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
  nodes: BookmarkTreeNode[] | undefined,
  depth: number,
  mode: SortMode,
  language: string
): BookmarkTreeNode[] {
  if (!nodes || nodes.length === 0) return []

  const origIndexMap = new Map<string, number>()
  nodes.forEach((n, idx) => origIndexMap.set(n.id, idx))

  const copied = nodes.map((n) => {
    const c = { ...n }
    if (Array.isArray(n.children)) {
      c.children = cloneAndSortTree(n.children, depth + 1, mode, language)
    }
    return c as BookmarkTreeNode
  })

  // 仅对子层进行排序（保留根的原始顺序以便稳定性）
  if (depth > 0) {
    const comparator = createComparator(mode, origIndexMap, language)
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
  return function rebuild(node: BookmarkTreeNode, parents: string[] = []): BookmarkTreeNode | null {
    if (!keepIds.has(node.id)) return null

    const isFolder = Array.isArray(node.children)

    if (matchedIds.has(node.id) && !isFolder) {
      onFirstPath(parents.slice())
    }

    const copy = { ...node }
    if (isFolder && node.children && node.children.length) {
      const children: BookmarkTreeNode[] = []
      for (const ch of node.children) {
        const c = rebuild(ch, [...parents, node.id])
        if (c) children.push(c)
      }
      if (children.length) copy.children = children
      else delete copy.children

      if (matchedIds.has(node.id) && (!copy.children || copy.children.length === 0)) {
        onFirstPath([...parents, node.id])
      }
    } else if (
      matchedIds.has(node.id) &&
      isFolder &&
      (!node.children || node.children.length === 0)
    ) {
      onFirstPath([...parents, node.id])
    }

    return copy as BookmarkTreeNode
  }
}

// 当节点数超过阈值时启用完整树缓存以节省重复计算的开销
const CACHE_NODE_COUNT_THRESHOLD = 2000

function countNodes(nodes: BookmarkTreeNode[] | undefined): number {
  if (!nodes || nodes.length === 0) return 0
  let cnt = 0
  const stack: BookmarkTreeNode[] = [...nodes]
  while (stack.length) {
    const n = stack.pop()!
    cnt += 1
    if (Array.isArray(n.children) && n.children.length) stack.push(...n.children)
  }
  return cnt
}

// --------------------------------------------------------------------------
// 主逻辑
// --------------------------------------------------------------------------

function buildIndex() {
  const map: typeof indexMap = {}

  const walk = (nodes: BookmarkTreeNode[] = [], parents: string[] = []) => {
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

  walk(tree || [])
  indexMap = map

  // 重置缓存
  lastQuery = ''
  lastResultIds = []
  // 使已排序缓存无效
  cachedSortedTree = null
  cachedSortedTreeKey = null
}

// 只读获取排序树。优先返回已缓存版本（如果存在并匹配 sortMode），
function getSortedTree(mode: SortMode): BookmarkTreeNode[] {
  // 检查缓存
  if (cachedSortedTree && cachedSortedTreeKey === mode) {
    return cachedSortedTree
  }

  // 检查缓存阈值
  const idxCount = Object.keys(indexMap || {}).length
  const nodeCount = idxCount || countNodes(tree)

  const sorted = cloneAndSortTree(tree, 0, mode, currentLanguage)

  if (nodeCount >= CACHE_NODE_COUNT_THRESHOLD) {
    cachedSortedTree = sorted
    cachedSortedTreeKey = mode
  } else {
    cachedSortedTree = null
    cachedSortedTreeKey = null
  }

  return sorted
}

function filter(query: string, mode: SortMode) {
  const q = (query || '').trim().toLowerCase()
  const source = getSortedTree(mode) || []

  if (!q) {
    return {
      filteredResult: source,
      firstMatchPath: []
    }
  }

  // 1) 确定候选 id 集（若为前缀查询则使用上次缓存减少扫描）
  const allIds = Object.keys(indexMap || {})
  let candidateIds: string[] = allIds
  if (lastQuery && q.startsWith(lastQuery) && lastResultIds?.length) {
    candidateIds = lastResultIds
  }

  // 2) 在候选中找出直接匹配的节点 id
  const matchedIds = new Set<string>()
  for (const id of candidateIds) {
    const entry = indexMap[id]
    if (!entry) continue
    if (entry.titleLower.includes(q) || (entry.urlLower && entry.urlLower.includes(q))) {
      matchedIds.add(id)
    }
  }

  if (matchedIds.size === 0) {
    lastQuery = q
    lastResultIds = []
    return {
      filteredResult: [],
      firstMatchPath: []
    }
  }

  // 3) 扩展结果集以包含匹配节点的所有祖先（以便能在树结构中展示匹配路径）
  const keepIds = new Set<string>()
  for (const id of matchedIds) {
    keepIds.add(id)
    const parents = indexMap[id]?.parents || []
    for (const p of parents) keepIds.add(p)
  }

  // 4) 基于 keepIds 从排序树中重建仅保留需要的分支（只遍历保留分支）
  //    同时在一次遍历中确定首个匹配路径以避免重复遍历。
  let firstPath: string[] | null = null
  const onFirstPath = (p: string[]) => {
    if (!firstPath) firstPath = p
  }

  const rebuild = createRebuild(matchedIds, keepIds, onFirstPath)

  const result = source.map((n) => rebuild(n, [])).filter((n): n is BookmarkTreeNode => n !== null)

  // 5) 更新缓存（用于前缀查询加速）以及首个匹配路径
  lastQuery = q
  lastResultIds = Array.from(keepIds)

  return {
    filteredResult: result,
    firstMatchPath: firstPath || []
  }
}

// --------------------------------------------------------------------------
// 消息处理
// --------------------------------------------------------------------------

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data

  try {
    switch (type) {
      case 'INIT':
        tree = payload.tree
        if (payload.language) currentLanguage = payload.language
        // 构建扁平索引，供后续搜索使用
        buildIndex()
        // 初始过滤（空查询）
        const initRes = filter('', payload.sortMode || SortMode.NameAsc)
        self.postMessage({ type: 'INIT_DONE', ...initRes })
        break

      case 'UPDATE_SETTINGS':
        if (payload.language) currentLanguage = payload.language
        // 语言改变使缓存失效
        // 目前，如果语言影响排序，清空缓存是最安全的做法
        cachedSortedTree = null
        cachedSortedTreeKey = null
        break

      case 'FILTER':
        const { query, sortMode } = payload
        const res = filter(query, sortMode)
        self.postMessage({ type: 'FILTER_DONE', ...res })
        break
    }
  } catch (err) {
    console.error('Worker error:', err)
    self.postMessage({ type: 'ERROR', error: String(err) })
  }
}
