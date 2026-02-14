export * from './change'
export * from './utils'
export * from './token'
export * from './mix'
export * from './monetStorage'

// 工具函数：切换 DOM 类名
export function toggleDocumentClass(className: string, shouldAdd: boolean) {
  document.documentElement.classList.toggle(className, shouldAdd)
}
