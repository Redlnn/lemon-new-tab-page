export function useDialog() {
  const opened = ref(false)

  const show = () => {
    opened.value = true
  }

  const hide = () => {
    opened.value = false
  }

  const toggle = () => {
    opened.value = !opened.value
  }

  return {
    opened,
    show,
    hide,
    toggle
  }
}
