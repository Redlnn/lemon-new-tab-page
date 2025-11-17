import type { InjectionKey } from 'vue'

// 打开搜索引擎偏好弹窗（SearchEnginesSwitcher）
export const OPEN_SEARCH_ENGINE_PREFERENCE: InjectionKey<() => void> = Symbol(
  'openSearchEnginePreference'
)

export const OPEN_BACKGROUND_PREFERENCE: InjectionKey<() => void> = Symbol(
  'openBackgroundPreference'
)
