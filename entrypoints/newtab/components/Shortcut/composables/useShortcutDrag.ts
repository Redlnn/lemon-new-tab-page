import { useDraggable } from 'vue-draggable-plus'

import { useShortcutStore } from '@/shared/shortcut'

export function useShortcutDrag(
  containerRef: Ref<HTMLElement | undefined | null>,
  shortcuts: ShallowRef<{ url: string; title: string; favicon?: string }[]>,
  refresh: () => void,
) {
  const shortcutStore = useShortcutStore()
  const isDragging = ref(false)

  useDraggable(containerRef, shortcuts, {
    animation: 150,
    delayOnTouchOnly: true,
    touchStartThreshold: 10,
    delay: 100,
    handle: '.shortcut__item.pined',
    onStart() {
      isDragging.value = true
    },
    onEnd() {
      isDragging.value = false
    },
    onUpdate() {
      shortcutStore.items = shortcuts.value
      shortcutStore.save()
      refresh()
    },
  })

  return {
    isDragging,
  }
}
