<script lang="ts" setup>
import { dialogInjectionKey, useDraggable, useLocale } from 'element-plus'
import {
  dialogContentEmits,
  dialogContentProps
} from 'element-plus/es/components/dialog/src/dialog-content'
import { FOCUS_TRAP_INJECTION_KEY } from 'element-plus/es/components/focus-trap/src/tokens'
import { composeRefs } from 'element-plus/es/utils/vue/refs'

const { t: t_ } = useLocale()

const props = defineProps(dialogContentProps)
defineEmits(dialogContentEmits)

const { dialogRef, headerRef, bodyId, ns, style } = inject(dialogInjectionKey)!
const { focusTrapRef } = inject(FOCUS_TRAP_INJECTION_KEY)!

const composedDialogRef = composeRefs(focusTrapRef, dialogRef)

const draggable = computed(() => !!props.draggable)
const overflow = computed(() => !!props.overflow)
const { resetPosition, updatePosition, isDragging } = useDraggable(
  dialogRef,
  headerRef,
  draggable,
  overflow
)

const dialogKls = computed(() => [
  ns.b(),
  ns.is('fullscreen', props.fullscreen),
  ns.is('draggable', draggable.value),
  ns.is('dragging', isDragging.value),
  ns.is('align-center', !!props.alignCenter),
  { [ns.m('center')]: props.center }
])

defineExpose({
  resetPosition,
  updatePosition
})
</script>

<template>
  <div :ref="composedDialogRef" :class="dialogKls" :style="style" tabindex="-1">
    <slot name="aside"></slot>
    <div :id="bodyId" :class="[ns.e('body'), bodyClass]">
      <header ref="headerRef" :class="[headerClass]">
        <slot name="header">
          <span role="heading" :aria-level="ariaLevel" :class="ns.e('title')">
            {{ title }}
          </span>
        </slot>
        <button
          v-if="showClose"
          :aria-label="t_('el.dialog.close')"
          :class="ns.e('headerbtn')"
          type="button"
          @click="$emit('close')"
        >
          <el-icon :class="ns.e('close')">
            <component :is="closeIcon" />
          </el-icon>
        </button>
      </header>
      <slot></slot>
    </div>
  </div>
</template>
