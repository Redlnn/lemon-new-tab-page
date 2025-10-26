import { load } from 'jinrishici'

import enhancedFetch from '@/shared/network/fetch'

interface Hitokoto {
  id: number // 一言标识
  hitokoto: string // 一言正文
  type: string // 类型
  from: string // 一言的出处
  from_who: string | null // 一言的作者
  creator: string // 添加者
  creator_uid: number // 添加者用户标识
  reviewer: number // 审核员标识
  uuid: string // 一言唯一标识
  commit_from: string // 提交方式
  created_at: string // 添加时间
  length: number // 句子长度
}

export type YiyanResult = {
  yiyan?: string
  yiyanOrigin?: string
}

export type YiyanProviderKey = keyof typeof yiyanProviders
export const yiyanProviders = {
  jinrishici: {
    nameKey: 'settings:yiyan.providers.jinrishici.name',
    note: undefined,
    website: 'https://www.jinrishici.com',
    load: () =>
      new Promise<YiyanResult>((resolve) => {
        load(
          (res) =>
            resolve({
              yiyan: res.data.content,
              yiyanOrigin: res.data.origin.title
            }),
          () =>
            resolve({
              yiyan: undefined,
              yiyanOrigin: undefined
            })
        )
      })
  },
  hitokoto: {
    nameKey: 'settings:yiyan.providers.hitokoto.name',
    note: 'settings:yiyan.providers.hitokoto.note',
    website: 'https://hitokoto.cn',
    load: async (): Promise<YiyanResult> => {
      try {
        const { hitokoto, from } = await enhancedFetch<Hitokoto>('https://v1.hitokoto.cn')
        return { yiyan: hitokoto, yiyanOrigin: from }
      } catch (error) {
        console.error('Error fetching hitokoto:', error)
        return { yiyan: undefined, yiyanOrigin: undefined }
      }
    }
  }
} as const
