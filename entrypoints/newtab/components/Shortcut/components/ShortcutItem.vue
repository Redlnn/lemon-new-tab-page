<script setup lang="ts">
import { toRef } from 'vue'
import { onLongPress } from '@vueuse/core'

import { Pin16Regular } from '@vicons/fluent'
import { OpenInNewRound } from '@vicons/material'
import type { DropdownInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'

import { convertBase64Svg, getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import { getPerfClasses } from '@newtab/composables/perfClasses'
import { isOnlyTouchDevice } from '@newtab/shared/touch'

const { t } = useTranslation()
const settings = useSettingsStore()

const props = defineProps<{
  url: string
  title: string
  pined?: boolean
  favicon?: string
}>()

const faviconRef = getFaviconURL(toRef(props, 'url'))
const iconUrl = computed(() => props.favicon || faviconRef.value)

const openedMenuCloseFn = inject<Ref<(() => void) | null>>('shortcutOpenedMenuCloseFn')
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

const itemRef = useTemplateRef('itemRef')

function handleContextmenu(event: MouseEvent | TouchEvent | PointerEvent): void {
  // 打开新菜单前关闭旧菜单
  if (openedMenuCloseFn?.value) {
    openedMenuCloseFn.value()
  }

  let clientX = 0
  let clientY = 0

  if ('clientX' in event) {
    clientX = event.clientX
    clientY = event.clientY
  } else if ('touches' in event && event.touches[0]) {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  }

  position.value = DOMRect.fromRect({
    x: clientX,
    y: clientY
  })
  event.preventDefault()
  dropdownRef.value?.handleOpen()

  // 记录当前菜单的关闭函数
  if (openedMenuCloseFn) {
    openedMenuCloseFn.value = () => dropdownRef.value?.handleClose()
  }
}

onLongPress(itemRef, (event) => {
  if (isOnlyTouchDevice.value) {
    handleContextmenu(event)
  }
})

function open() {
  dropdownRef.value?.handleOpen()
}

function close() {
  dropdownRef.value?.handleClose()
}

function openInNewTab() {
  window.open(props.url, '_blank')
}

defineExpose({ open, close })
</script>

<template>
  <div class="shortcut__item noselect" :class="[{ pined: pined }]">
    <a
      ref="itemRef"
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
          <el-icon size="11">
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
            <el-dropdown-item @click="openInNewTab">
              <el-icon>
                <open-in-new-round />
              </el-icon>
              <span>{{ t('settings:common.openInNewTab') }}</span>
            </el-dropdown-item>
            <slot name="submenu"></slot>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </a>
  </div>
</template>
