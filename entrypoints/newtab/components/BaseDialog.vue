<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementVisibility, useWindowSize } from '@vueuse/core'

import { CloseRound } from '@vicons/material'
import type { ScrollbarInstance } from 'element-plus'

interface Props {
  title?: string
  modelValue: boolean
  containerClass?: string
  acrylic?: boolean
  opacity?: boolean
  appendToBody?: boolean
  destroyOnClose?: boolean
  style?: object | string
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: []
  closed: []
}>()

const header = ref<HTMLDivElement>()
const scrollbar = ref<ScrollbarInstance>()
const dialog = ref<InstanceType<typeof import('element-plus').ElDialog>>()
const headerIsVisible = useElementVisibility(header)
const { width: windowWidth } = useWindowSize()

function onClose() {
  emit('close')
  emit('update:modelValue', false)
}

function onClosed() {
  emit('closed')
}

function onOpen() {
  emit('open')
  scrollbar.value?.setScrollTop(0)
}

const dialogId = computed(() => {
  return (
    (dialog.value?.$el as HTMLElement)?.nextElementSibling?.firstElementChild?.getAttribute(
      'aria-describedby'
    ) ?? null
  )
})
</script>

<template>
  <el-dialog
    ref="dialog"
    :model-value="modelValue"
    :width="windowWidth < 650 ? '93%' : 600"
    :class="[
      'base-dialog',
      containerClass,
      { 'base-dialog--acrylic': acrylic },
      { 'base-dialog--opacity': opacity }
    ]"
    :style="style"
    :show-close="false"
    lock-scroll
    draggable
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @open="onOpen"
    @close="onClose"
    @closed="onClosed"
  >
    <template #header="{ titleId }">
      <div :id="titleId" class="base-dialog-title" :style="{ opacity: !headerIsVisible ? 1 : 0 }">
        {{ title }}
      </div>
      <span class="base-dialog-close-btn" @click="onClose">
        <component :is="CloseRound" />
      </span>
    </template>
    <div
      v-if="title"
      class="base-dialog-divider"
      :style="{ opacity: !headerIsVisible ? 1 : 0 }"
    ></div>
    <div class="base-dialog-container">
      <el-scrollbar ref="scrollbar" class="base-dialog-scrollbar">
        <div ref="header" class="base-dialog-list-title">
          {{ title }}
        </div>
        <slot></slot>
        <div class="base-dialog-bottom-spacing"></div>
        <el-backtop
          v-if="dialogId"
          :target="`#${dialogId} .el-scrollbar__wrap`"
          style="position: absolute"
          :right="40"
          :bottom="20"
        />
      </el-scrollbar>
    </div>
  </el-dialog>
</template>

<style lang="scss">
.base-dialog {
  height: 500px;
  max-height: 80%;
  padding: 0;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
  border-radius: 10px;
  box-shadow: 0 0 15px 0 color-mix(in oklch, var(--el-bg-color-page), transparent 60%);
  transition:
    background-color var(--el-transition-duration-fast) ease,
    box-shadow var(--el-transition-duration-fast) ease;

  &-container {
    height: 100%;
    padding: 0 19px 0 35px;

    @media screen and (width <= 650px) {
      padding: 0 10px 0 26px;
    }
  }

  &-scrollbar {
    padding-right: 15px;
  }

  &-divider {
    width: 100%;
    height: 1px;
    border-top: 1px color-mix(in oklch, var(--el-border-color), transparent 30%)
      var(--el-border-style);
    transition: opacity 0.1s ease;
  }

  &-bottom-spacing {
    height: 35px;
  }

  & .el-dialog__header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 50px;
    padding: 0;
  }

  & .el-dialog__body {
    height: calc(100% - 51px);
    color: var(--el-text-color-primary);
    transition: color var(--el-transition-duration-fast) ease;
  }

  &-title {
    font-size: var(--el-font-size-large);
    transition: opacity 0.1s ease;
  }

  &-close-btn {
    position: absolute;
    right: 20px;
    height: 20px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition:
      transform 0.1s ease-in-out,
      color var(--el-transition-duration-fast) ease;

    &:hover {
      color: var(--el-text-color-primary);
      transform: rotate(90deg);
    }

    svg {
      height: 100%;
    }
  }

  &-list-title {
    margin-top: 30px;
    font-size: 28px;
    font-weight: 600;
  }
}
</style>
