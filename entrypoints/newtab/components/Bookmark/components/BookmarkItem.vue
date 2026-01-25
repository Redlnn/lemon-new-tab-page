<script setup lang="ts">
import { onLongPress } from '@vueuse/core'

import { Dismiss12Regular, Pin12Regular } from '@vicons/fluent'
import {
  ContentCopyRound,
  DeleteOutlineRound,
  DragIndicatorRound,
  EditOutlined,
  FolderOpenRound,
  OpenInNewRound
} from '@vicons/material'
import type { DropdownInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import { type DraggableEvent, VueDraggable } from 'vue-draggable-plus'
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
    isSearching?: boolean
    isSortedMode?: boolean
    disableDrag?: boolean
  }>(),
  {
    depth: 1,
    isSearching: false,
    isSortedMode: false,
    disableDrag: false
  }
)

const faviconRef = props.node.url ? getFaviconURL(props.node.url) : ref('')

const menuPopperClass = computed(() =>
  getPerfClasses(
    {
      transparentOff: settings.perf.disableBookmarkTransparent,
      blurOff: settings.perf.disableBookmarkBlur
    },
    'bookmark__menu-popper'
  )
)

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

function deleteBookmark() {
  if (props.node.children) {
    browser.bookmarks.removeTree(props.node.id)
  } else {
    browser.bookmarks.remove(props.node.id)
  }
  ElMessage.success(t('bookmarkSidebar.deleteSuccess', { title: props.node.title }))
}

// 创建子节点的本地可编辑副本（用于拖动）
const localChildren = computed({
  get: () => props.node.children || [],
  set: () => {}
})

// 嵌套拖拽完成的处理器
const handleNestedDragSort = async (event: DraggableEvent) => {
  try {
    // 获取拖拽源和目标的信息
    const oldIndex = event.oldIndex
    let newIndex = event.newIndex

    // 只有在索引改变时才更新
    if (oldIndex !== newIndex && oldIndex !== undefined && newIndex !== undefined) {
      const nodeId = event.item?.dataset?.nodeId // 需要在模板中设置
      if (!nodeId) return

      // 如果在同一个文件夹内，parentId 是 props.node.id
      // 如果跨文件夹，需要通过 event.to 获取目标容器找出 parentId
      let parentId = props.node.id

      // 检查是否跨越了文件夹（通过检查 event.to 元素）
      if (event.to !== event.from) {
        // 从目标容器往上找到对应的文件夹 node
        // parentId 需要从 event.to 的关联数据中获取
        parentId = event.to.dataset?.parentId || props.node.id
      }

      if (parentId === props.node.id) {
        // 同一文件夹内移动
        if (newIndex > oldIndex) {
          // 向后移动
          newIndex += 1
        }
      }

      // 调用浏览器 API 移动书签
      await browser.bookmarks.move(nodeId, {
        parentId,
        index: newIndex
      })
    }
  } catch (error) {
    console.error(t('bookmarkSidebar.moveError'), error)
    ElNotification.error({
      title: t('bookmarkSidebar.moveError'),
      message: (error as Error).message || 'Unknown error.'
    })
  }
}

// 判断是否应该禁用拖动：搜索中、使用非原始排序、顶层文件夹
const isDragDisabled = computed(() => {
  return props.disableDrag || props.isSearching || props.isSortedMode
})
</script>

<template>
  <el-collapse-item v-if="node.children" :name="node.id" :style="{ '--depth': `${depth * 20}px` }">
    <template #title>
      <el-icon color="var(--el-color-primary)"><folder-open-round /></el-icon>
      <span>{{ node.title || '(未命名)' }}</span>
      <div class="bookmark-drag-handle-container" v-if="!(depth === 1)">
        <el-icon v-if="!isDragDisabled" class="bookmark-drag-handle">
          <drag-indicator-round />
        </el-icon>
      </div>
    </template>
    <template v-if="shouldRenderChildren">
      <el-collapse
        v-model="model"
        expand-icon-position="left"
        accordion
        :class="{ 'bookmark-no-drag': isDragDisabled }"
      >
        <vue-draggable
          v-model="localChildren"
          :disabled="isDragDisabled"
          :data-parent-id="node.id"
          handle=".bookmark-drag-handle"
          :animation="200"
          group="g1"
          @end="handleNestedDragSort"
        >
          <bookmark-item
            v-for="child in localChildren"
            :key="child.id"
            :node="child"
            :depth="depth + 1"
            :is-searching="isSearching"
            :is-sorted-mode="isSortedMode"
            :disable-drag="isDragDisabled"
            :data-node-id="child.id"
            :data-node-indexx="child.index"
          />
        </vue-draggable>
      </el-collapse>
    </template>
  </el-collapse-item>
  <a
    v-else
    ref="itemRef"
    class="bookmark-link-item"
    :class="{ 'is-no-drag': isDragDisabled }"
    :href="node.url"
    @contextmenu="handleContextmenu"
  >
    <img :src="faviconRef" />
    <el-text line-clamp="2">
      {{ node.title }}
    </el-text>
    <div class="bookmark-drag-handle-container">
      <el-icon v-if="!isDragDisabled" class="bookmark-drag-handle">
        <drag-indicator-round />
      </el-icon>
    </div>
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
      :popper-class="menuPopperClass"
    >
      <template #dropdown>
        <el-dropdown-menu class="noselect">
          <el-dropdown-item :icon="OpenInNewRound" @click="openInNewTab">
            <span>{{ t('settings:common.openInNewTab') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :icon="OpenInNewRound" @click="openInNewWindow">
            <span>{{ t('settings:common.openInNewWindow') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :icon="ContentCopyRound" divided @click="copyLink">
            <span>{{ t('settings:common.copyLink') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :icon="Pin12Regular" @click="addToShortcut">
            <span>{{ t('bookmarkSidebar.addToShortcut') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :icon="DeleteOutlineRound" @click="deleteBookmark">
            <span>{{ t('common.delete') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :icon="Dismiss12Regular" divided>
            <span>{{ t('common.cancel') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </a>
</template>
