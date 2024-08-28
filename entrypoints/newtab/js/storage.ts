class LocalExtensionStorage {
  static async setItem<T>(k: string, value: T) {
    const _: { [key: string]: T } = {}
    _[k] = value
    await chrome.storage.local.set(_)
  }
  static async getItem<T>(key: string): Promise<T | undefined>
  static async getItem<T>(key: string, _default: T): Promise<T>
  static async getItem<T>(key: string, _default?: T) {
    const result = await chrome.storage.local.get(key)
    if (result === undefined) {
      return _default
    }
    return result[key] || _default
  }
  static async removeItem(key: string) {
    await chrome.storage.local.remove(key)
  }
  static async clear() {
    await chrome.storage.local.clear()
  }
}

class SyncExtensionStorage {
  static async setItem<T>(k: string, value: T) {
    const _: { [key: string]: T } = {}
    _[k] = value
    await chrome.storage.local.set(_)
  }
  static async getItem<T>(key: string): Promise<T | undefined>
  static async getItem<T>(key: string, _default: T): Promise<T>
  static async getItem<T>(key: string, _default?: T) {
    const result = await chrome.storage.sync.get(key)
    return result[key] || _default
  }
  static async removeItem(key: string) {
    await chrome.storage.sync.remove(key)
  }
  static async clear() {
    await chrome.storage.sync.clear()
  }
}

export { LocalExtensionStorage, SyncExtensionStorage }
