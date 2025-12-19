import { useMediaQuery, useSwipe } from '@vueuse/core'

export interface UseShortcutPagination {
  currentPage: Ref<number>
  totalPages: Ref<number>
  showPagination: ComputedRef<boolean>
  isTouchDevice: ComputedRef<boolean>
  isAnimating: Ref<boolean>
  slideDirection: Ref<'left' | 'right' | null>
  noTransition: Ref<boolean>
  preloadTargetPage: Ref<number | null>
  prevPage: () => void
  nextPage: () => void
  goToPage: (page: number) => void
  setupSwipe: (containerRef: Ref<HTMLElement | undefined>, isDragging?: Ref<boolean>) => void
}

const ANIMATION_DURATION = 300 // ms

export function useShortcutPagination(
  totalItems: Ref<number>,
  itemsPerPage: Ref<number>
): UseShortcutPagination {
  const currentPage = ref(0)
  const isAnimating = ref(false)
  const slideDirection = ref<'left' | 'right' | null>(null)
  const noTransition = ref(false)
  const preloadTargetPage = ref<number | null>(null)
  // 存储传入的 viewport 容器引用（用于在翻页时切换 overflow）
  let storedContainerRef: Ref<HTMLElement | undefined> | null = null

  const totalPages = computed(() => {
    // 防止除以 0 导致 Infinity
    if (itemsPerPage.value <= 0) {
      return 1
    }
    return Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value))
  })

  // 触摸设备检测
  const isTouchDevice = useMediaQuery('(pointer: coarse)')

  // 是否显示分页组件
  const showPagination = computed(() => totalPages.value > 1)

  // 页码变化时确保不越界
  watch(totalPages, (newTotal) => {
    if (currentPage.value >= newTotal) {
      currentPage.value = Math.max(0, newTotal - 1)
    }
  })

  const animateToPage = (targetPage: number, direction: 'left' | 'right') => {
    if (isAnimating.value) return
    if (targetPage < 0 || targetPage >= totalPages.value) return
    if (targetPage === currentPage.value) return

    // 在翻页开始前将 viewport 设为裁切状态
    try {
      const el = storedContainerRef?.value
      if (el) {
        el.classList.add('shortcut__slide-viewport--switching')
      }
    } catch {}

    isAnimating.value = true
    slideDirection.value = direction

    // 动画结束后更新页码
    setTimeout(() => {
      // 禁用 transition，防止内容更新时触发二次动画
      noTransition.value = true
      slideDirection.value = null
      currentPage.value = targetPage
      // 清除预加载标记（如果有）
      preloadTargetPage.value = null

      // 在下一帧恢复 transition
      requestAnimationFrame(() => {
        noTransition.value = false
        isAnimating.value = false
        // 动画结束后移除裁切状态
        try {
          const el = storedContainerRef?.value
          if (el) {
            el.classList.remove('shortcut__slide-viewport--switching')
          }
        } catch {}
      })
    }, ANIMATION_DURATION)
  }

  const prevPage = () => {
    if (currentPage.value > 0) {
      animateToPage(currentPage.value - 1, 'right')
    }
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value - 1) {
      animateToPage(currentPage.value + 1, 'left')
    }
  }

  const goToPage = (page: number) => {
    if (page < 0 || page >= totalPages.value || page === currentPage.value) return

    const distance = Math.abs(page - currentPage.value)
    const direction = page > currentPage.value ? 'left' : 'right'

    // 跨页跳转（距离 > 1）：先将目标页内容预加载到即将滑入的 prev/next 位置
    if (distance > 1) {
      // 设置预加载目标页（组件会据此渲染目标页内容到相邻位置）
      preloadTargetPage.value = page

      // 等待 DOM 更新后再执行翻页动画
      nextTick(() => {
        // 等待一帧确保内容已渲染
        requestAnimationFrame(() => {
          // 执行翻页动画（不清除 preloadTargetPage，让动画期间目标内容保持在相邻位置）
          // preloadTargetPage 会在 animateToPage 动画结束后清除
          animateToPage(page, direction)
        })
      })
    } else {
      // 相邻页直接翻页
      animateToPage(page, direction)
    }
  }

  // 设置滑动手势并保存容器引用
  const setupSwipe = (containerRef: Ref<HTMLElement | undefined>, isDragging?: Ref<boolean>) => {
    storedContainerRef = containerRef

    const { direction } = useSwipe(containerRef, {
      threshold: 50,
      onSwipeEnd() {
        // 如果正在拖拽排序，则不触发翻页
        if (isDragging?.value) return
        if (isAnimating.value) return
        if (direction.value === 'left') {
          nextPage()
        } else if (direction.value === 'right') {
          prevPage()
        }
      }
    })
  }

  return {
    currentPage,
    totalPages,
    showPagination,
    isTouchDevice,
    isAnimating,
    slideDirection,
    noTransition,
    preloadTargetPage,
    prevPage,
    nextPage,
    goToPage,
    setupSwipe
  }
}
