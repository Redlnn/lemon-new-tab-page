<script lang="ts" setup>
import type { PropType } from 'vue'
import { watchEffect } from 'vue'

import {
  dialogEmits,
  dialogInjectionKey,
  dialogProps,
  useDialog,
  useNamespace,
  useSameTarget
} from 'element-plus'

import { ElFocusTrap, ElTeleport } from './ElComponents'
import SettingsDialogContent from './SettingsDialogContent.vue'

const props = defineProps({
  ...dialogProps,
  class: {
    type: [String, Object, Array] as PropType<
      string | Record<string, boolean> | Array<string | Record<string, boolean>>
    >,
    default: ''
  }
})
defineEmits(dialogEmits)

const ns = useNamespace('dialog')
const dialogRef = ref<HTMLElement>()
const headerRef = ref<HTMLElement>()
const dialogContentRef = ref<typeof SettingsDialogContent>()

const {
  visible,
  titleId,
  bodyId,
  style,
  overlayDialogStyle,
  rendered,
  transitionConfig,
  zIndex,
  _draggable,
  _alignCenter,
  _overflow,
  handleClose,
  onModalClick,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onCloseRequested,
  onFocusoutPrevented
} = useDialog(props, dialogRef)

watchEffect(() => {
  // 如果未destroyOnClose，则始终保持rendered为true
  // 使得可以提前加载子组件触发子组件的生命周期
  // （主要是要触发子组件的预加载逻辑）
  if (!props.destroyOnClose) {
    rendered.value = true
  }
})

provide(dialogInjectionKey, {
  dialogRef,
  headerRef,
  bodyId,
  ns,
  rendered,
  style
})

const overlayEvent = useSameTarget(onModalClick)

const penetrable = computed(() => props.modalPenetrable && !props.modal && !props.fullscreen)

const resetPosition = () => {
  dialogContentRef.value?.resetPosition()
}

defineExpose({
  visible,
  dialogContentRef,
  resetPosition,
  handleClose
})
</script>

<template>
  <el-teleport :to="appendTo" :disabled="appendTo !== 'body' ? false : !appendToBody">
    <transition v-bind="transitionConfig">
      <el-overlay
        v-show="visible"
        custom-mask-event
        :mask="modal"
        :overlay-class="[
          modalClass ?? '',
          `${ns.namespace.value}-modal-dialog`,
          ns.is('penetrable', penetrable)
        ]"
        :z-index="zIndex"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="title || undefined"
          :aria-labelledby="!title ? titleId : undefined"
          :aria-describedby="bodyId"
          :class="`${ns.namespace.value}-overlay-dialog`"
          :style="overlayDialogStyle"
          @click="overlayEvent.onClick"
          @mousedown="overlayEvent.onMousedown"
          @mouseup="overlayEvent.onMouseup"
        >
          <el-focus-trap
            loop
            :trapped="visible"
            focus-start-el="container"
            @focus-after-trapped="onOpenAutoFocus"
            @focus-after-released="onCloseAutoFocus"
            @focusout-prevented="onFocusoutPrevented"
            @release-requested="onCloseRequested"
          >
            <settings-dialog-content
              v-if="rendered"
              ref="dialogContentRef"
              v-bind="$attrs"
              :class="props.class"
              :center="center"
              :align-center="_alignCenter"
              :close-icon="closeIcon"
              :draggable="_draggable"
              :overflow="_overflow"
              :fullscreen="fullscreen"
              :header-class="headerClass"
              :body-class="bodyClass"
              :footer-class="footerClass"
              :show-close="showClose"
              :title="title"
              :aria-level="headerAriaLevel"
              @close="handleClose"
            >
              <template #aside>
                <slot name="aside" />
              </template>
              <template #header>
                <slot
                  name="header"
                  :close="handleClose"
                  :title-id="titleId"
                  :title-class="ns.e('title')"
                />
              </template>
              <slot />
              <template v-if="$slots.footer" #footer>
                <slot name="footer" />
              </template>
            </settings-dialog-content>
          </el-focus-trap>
        </div>
      </el-overlay>
    </transition>
  </el-teleport>
</template>
