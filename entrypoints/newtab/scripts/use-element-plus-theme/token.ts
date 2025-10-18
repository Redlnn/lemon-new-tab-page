/** 变量前缀 */
const PRE = '--el-color-primary'
/** 浅色变量前缀 */
const PRE_LIGHT = `${PRE}-light`
/** 深色变量前缀 */
const PRE_DARK = `${PRE}-dark`
/** 色阶 */
const Levels = [3, 5, 7, 8, 9] as const

/** Element Plus 深色模式背景色 */
const EL_BG_COLOR = '#1f1f1f' as const

export { EL_BG_COLOR, Levels, PRE, PRE_DARK, PRE_LIGHT }
