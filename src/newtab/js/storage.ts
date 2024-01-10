import browser from 'webextension-polyfill'

class LocalExtensionStorage {
  static async setItem<T>(key: string, value: T) {
    await browser.storage.local.set({ [key]: value })
  }
  static async getItem<T>(key: string): Promise<T | undefined>
  static async getItem<T>(key: string, _default: T): Promise<T>
  static async getItem<T>(key: string, _default?: T) {
    const result = await browser.storage.local.get(key)
    return result[key] || _default
  }
  static async removeItem(key: string) {
    await browser.storage.local.remove(key)
  }
  static async clear() {
    await browser.storage.local.clear()
  }
}

class SyncExtensionStorage {
  static async setItem<T>(key: string, value: T) {
    await browser.storage.sync.set({ [key]: value })
  }
  static async getItem<T>(key: string): Promise<T | undefined>
  static async getItem<T>(key: string, _default: T): Promise<T>
  static async getItem<T>(key: string, _default?: T) {
    const result = await browser.storage.sync.get(key)
    return result[key] || _default
  }
  static async removeItem(key: string) {
    await browser.storage.sync.remove(key)
  }
  static async clear() {
    await browser.storage.sync.clear()
  }
}

export { LocalExtensionStorage, SyncExtensionStorage }
