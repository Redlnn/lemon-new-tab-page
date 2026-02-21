<script setup lang="ts">
import { toRef } from 'vue'
import { onLongPress } from '@vueuse/core'

import { Pin12Regular, Star12Regular } from '@vicons/fluent'
import { ContentCopyRound, OpenInNewRound } from '@vicons/material'
import type { DropdownInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'

import { browser } from '#imports'

import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import usePerfClasses from '@newtab/composables/usePerfClasses'
import { SHORTCUT_OPENED_MENU_CLOSE_FN } from '@newtab/shared/keys'
import { isHasTouchDevice, isTouchEvent } from '@newtab/shared/touch'

const { t } = useTranslation()
const settings = useSettingsStore()

const props = defineProps<{
  url: string
  title: string
  pined?: boolean
  favicon?: string
}>()

// 使用 Ref 传递 url，让 getFaviconURL 内部监听变化
const faviconRef = getFaviconURL(toRef(props, 'url'))
const iconUrl = computed(() => props.favicon || faviconRef.value)

const perf = usePerfClasses(() => ({
  transparentOff: settings.perf.disableShortcutTransparent,
  blurOff: settings.perf.disableShortcutBlur
}))

const iconClass = perf('shortcut__icon')
const pinIconClass = perf('shortcut__pin-icon')
const popperClass = perf('shortcut__menu-popper')

const openedMenuCloseFn = inject(SHORTCUT_OPENED_MENU_CLOSE_FN)
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
  dropdownRef.value?.handleOpen()

  // 记录当前菜单的关闭函数
  if (openedMenuCloseFn) {
    openedMenuCloseFn.value = () => dropdownRef.value?.handleClose()
  }
}

onLongPress(itemRef, (event) => {
  if (isHasTouchDevice.value && isTouchEvent(event)) {
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

function openInNewWindow() {
  browser.windows.create({ url: props.url })
}

function copyLink() {
  navigator.clipboard.writeText(props.url)
}

async function createBookmark() {
  const res = await browser.bookmarks.search({ url: props.url })
  if (res.length !== 0) {
    ElMessage.info(t('shortcut.bookmark.existing'))
    return
  }
  browser.bookmarks.create({ title: props.title, url: props.url }, (res) => {
    if (!res.parentId) return
    chrome.bookmarks.get(res.parentId, (nodes) => {
      const folderTitle = nodes?.[0]?.title ?? null
      ElMessage.success(t('shortcut.bookmark.success', { folder: folderTitle }))
    })
  })
}

defineExpose({ open, close })
</script>

<template>
  <div role="button" class="shortcut__item noselect" :class="[{ pined: pined }]">
    <a
      ref="itemRef"
      class="shortcut__item-link"
      tabindex="-1"
      :href="url"
      :target="settings.shortcut.openInNewTab ? '_blank' : '_self'"
      @contextmenu.stop.prevent="handleContextmenu"
    >
      <div
        class="shortcut__icon-container"
        :style="{ marginBottom: `${settings.shortcut.iconMarginBottom}px` }"
      >
        <div
          v-if="pined && settings.shortcut.showPinnedIcon && settings.shortcut.enableTopSites"
          :class="['shortcut__pin-icon', pinIconClass]"
        >
          <el-icon size="11">
            <pin12-regular />
          </el-icon>
        </div>
        <div class="shortcut__icon" :class="iconClass">
          <span
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
        :style="{ width: `calc(var(--icon_size) + ${settings.shortcut.titleExtraWidth}px)` }"
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
        :popper-class="popperClass"
      >
        <template #dropdown>
          <el-dropdown-menu class="noselect">
            <el-dropdown-item :icon="OpenInNewRound" @click="openInNewTab">
              <span>{{ t('settings:common.openInNewTab') }}</span>
            </el-dropdown-item>
            <el-dropdown-item :icon="OpenInNewRound" @click="openInNewWindow">
              <span>{{ t('settings:common.openInNewWindow') }}</span>
            </el-dropdown-item>
            <el-dropdown-item :icon="ContentCopyRound" @click="copyLink">
              <span>{{ t('settings:common.copyLink') }}</span>
            </el-dropdown-item>
            <el-dropdown-item :icon="Star12Regular" @click="createBookmark">
              <span>{{ t('shortcut.bookmark.add') }}</span>
            </el-dropdown-item>
            <slot name="submenu"></slot>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </a>
  </div>
</template>
