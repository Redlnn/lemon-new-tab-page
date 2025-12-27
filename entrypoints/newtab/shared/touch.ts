import { useMediaQuery } from '@vueuse/core'

export const isOnlyTouchDevice = useMediaQuery("(hover: none) and (pointer: coarse)")
export const isHasTouchDevice = useMediaQuery("(pointer: coarse)")
