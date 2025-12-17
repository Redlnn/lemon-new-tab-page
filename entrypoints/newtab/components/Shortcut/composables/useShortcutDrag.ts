import { useDraggable } from 'vue-draggable-plus'

import { saveShortcut, useShortcutStore } from '@/shared/shortcut'

export function useShortcutDrag(
  containerRef: Ref<HTMLElement | undefined>,
  shortcuts: Ref<{ url: string; title: string; favicon?: string }[]>,
  refresh: () => void
) {
  const shortcutStore = useShortcutStore()
  useDraggable(containerRef, shortcuts, {
    animation: 150,
    handle: '.shortcut__item.pined',
    onUpdate() {
      shortcutStore.items = shortcuts.value
      saveShortcut(shortcutStore.$state)
      refresh()
    }
  })
}
