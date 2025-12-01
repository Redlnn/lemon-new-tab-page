/**
 * LRU (Least Recently Used) 缓存实现
 * 用于缓存搜索建议结果，减少网络请求
 */

interface CacheNode {
  key: string
  value: string[]
  prev: CacheNode | null
  next: CacheNode | null
}

export class LRUCache {
  private capacity: number
  private cache: Map<string, CacheNode>
  private head: CacheNode
  private tail: CacheNode

  constructor(capacity: number = 50) {
    this.capacity = capacity
    this.cache = new Map()

    // 创建虚拟头尾节点
    this.head = { key: '', value: [], prev: null, next: null }
    this.tail = { key: '', value: [], prev: null, next: null }
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  /**
   * 获取缓存的搜索建议
   */
  get(key: string): string[] | null {
    const node = this.cache.get(key)
    if (!node) {
      return null
    }

    // 将访问的节点移到最前面（最近使用）
    this.moveToHead(node)
    return node.value
  }

  /**
   * 设置搜索建议缓存
   */
  set(key: string, value: string[]): void {
    const existingNode = this.cache.get(key)

    if (existingNode) {
      // 如果已存在，更新值并移到前面
      existingNode.value = value
      this.moveToHead(existingNode)
    } else {
      // 创建新节点
      const newNode: CacheNode = {
        key,
        value,
        prev: null,
        next: null
      }

      this.cache.set(key, newNode)
      this.addToHead(newNode)

      // 如果超过容量，删除最久未使用的
      if (this.cache.size > this.capacity) {
        const removed = this.removeTail()
        if (removed) {
          this.cache.delete(removed.key)
        }
      }
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 将节点添加到头部
   */
  private addToHead(node: CacheNode): void {
    node.prev = this.head
    node.next = this.head.next
    if (this.head.next) {
      this.head.next.prev = node
    }
    this.head.next = node
  }

  /**
   * 移除节点
   */
  private removeNode(node: CacheNode): void {
    if (node.prev) {
      node.prev.next = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    }
  }

  /**
   * 将节点移到头部
   */
  private moveToHead(node: CacheNode): void {
    this.removeNode(node)
    this.addToHead(node)
  }

  /**
   * 移除尾部节点
   */
  private removeTail(): CacheNode | null {
    const node = this.tail.prev
    if (node && node !== this.head) {
      this.removeNode(node)
      return node
    }
    return null
  }
}

// 创建全局搜索建议缓存实例
export const searchSuggestCache = new LRUCache(50)
