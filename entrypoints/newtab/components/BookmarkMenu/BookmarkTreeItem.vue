<script setup lang="ts">
import { Folder20Regular as Folder, Document20Regular as Document } from '@vicons/fluent'
import { KeyboardArrowRightRound as ArrowRight } from '@vicons/material'

import { isFolder, getNodeFavicon, type ChromeBookmarkNode } from '@/shared/chromeBookmarks'

interface Props {
  node: ChromeBookmarkNode
  level: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  closeMenu: []
}>()

const expanded = ref(false)
const isNodeFolder = computed(() => isFolder(props.node))

/**
 * 切换文件夹展开/折叠
 */
function toggleExpand() {
  if (isNodeFolder.value) {
    expanded.value = !expanded.value
  }
}

/**
 * 打开书签链接
 */
function openBookmark(url: string) {
  if (url) {
    window.open(url, '_blank')
    emit('closeMenu')
  }
}

/**
 * 处理点击事件
 */
function handleClick() {
  if (isNodeFolder.value) {
    toggleExpand()
  } else if (props.node.url) {
    openBookmark(props.node.url)
  }
}

/**
 * 获取缩进样式
 */
const indentStyle = computed(() => ({
  paddingLeft: `${props.level * 16 + 12}px`
}))

/**
 * 获取 favicon
 */
const favicon = computed(() => {
  if (isNodeFolder.value) {
    return null
  }
  return getNodeFavicon(props.node)
})
</script>

<template>
  <div class="bookmark-tree-item">
    <div
      class="bookmark-tree-item__row"
      :class="{ 'bookmark-tree-item__row--folder': isNodeFolder }"
      :style="indentStyle"
      @click="handleClick"
    >
      <!-- 文件夹展开/折叠箭头 -->
      <el-icon
        v-if="isNodeFolder"
        class="bookmark-tree-item__arrow"
        :class="{ 'bookmark-tree-item__arrow--expanded': expanded }"
      >
        <arrow-right />
      </el-icon>

      <!-- 图标 -->
      <el-icon v-if="isNodeFolder" class="bookmark-tree-item__icon bookmark-tree-item__icon--folder">
        <folder />
      </el-icon>
      <img
        v-else-if="favicon"
        :src="favicon"
        class="bookmark-tree-item__favicon"
        @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
      />
      <el-icon v-else class="bookmark-tree-item__icon">
        <document />
      </el-icon>

      <!-- 标题 -->
      <span class="bookmark-tree-item__title">{{ node.title || '(无标题)' }}</span>
    </div>

    <!-- 子节点 -->
    <transition name="expand">
      <div v-if="isNodeFolder && expanded && node.children" class="bookmark-tree-item__children">
        <bookmark-tree-item
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :level="level + 1"
          @close-menu="emit('closeMenu')"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.bookmark-tree-item {
  &__row {
    display: flex;
    align-items: center;
    padding-right: 12px;
    height: 32px;
    cursor: pointer;
    color: var(--el-text-color-primary);
    transition: background-color 0.2s;
    user-select: none;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &--folder {
      font-weight: 500;
    }
  }

  &__arrow {
    flex-shrink: 0;
    margin-right: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    transition: transform 0.2s;

    &--expanded {
      transform: rotate(90deg);
    }
  }

  &__icon {
    flex-shrink: 0;
    margin-right: 8px;
    font-size: 16px;
    color: var(--el-text-color-secondary);

    &--folder {
      color: var(--el-color-warning);
    }
  }

  &__favicon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    margin-right: 8px;
    object-fit: contain;
  }

  &__title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
  }

  &__children {
    overflow: hidden;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 2000px;
  opacity: 1;
}
</style>
