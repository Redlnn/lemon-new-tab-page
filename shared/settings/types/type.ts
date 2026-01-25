export interface localBackground {
  id: string
  /** @deprecated */
  url?: string
  mediaType?: 'image' | 'video' // 可选的媒体类型: 'image' | 'video'，用于在渲染时选择 <img> 或 <video>
}

export interface bingBackground {
  id: string
  /** @deprecated */
  url?: string
  updateDate: string | number
}
