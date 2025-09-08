import type { Store } from 'pinia'
import { h } from 'vue'

import { type Bookmark, saveBookmark } from '@/shared/bookmark'
import { t } from '@/shared/i18n'

export async function removeBookmark(
  index: number,
  store: Store<'bookmark', Bookmark>,
  refresh: () => Promise<void>
) {
  const { url, title, favicon } = store.items[index]!
  if (store.items.length > 1) {
    store.items = store.items.filter((_, i) => i !== index)
  } else {
    store.items = []
  }
  await saveBookmark(store)
  await refresh()
  ElMessage({
    message: h('p', null, [
      h(
        'span',
        { style: { color: 'var(--el-color-success)' } },
        t('newtab.shortcut.removePinnedMessage.content')
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
            await saveBookmark(store)
            await refresh()
          }
        },
        t('newtab.shortcut.removePinnedMessage.revoke')
      )
    ]),
    type: 'success'
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
  await saveBookmark(store)
  await refresh()
}
