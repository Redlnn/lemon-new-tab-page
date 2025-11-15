import type { Store } from 'pinia'

import i18next from 'i18next'

import { saveShortcut, type Shortcut } from '@/shared/shortcut'

export async function removeShortcut(
  index: number,
  store: Store<'shortcut', Shortcut>,
  refresh: () => Promise<void>
) {
  const { url, title, favicon } = store.items[index]!
  store.items.splice(index, 1)
  await saveShortcut(store.$state)
  await refresh()
  ElMessage.success({
    message: h('p', null, [
      h(
        'span',
        { style: { color: 'var(--el-color-success)' } },
        i18next.t('newtab:shortcut.unpinMessage')
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
            await saveShortcut(store.$state)
            await refresh()
          }
        },
        i18next.t('newtab:common.undo')
      )
    ])
  })
}

export async function pinShortcut(
  store: Store<'shortcut', Shortcut>,
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
  await saveShortcut(store.$state)
  await refresh()
}
