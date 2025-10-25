export function useTransientWillChange(element: Ref<HTMLElement | undefined>, property: string) {
  const add = () => {
    if (!element.value) return
    element.value.style.willChange = property
  }
  const remove = () => {
    if (!element.value) return
    element.value.style.willChange = ''
  }

  return { add, remove }
}

export default useTransientWillChange
