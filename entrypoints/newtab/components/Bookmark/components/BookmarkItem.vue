<script setup lang="ts">
import { onLongPress } from '@vueuse/core'

import { Dismiss16Regular, Pin16Regular } from '@vicons/fluent'
import { ContentCopyRound, FolderOpenRound, OpenInNewRound } from '@vicons/material'
import type { DropdownInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import { browser, type Browser } from 'wxt/browser'

import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'
import { saveShortcut, useShortcutStore } from '@/shared/shortcut'

import { getPerfClasses } from '@newtab/composables/perfClasses'
import { isHasTouchDevice, isTouchEvent } from '@newtab/shared/touch'

const { t } = useTranslation()
const settings = useSettingsStore()
const shortcutStore = useShortcutStore()

const props = withDefaults(
  defineProps<{
    node: Browser.bookmarks.BookmarkTreeNode
    depth?: number
  }>(),
  {
    depth: 1
  }
)

const faviconRef = props.node.url ? getFaviconURL(props.node.url) : ref('')

// 右键菜单相关
const openedMenuCloseFn = inject<Ref<(() => void) | null>>('bookmarkOpenedMenuCloseFn')
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
  if (isHasTouchDevice.value && isTouchEvent(event)) {
    handleContextmenu(event)
  }
})

function openInNewTab() {
  if (!props.node.url) return
  open(props.node.url, '_blank')
}

function openInNewWindow() {
  if (!props.node.url) return
  browser.windows.create({ url: props.node.url })
}

function copyLink() {
  if (!props.node.url) return
  navigator.clipboard.writeText(props.node.url)
}

async function addToShortcut() {
  if (!props.node.url) return
  shortcutStore.items.push({
    url: props.node.url,
    title: props.node.title || '',
    favicon: faviconRef.value
  })
  await saveShortcut(shortcutStore.$state)
  ElMessage.success(t('bookmarkSidebar.addedToShortcut'))
}

// 注入共享的 activeMap（按深度索引），用于跨层级控制折叠展开
const activeMap = inject('bookmarkActiveMap') as Ref<Record<number, string | string[]>> | undefined

// 本层嵌套 collapse 对应的深度键（children 的深度）
const childDepthKey = props.depth + 1

const model = computed({
  get: () => activeMap?.value?.[childDepthKey] ?? '',
  set: (v: string | string[]) => {
    if (!activeMap) return
    const prev = activeMap.value || {}
    activeMap.value = {
      ...prev,
      [childDepthKey]: v
    }
  }
})

// 懒加载优化：判断当前节点是否展开
const isExpanded = computed(() => {
  const active = activeMap?.value?.[props.depth]
  if (Array.isArray(active)) {
    return active.includes(props.node.id)
  }
  return active === props.node.id
})

const hasBeenExpanded = ref(false)

watch(
  isExpanded,
  (val) => {
    if (val) {
      hasBeenExpanded.value = true
    }
  },
  { immediate: true }
)

const shouldRenderChildren = computed(() => hasBeenExpanded.value || isExpanded.value)
</script>

<template>
  <el-collapse-item v-if="node.children" :name="node.id" :style="{ '--depth': `${depth * 20}px` }">
    <template #title>
      <el-icon color="var(--el-color-primary)"><folder-open-round /></el-icon>
      <span>{{ node.title || '(未命名)' }}</span>
    </template>
    <template v-if="shouldRenderChildren">
      <el-collapse v-model="model" expand-icon-position="left" accordion v-if="node.children">
        <bookmark-item
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :depth="depth + 1"
        />
      </el-collapse>
    </template>
  </el-collapse-item>
  <a
    v-else
    ref="itemRef"
    class="bookmark-link-item"
    :href="node.url"
    :style="{ paddingLeft: `${(depth + 1) * 20}px` }"
    @contextmenu="handleContextmenu"
  >
    <img :src="faviconRef" />
    <el-text line-clamp="2">
      {{ node.title }}
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
            transparentOff: settings.perf.disableBookmarkTransparent,
            blurOff: settings.perf.disableBookmarkBlur
          },
          'bookmark__menu-popper'
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
          <el-dropdown-item @click="openInNewWindow">
            <el-icon>
              <open-in-new-round />
            </el-icon>
            <span>{{ t('settings:common.openInNewWindow') }}</span>
          </el-dropdown-item>
          <el-dropdown-item @click="copyLink">
            <el-icon>
              <content-copy-round />
            </el-icon>
            <span>{{ t('settings:common.copyLink') }}</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click="addToShortcut">
            <el-icon>
              <pin16-regular />
            </el-icon>
            <span>{{ t('bookmarkSidebar.addToShortcut') }}</span>
          </el-dropdown-item>
          <el-dropdown-item divided>
            <el-icon>
              <dismiss16-regular />
            </el-icon>
            <span>{{ t('common.cancel') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </a>
</template>
