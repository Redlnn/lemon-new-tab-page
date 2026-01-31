import { useDebounceFn, useWindowSize } from '@vueuse/core'

import { isOnlyTouchDevice } from '@/entrypoints/newtab/shared/touch'
import { useSettingsStore } from '@/shared/settings'

/**
 * 列优先网格求解
 * @param n     当前页需要的格子数
 * @param cMax  最大列
 * @param rMax  最大行
 */
export function solveGridColumnFirst(n: number, cMax: number, rMax: number) {
  if (n <= 0) return { cols: 1, rows: 1 }

  const cols = Math.min(cMax, n)
  const rows = Math.min(rMax, Math.ceil(n / cols))
  return { cols, rows }
}

export function usePagedGridLayout() {
  const settings = useSettingsStore()
  const { width: windowWidth, height: windowHeight } = useWindowSize({ type: 'visual' })

  // 单个项目宽度（图标 + 左右内边距各15px）
  const getItemWidth = () => settings.shortcut.iconSize + 30

  // 计算在当前窗口宽度下可容纳的最大列数
  const computeFitColumns = () => {
    const containerWidth = windowWidth.value * 0.85
    const marginH = settings.shortcut.itemMarginH
    const unitWidth = getItemWidth() + marginH
    let extra = settings.shortcut.showShortcutContainerBg ? 60 : 40 // 预留padding空间
    if (!(isOnlyTouchDevice.value || settings.shortcut.disablePaging)) {
      // 多页模式下预留分页按钮和间距空间
      extra += 88
    }

    // 假设有 n 列，则总宽度为 n * unitWidth - marginH + extra
    // 其中 - marginH 是因为最后一列不需要右侧间距
    // 要求这个总宽度小于等于 containerWidth
    // 因此有不等式
    // n * unitWidth - marginH + extra <= containerWidth
    // n < (containerWidth + marginH - extra) / unitWidth
    const raw = Math.floor((containerWidth + marginH - extra) / unitWidth)
    return Math.max(1, Math.min(settings.shortcut.columns, raw))
  }

  // 最大列数
  const maxFitCols = ref(settings.shortcut.columns)

  const updateMaxCols = useDebounceFn(() => {
    maxFitCols.value = computeFitColumns()
  }, 100)

  // 纯最大行数
  const maxFitRows = computed(() => (windowHeight.value < 450 ? 1 : settings.shortcut.rows))

  return { updateMaxCols, maxFitCols, maxFitRows }
}
