import type { Store } from 'pinia'

import i18next from 'i18next'

import { type Bookmark, saveBookmark } from '@/shared/bookmark'

export async function removeBookmark(
  index: number,
  store: Store<'bookmark', Bookmark>,
  refresh: () => Promise<void>
) {
  const { url, title, favicon } = store.items[index]!
  store.items.splice(index, 1)
  await saveBookmark(store.$state)
  await refresh()
  ElMessage.success({
    message: h('p', null, [
      h(
        'span',
        { style: { color: 'var(--el-color-success)' } },
        i18next.t('newtab:shortcut.removePinnedMessage.content')
      ),
      h(
        'span',
        {
          style: { marginLeft: '20px', color: 'var(--el-color-primary)', cursor: 'pointer' },
          onClick: async () => {
            store.items.splice(index, 0, {
              url,
              title,
              favicon
            })
            await saveBookmark(store.$state)
            await refresh()
          }
        },
        i18next.t('newtab:shortcut.removePinnedMessage.revoke')
      )
    ])
  })
}

export async function pinBookmark(
  store: Store<'bookmark', Bookmark>,
  refresh: () => Promise<void>,
  url: string,
  title: string,
  favicon?: string
) {
  store.items.push({
    url,
    title,
    favicon
  })
  await saveBookmark(store.$state)
  await refresh()
}
