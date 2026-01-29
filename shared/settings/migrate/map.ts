import { BgType, OldBgType } from '@/shared/enums'

export const searchEnginesMap = {
  0: 'google',
  1: 'baidu',
  2: 'bing'
} as const

const OldToNewMap: Record<OldBgType, BgType> = {
  [OldBgType.none]: BgType.None,
  [OldBgType.Local]: BgType.Local,
  [OldBgType.Bing]: BgType.Bing,
  [OldBgType.Online]: BgType.Online
}

export function toNewBgType(old: OldBgType): BgType {
  return OldToNewMap[old]
}
