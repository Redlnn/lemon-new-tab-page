import { useWindowSize } from '@vueuse/core'

import { useSettingsStore } from '@/shared/settings'

export interface UseShortcutLayout {
  columnsNum: Ref<number>
  rowsNum: Ref<number>
  getContainerWidth: (num: number) => number
  computeLayout: (itemCount: number) => { columns: number; rows: number }
  computeColumnsByWidth: () => number
  computeRowsGivenColumns: (itemCount: number, columns: number) => number
  // 纯计算：不写入 ref，仅返回数值
  computeFitColumns: () => number
  computeNeededRows: (itemCount: number, columns: number) => number
}

export function useShortcutLayout(): UseShortcutLayout {
  const settings = useSettingsStore()
  const { width: windowWidth } = useWindowSize()

  const columnsNum = ref(0)
  const rowsNum = ref(settings.shortcut.rows)

  // 单个项目宽度（图标 + 左右内边距各15px）
  const getItemWidth = () => settings.shortcut.iconSize + 30

  const getContainerWidth = (num: number) => {
    const itemWidth = getItemWidth()
    const width = num * itemWidth + (num - 1) * settings.shortcut.itemMarginH
    return settings.shortcut.showShortcutContainerBg ? width + 40 : width
  }

  // 以公式计算在当前窗口宽度下可容纳的最大列数（不考虑 itemCount 上限）
  const computeColumnsFitByWidth = () => {
    const containerWidth = windowWidth.value * 0.85
    const marginH = settings.shortcut.itemMarginH
    const unitWidth = getItemWidth() + marginH
    const extra = settings.shortcut.showShortcutContainerBg ? 40 : 0

    // 假设有 n 列，则总宽度为 n * unitWidth - marginH + extra
    // 其中 - marginH 是因为最后一列不需要右侧间距
    // 要求这个总宽度小于等于 containerWidth
    // 因此有不等式
    // n * unitWidth - marginH + extra <= containerWidth
    // n < (containerWidth + marginH - extra) / unitWidth
    const raw = Math.floor((containerWidth + marginH - extra) / unitWidth)
    return Math.max(1, Math.min(settings.shortcut.columns, raw))
  }

  // 计算所需行数（纯函数）
  // 行数：元素不足一行则为1，否则在需要行数与上限中取较小值
  const computeNeededRows = (itemCount: number, columns: number) => {
    const neededRows = Math.ceil(itemCount / columns) || 1
    return Math.min(settings.shortcut.rows, neededRows)
  }

  // 暴露纯方法：不产生副作用
  const computeFitColumns = () => computeColumnsFitByWidth()

  const computeLayout = (itemCount: number) => {
    // 基于窗口宽度的最大列数，再受 itemCount 限制
    const fitColumns = computeColumnsFitByWidth()
    const _columnsCount = Math.min(fitColumns, Math.max(1, itemCount))
    const _rowsCount = computeNeededRows(itemCount, _columnsCount)

    if (columnsNum.value !== _columnsCount) columnsNum.value = _columnsCount
    if (rowsNum.value !== _rowsCount) rowsNum.value = _rowsCount

    return { columns: _columnsCount, rows: _rowsCount }
  }

  // 仅基于窗口宽度与设置求最大可用列数（不受 itemCount 限制）
  const computeColumnsByWidth = () => {
    const _columnsCount = computeColumnsFitByWidth()
    if (columnsNum.value !== _columnsCount) columnsNum.value = _columnsCount
    return _columnsCount
  }

  // 在已知列数的条件下，根据元素个数计算行数
  const computeRowsGivenColumns = (itemCount: number, columns: number) => {
    const _rowsCount = computeNeededRows(itemCount, columns)
    if (rowsNum.value !== _rowsCount) rowsNum.value = _rowsCount
    return _rowsCount
  }

  return {
    columnsNum,
    rowsNum,
    getContainerWidth,
    computeLayout,
    computeColumnsByWidth,
    computeRowsGivenColumns,
    computeFitColumns,
    computeNeededRows
  }
}
