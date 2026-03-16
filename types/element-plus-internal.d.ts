declare module 'element-plus/es/components/focus-trap/src/focus-trap.mjs' {
  export { _default as default } from 'element-plus/es/components/focus-trap/src/focus-trap.vue'
}

declare module 'element-plus/es/components/teleport/src/teleport2.mjs' {
  export { _default as default } from 'element-plus/es/components/teleport/src/teleport.vue'
}

declare module 'element-plus/es/components/dialog/src/dialog-content.mjs' {
  import type { DefineComponent } from 'vue'

  import type { DialogContentProps } from 'element-plus/es/components/dialog/src/dialog-content'

  export const dialogContentEmits: { close: () => true }
  export const dialogContentPropsDefaults: Omit<DialogContentProps, 'closeIcon'> & {
    closeIcon?: string | DefineComponent
  }
}
