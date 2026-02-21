import { BgType, type OldBgType } from '@/shared/enums'

const OldToNewMap = {
  0: BgType.None,
  1: BgType.Local,
  2: BgType.Bing,
  3: BgType.Online
} satisfies Record<OldBgType, BgType>

export function toNewBgType(old: OldBgType): BgType {
  return OldToNewMap[old]
}
