/**
 * 生成受性能开关控制的类名字符串。
 * 规则：
 * - 始终包含前缀类：`${prefix}`
 * - 未禁用透明 => 添加 `${prefix}--opacity`
 * - 未禁用模糊 且 (未禁用透明 或 options.blurIndependent 为 true) => 添加 `${prefix}--blur`
 */
export function getPerfClasses(
  opts: { transparentOff: boolean; blurOff: boolean },
  prefix: string,
  options?: { blurIndependent?: boolean; withoutPrefix?: boolean }
): string {
  const parts: string[] = options?.withoutPrefix ? [] : [prefix]
  const transparentOn = !opts.transparentOff
  const blurOn = !opts.blurOff && (transparentOn || options?.blurIndependent === true)
  if (transparentOn) {
    parts.push(`${prefix}--opacity`)
  }
  if (blurOn) {
    parts.push(`${prefix}--blur`)
  }
  return parts.join(' ')
}

export default getPerfClasses
