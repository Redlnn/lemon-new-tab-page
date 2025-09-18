/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />
/// <reference types="chrome" />

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
