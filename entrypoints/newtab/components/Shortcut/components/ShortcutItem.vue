<script setup lang="ts">
import { toRef } from 'vue'

import { Pin16Regular } from '@vicons/fluent'
import type { DropdownInstance } from 'element-plus'

import { convertBase64Svg, getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import { getPerfClasses } from '@newtab/composables/perfClasses'

const settings = useSettingsStore()

const props = defineProps<{
  url: string
  title: string
  pined?: boolean
  favicon?: string
}>()

const faviconRef = getFaviconURL(toRef(props, 'url'))
const iconUrl = computed(() => props.favicon || faviconRef.value)

const emit = defineEmits<{
  opened: []
}>()

const dropdownRef = ref<DropdownInstance>()
const position = ref({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0
} as DOMRect)
const triggerRef = ref({
  getBoundingClientRect: () => position.value
})

function handleContextmenu(event: MouseEvent): void {
  const { clientX, clientY } = event
  position.value = DOMRect.fromRect({
    x: clientX,
    y: clientY
  })
  event.preventDefault()
  dropdownRef.value?.handleOpen()
  emit('opened')
}

function open() {
  dropdownRef.value?.handleOpen()
}

function close() {
  dropdownRef.value?.handleClose()
}

defineExpose({ open, close })
</script>

<template>
  <div class="shortcut__item noselect" :class="[{ pined: pined }]">
    <a
      class="shortcut__item-link"
      :href="url"
      :target="settings.shortcut.openInNewTab ? '_blank' : '_self'"
      @contextmenu="handleContextmenu"
    >
      <div class="shortcut__icon-container">
        <div
          v-if="pined && settings.shortcut.showPinnedIcon && settings.shortcut.enableTopSites"
          :class="[
            'shortcut__pin-icon',
            getPerfClasses(
              {
                transparentOff: settings.perf.disableShortcutTransparent,
                blurOff: settings.perf.disableShortcutBlur
              },
              'shortcut__pin-icon'
            )
          ]"
        >
          <el-icon size="15">
            <pin16-regular />
          </el-icon>
        </div>
        <div
          class="shortcut__icon"
          :class="
            getPerfClasses(
              {
                transparentOff: settings.perf.disableShortcutTransparent,
                blurOff: settings.perf.disableShortcutBlur
              },
              'shortcut__icon'
            )
          "
        >
          <span
            v-if="favicon && favicon.startsWith('data:image/svg+xml')"
            v-html="convertBase64Svg(favicon as string)"
            class="span"
          ></span>
          <span
            v-else
            class="span"
            :style="{
              backgroundImage: `url(${iconUrl})`
            }"
          ></span>
        </div>
      </div>
      <el-text
        :data-content="title"
        v-if="settings.shortcut.showShortcutTitle"
        class="shortcut__title"
        truncated
      >
        {{ title }}
      </el-text>
      <el-dropdown
        ref="dropdownRef"
        :virtual-ref="triggerRef"
        :show-arrow="false"
        virtual-triggering
        trigger="contextmenu"
        placement="bottom-start"
        :popper-options="{
          modifiers: [{ name: 'offset', options: { offset: [0, 0] } }]
        }"
        :popper-class="
          getPerfClasses(
            {
              transparentOff: settings.perf.disableShortcutTransparent,
              blurOff: settings.perf.disableShortcutBlur
            },
            'shortcut__menu-popper'
          )
        "
      >
        <template #dropdown>
          <el-dropdown-menu>
            <slot name="submenu"></slot>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </a>
  </div>
</template>
