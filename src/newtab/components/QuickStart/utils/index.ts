export function getQuickStartItemWidth(QSNum: number, cols: number) {
  if (QSNum < cols) {
    return 100 / QSNum + '%'
  } else {
    return 100 / cols + '%'
  }
}
