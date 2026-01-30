import { useWindowSize } from '@vueuse/core'

import { useSettingsStore } from '@/shared/settings'

export interface UseShortcutLayout {
  columnsNum: Ref<number>
  rowsNum: Ref<number>
  // 纯计算：不写入 ref，仅返回数值
  computeFitColumns: (allocateSpaces: boolean) => number
  computeNeededRows: (itemCount: number, columns: number) => number
}

export function useShortcutLayout(): UseShortcutLayout {
  const settings = useSettingsStore()
  const { width: windowWidth, height: windowHeight } = useWindowSize({ type: 'visual' })

  const columnsNum = ref(0)
  const rowsNum = ref(settings.shortcut.rows)

  // 单个项目宽度（图标 + 左右内边距各15px）
  const getItemWidth = () => settings.shortcut.iconSize + 30

  // 计算在当前窗口宽度下可容纳的最大列数
  const computeFitColumns = (allocateSpaces: boolean) => {
    const containerWidth = windowWidth.value * 0.85
    const marginH = settings.shortcut.itemMarginH
    const unitWidth = getItemWidth() + marginH
    let extra = settings.shortcut.showShortcutContainerBg ? 60 : 40 // 预留padding空间
    if (allocateSpaces) {
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

  // 计算所需行数（纯函数）
  // 行数：元素不足一行则为1，否则在需要行数与上限中取较小值
  const computeNeededRows = (itemCount: number, columns: number) => {
    let neededRows = Math.ceil(itemCount / columns) || 1
    if (windowHeight.value < 450) {
      neededRows = 1
    }
    return Math.min(neededRows, settings.shortcut.rows)
  }

  return {
    columnsNum,
    rowsNum,
    computeFitColumns,
    computeNeededRows
  }
}
