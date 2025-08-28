/// <reference types="vite/client" />
/// <reference types="chrome" />

declare module '*.svg?component' {
  import type { FunctionalComponent, SVGAttributes } from 'vue'
  const src: FunctionalComponent<SVGAttributes>
  export default src
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

type TupleIndices<T extends readonly unknown[]> = number extends T['length'] // 普通数组，长度不固定
  ? number // 返回 number 类型
  : Exclude<keyof T, keyof unknown[]> extends infer K
    ? K extends `${infer N extends number}`
      ? N
      : never
    : never
