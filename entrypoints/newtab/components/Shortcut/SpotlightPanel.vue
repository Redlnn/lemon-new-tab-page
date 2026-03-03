<script setup lang="ts">
import { OnLongPress } from '@vueuse/components'
import { useWindowSize } from '@vueuse/core'

import { Pin12Regular, PinOff16Regular, Star12Regular } from '@vicons/fluent'
import {
  AddRound,
  BlockRound,
  ContentCopyRound,
  CycloneTwotone,
  OpenInNewRound
} from '@vicons/material'
import type { DropdownInstance, ScrollbarInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import type { TopSites } from 'webextension-polyfill'

import { browser } from '#imports'

import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'
import { useShortcutStore } from '@/shared/shortcut'

import { useDialog } from '@newtab/composables/useDialog'
import usePerfClasses from '@newtab/composables/usePerfClasses'
import { isHasTouchDevice, isTouchEvent } from '@newtab/shared/touch'

import { pinShortcut, removeShortcut } from './utils/shortcut'
import { blockSite } from './utils/topSites'

const props = defineProps<{
  shortcuts: { url: string; title: string; favicon?: string }[]
  topSites: TopSites.MostVisitedURL[]
  refreshDebounced: () => Promise<void>
  onOpenAddDialog?: () => void
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: []
  closed: []
  scroll: [{ scrollLeft: number; scrollTop: number }]
}>()
const scrollbarRef = ref<ScrollbarInstance>()

const { t } = useTranslation()
const settings = useSettingsStore()
const shortcutStore = useShortcutStore()

const { opened, show, hide, toggle } = useDialog()
defineExpose({ show, hide, toggle })

const { width: windowWidth } = useWindowSize({ type: 'visual' })

const perf = usePerfClasses(() => ({
  transparentOff: false,
  blurOff: false
}))

const dialogPerfClass = perf('base-dialog')
const popperClass = perf('shortcut__menu-popper')

function onClose() {
  opened.value = false
}

function onClosed() {
  opened.value = false
}

function onOpen() {
  scrollbarRef.value?.setScrollTop(0)
  scrollbarRef.value?.update()
}

// ---- 右键上下文菜单（与 Dock.vue 共享同一套逻辑）----
const ctxDropdownRef = ref<DropdownInstance>()
const ctxPosition = ref<DOMRect>(DOMRect.fromRect({ x: 0, y: 0 }))
const ctxTriggerRef = ref({
  getBoundingClientRect: () => ctxPosition.value
})
const ctxItem = ref<{
  url: string
  title: string
  isPinned: boolean
  idx: number
} | null>(null)

function handleContextmenu(
  event: MouseEvent | TouchEvent | PointerEvent,
  item: { url: string; title: string; isPinned: boolean; idx: number }
): void {
  ctxItem.value = item

  let clientX = 0
  let clientY = 0

  if ('clientX' in event) {
    clientX = event.clientX
    clientY = event.clientY
  } else if ('touches' in event && event.touches[0]) {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  }

  ctxPosition.value = DOMRect.fromRect({ x: clientX, y: clientY })
  ctxDropdownRef.value?.handleOpen()
}

function ctxOpenInNewTab(): void {
  if (ctxItem.value) window.open(ctxItem.value.url, '_blank')
}

function ctxOpenInNewWindow(): void {
  if (ctxItem.value) browser.windows.create({ url: ctxItem.value.url })
}

function ctxCopyLink(): void {
  if (ctxItem.value) navigator.clipboard.writeText(ctxItem.value.url)
}

async function ctxCreateBookmark(): Promise<void> {
  if (!ctxItem.value) return
  const { url, title } = ctxItem.value
  const res = await browser.bookmarks.search({ url })
  if (res.length !== 0) {
    ElMessage.info(t('shortcut.bookmark.existing'))
    return
  }
  browser.bookmarks.create({ title, url }, (created) => {
    if (!created.parentId) return
    chrome.bookmarks.get(created.parentId, (nodes) => {
      const folderTitle = nodes?.[0]?.title ?? null
      ElMessage.success(t('shortcut.bookmark.success', { folder: folderTitle }))
    })
  })
}

async function ctxUnpin(): Promise<void> {
  if (!ctxItem.value || !ctxItem.value.isPinned) return
  await removeShortcut(ctxItem.value.idx, shortcutStore, props.refreshDebounced)
}

async function ctxPin(): Promise<void> {
  if (!ctxItem.value || ctxItem.value.isPinned) return
  await pinShortcut(shortcutStore, props.refreshDebounced, ctxItem.value.url, ctxItem.value.title)
}

async function ctxBlockSite(): Promise<void> {
  if (!ctxItem.value || ctxItem.value.isPinned) return
  await blockSite(ctxItem.value.url, props.refreshDebounced)
  await props.refreshDebounced()
}
</script>

<template>
  <el-dialog
    ref="dialogRef"
    :model-value="opened"
    :width="windowWidth < 650 ? '93%' : 600"
    :class="[dialogPerfClass, 'spotlight']"
    :show-close="false"
    lock-scroll
    draggable
    append-to-body
    :modal="false"
    @update:model-value="(val: boolean) => emit('update:modelValue', val)"
    @open="onOpen"
    @close="onClose"
    @closed="onClosed"
    @contextmenu.prevent.stop
  >
    <template #header>
      <div class="spotlight-title">
        <el-icon>
          <CycloneTwotone />
        </el-icon>
        <el-input placeholder="Links" />
      </div>
    </template>
    <!-- Shortcuts 分区 -->
    <section class="spotlight-section">
      <div class="spotlight-grid">
        <template v-for="(item, idx) in shortcuts" :key="`sp-pin-${idx}`">
          <OnLongPress
            as="a"
            class="spotlight-item"
            :href="item.url"
            :target="settings.dock.openInNewTab ? '_blank' : '_self'"
            @contextmenu.stop.prevent="
              (e: MouseEvent) =>
                handleContextmenu(e, {
                  url: item.url,
                  title: item.title,
                  isPinned: true,
                  idx
                })
            "
            @trigger="
              (e: PointerEvent) => {
                if (isHasTouchDevice && isTouchEvent(e))
                  handleContextmenu(e, {
                    url: item.url,
                    title: item.title,
                    isPinned: true,
                    idx
                  })
              }
            "
          >
            <div class="spotlight-item__icon">
              <img :src="item.favicon || getFaviconURL(item.url).value" alt="favicon" />
            </div>
            <span class="spotlight-item__title">{{ item.title }}</span>
          </OnLongPress>
        </template>
        <!-- 固定添加按钮 -->
        <div class="spotlight-item spotlight-item--add" role="button" @click="onOpenAddDialog">
          <div class="spotlight-item__icon spotlight-item__icon--add">
            <add-round />
          </div>
          <span class="spotlight-item__title">{{ t('shortcut.addShortcut') }}</span>
        </div>
      </div>
    </section>

    <!-- TopSites 分区 -->
    <section v-if="topSites.length" class="spotlight-section">
      <p class="spotlight-section__label">{{ t('shortcut.topSites') }}</p>
      <div class="spotlight-grid">
        <template v-for="(item, j) in topSites" :key="`sp-top-${j}`">
          <OnLongPress
            as="a"
            class="spotlight-item"
            :href="item.url"
            :target="settings.dock.openInNewTab ? '_blank' : '_self'"
            @contextmenu.stop.prevent="
              (e: MouseEvent) =>
                handleContextmenu(e, {
                  url: item.url,
                  title: item.title || '',
                  isPinned: false,
                  idx: j
                })
            "
            @trigger="
              (e: PointerEvent) => {
                if (isHasTouchDevice && isTouchEvent(e))
                  handleContextmenu(e, {
                    url: item.url,
                    title: item.title || '',
                    isPinned: false,
                    idx: j
                  })
              }
            "
          >
            <div class="spotlight-item__icon">
              <img :src="item.favicon || getFaviconURL(item.url).value" alt="favicon" />
            </div>
            <span class="spotlight-item__title">{{ item.title }}</span>
          </OnLongPress>
        </template>
      </div>
    </section>

    <!-- 共享右键菜单 -->
    <el-dropdown
      ref="ctxDropdownRef"
      :virtual-ref="ctxTriggerRef"
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
          <el-dropdown-item :icon="OpenInNewRound" @click="ctxOpenInNewTab">
            <span>{{ t('settings:common.openInNewTab') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :icon="OpenInNewRound" @click="ctxOpenInNewWindow">
            <span>{{ t('settings:common.openInNewWindow') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :icon="ContentCopyRound" @click="ctxCopyLink">
            <span>{{ t('settings:common.copyLink') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :icon="Star12Regular" @click="ctxCreateBookmark">
            <span>{{ t('shortcut.bookmark.add') }}</span>
          </el-dropdown-item>
          <template v-if="ctxItem?.isPinned">
            <el-dropdown-item :icon="PinOff16Regular" divided @click="ctxUnpin">
              <span>{{ t('shortcut.unpin') }}</span>
            </el-dropdown-item>
          </template>
          <template v-else>
            <el-dropdown-item :icon="Pin12Regular" divided @click="ctxPin">
              <span>{{ t('shortcut.pin') }}</span>
            </el-dropdown-item>
            <el-dropdown-item :icon="BlockRound" @click="ctxBlockSite">
              <span>{{ t('shortcut.hide') }}</span>
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-dialog>
</template>

<style lang="scss">
@use '@newtab/styles/mixins/acrylic.scss' as acrylic;

html.dialog-transparent .spotlight.base-dialog {
  &--opacity {
    background-color: var(--le-bg-color-overlay-opacity-35);
  }

  &--blur {
    @include acrylic.acrylic(10x, 1, 1);
  }
}

.spotlight-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px 8px;

  .el-icon {
    font-size: 24px;
    color: var(--el-text-color-regular);
  }

  .el-input {
    font-size: 18px;
    --el-input-bg-color: transparent;
    --el-input-placeholder-color: var(--el-text-color-regular);
    --el-input-border: none;
    color: var(--el-text-color-primary);

    .el-input__wrapper {
      box-shadow: none;
    }
  }
}

/* 分区标题 */
.spotlight-section {
  margin: 0 20px;
  & + & {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-darker);
  }

  &__label {
    margin: 0 4px 8px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
  }
}

/* 网格容器 */
.spotlight-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 每个 item */
.spotlight-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 68px;
  padding: 6px 4px;
  gap: 5px;
  cursor: pointer;
  border-radius: 12px;
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgb(255 255 255 / 15%);
  }

  &:active {
    background-color: rgb(255 255 255 / 25%);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 12px;
    overflow: hidden;
    background-color: var(--le-bg-color-overlay-opacity-20);

    img {
      width: 75%;
      height: 75%;
      object-fit: cover;
      border-radius: 8px;
    }

    &--add {
      background-color: var(--le-bg-color-overlay-opacity-20);

      svg {
        width: 55%;
        height: 55%;
        color: var(--el-text-color-secondary);
      }
    }
  }

  &__title {
    width: 100%;
    font-size: 11px;
    line-height: 1.3;
    color: var(--el-text-color-primary);
    text-align: center;
    /* 最多2行，超出省略 */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
  }

  &--add .spotlight-item__title {
    color: var(--el-text-color-secondary);
  }
}
</style>
