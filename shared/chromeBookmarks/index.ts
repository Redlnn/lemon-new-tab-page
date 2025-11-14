import { browser } from 'wxt/browser'

export interface ChromeBookmarkNode {
  id: string
  title: string
  url?: string
  children?: ChromeBookmarkNode[]
  dateAdded?: number
  dateGroupModified?: number
}

/**
 * 获取 Chrome 浏览器的所有书签树
 * @returns 书签树的根节点数组
 */
export async function getChromeBookmarks(): Promise<ChromeBookmarkNode[]> {
  try {
    const bookmarkTree = await browser.bookmarks.getTree()
    return bookmarkTree
  } catch (error) {
    console.error('Failed to get Chrome bookmarks:', error)
    return []
  }
}

/**
 * 获取书签栏和其他书签文件夹
 * @returns 格式化的书签树
 */
export async function getBookmarkFolders(): Promise<ChromeBookmarkNode[]> {
  try {
    const tree = await getChromeBookmarks()
    if (!tree || tree.length === 0) {
      return []
    }

    // Chrome 书签树结构:
    // Root (id: "0")
    //   ├── Bookmarks Bar (id: "1") - 书签栏
    //   ├── Other Bookmarks (id: "2") - 其他书签
    //   └── Mobile Bookmarks (id: "3") - 移动设备书签 (如果启用了同步)

    const root = tree[0]
    if (!root || !root.children) {
      return []
    }

    return root.children
  } catch (error) {
    console.error('Failed to get bookmark folders:', error)
    return []
  }
}

/**
 * 搜索书签（递归）
 * @param query 搜索关键词
 * @returns 匹配的书签列表
 */
export async function searchBookmarks(query: string): Promise<ChromeBookmarkNode[]> {
  try {
    const results = await browser.bookmarks.search(query)
    return results as ChromeBookmarkNode[]
  } catch (error) {
    console.error('Failed to search bookmarks:', error)
    return []
  }
}

/**
 * 判断节点是否为文件夹
 */
export function isFolder(node: ChromeBookmarkNode): boolean {
  return !node.url && !!node.children
}

/**
 * 获取节点的图标URL
 * @param node 书签节点
 * @returns favicon URL
 */
export function getNodeFavicon(node: ChromeBookmarkNode): string {
  if (!node.url) {
    return '' // 文件夹没有 favicon
  }

  // 使用 Chrome 的 favicon 服务
  try {
    const url = new URL(node.url)
    return `chrome://favicon/size/16@2x/${url.origin}`
  } catch {
    return ''
  }
}
