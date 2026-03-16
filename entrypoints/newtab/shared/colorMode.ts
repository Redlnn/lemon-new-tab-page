import { useColorMode, usePreferredDark } from '@vueuse/core'

// 单例：在模块加载时（页面启动阶段）初始化，避免在组件挂载时重复调用
// 导致 watchEffect 在设置面板动画期间触发全页面样式重计算
export const preferredDark = usePreferredDark()

export const colorMode = useColorMode({
  modes: {
    dark: 'dark',
    light: 'light',
    auto: '',
  },
})
