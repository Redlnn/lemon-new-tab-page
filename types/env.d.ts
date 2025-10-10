/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />
/// <reference types="chrome" />

declare module '*.md' {
  import type { ComponentOptions } from 'vue'

  const Component: ComponentOptions
  export default Component
}

declare module 'jinrishici' {
  interface Origin {
    title: string
    dynasty: string
    author: string
    content: string[]
    translate: string[]
  }

  interface Data {
    id: string
    content: string
    popularity: number
    origin: Origin
    matchTags: string[]
    recommendedReason: string
    cacheAt: string
  }

  interface RootObject {
    status: string
    data: Data
    token: string
    ipAddress: string
  }

  interface Error {
    status: string
    errCode: number
    errMessage: string
  }

  export function load(result: (result: RootObject) => void, err: (error: Error) => void): void
}

// https://vitejs.dev/guide/api-hmr.html
interface ViteHotContext {
  readonly data: unknown

  // accept(): void
  accept(cb?: (mod: ModuleNamespace | undefined) => void): void
  accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void
  accept(deps: readonly string[], cb: (mods: Array<ModuleNamespace | undefined>) => void): void

  dispose(cb: (data: unknown) => void): void
  decline(): void
  invalidate(): void

  // `InferCustomEventPayload` 为内置 Vite 事件提供类型
  on<T extends string>(event: T, cb: (payload: InferCustomEventPayload<T>) => void): void
  send<T extends string>(event: T, data?: InferCustomEventPayload<T>): void
}

// 允许导入虚拟模块
// 参考: https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention
declare module 'virtual:*'
