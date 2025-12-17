<script setup lang="ts">
import { Dismiss16Regular, Pin16Regular } from '@vicons/fluent'
import { FolderOpenRound } from '@vicons/material'
import type { DropdownInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import type { Browser } from 'wxt/browser'

import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'
import { saveShortcut, useShortcutStore } from '@/shared/shortcut'

import { getPerfClasses } from '@newtab/composables/perfClasses'

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
          <el-dropdown-item @click="addToShortcut">
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
