<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { getBookmarkFolders, type ChromeBookmarkNode } from '@/shared/chromeBookmarks'
import { useSettingsStore } from '@/shared/settings'

import BookmarkTreeItem from './BookmarkTreeItem.vue'

const { t } = useTranslation()
const settings = useSettingsStore()

const visible = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const bookmarkTree = ref<ChromeBookmarkNode[]>([])
const loading = ref(false)

/**
 * 显示书签菜单
 */
async function show(event: MouseEvent) {
  if (!settings.bookmarkMenu.enable) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  // 设置菜单位置
  menuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }

  // 加载书签树
  if (bookmarkTree.value.length === 0) {
    loading.value = true
    bookmarkTree.value = await getBookmarkFolders()
    loading.value = false
  }

  visible.value = true
}

/**
 * 隐藏书签菜单
 */
function hide() {
  visible.value = false
}

/**
 * 点击外部区域关闭菜单
 */
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.bookmark-menu')) {
    hide()
  }
}

/**
 * 刷新书签树
 */
async function refresh() {
  loading.value = true
  bookmarkTree.value = await getBookmarkFolders()
  loading.value = false
}

// 监听点击事件，点击外部关闭菜单
watch(visible, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 暴露方法给父组件
defineExpose({
  show,
  hide,
  refresh
})
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="visible"
        class="bookmark-menu"
        :style="{
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`
        }"
      >
        <div class="bookmark-menu__header">
          <span class="bookmark-menu__title">{{ t('bookmarkMenu.title') }}</span>
          <el-icon class="bookmark-menu__close" @click="hide">
            <Close />
          </el-icon>
        </div>

        <div class="bookmark-menu__content">
          <div v-if="loading" class="bookmark-menu__loading">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>{{ t('common.loading') }}</span>
          </div>

          <div v-else-if="bookmarkTree.length === 0" class="bookmark-menu__empty">
            {{ t('bookmarkMenu.empty') }}
          </div>

          <div v-else class="bookmark-menu__tree">
            <bookmark-tree-item
              v-for="node in bookmarkTree"
              :key="node.id"
              :node="node"
              :level="0"
              @close-menu="hide"
            />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
.bookmark-menu {
  position: fixed;
  z-index: 9999;
  min-width: 280px;
  max-width: 400px;
  max-height: 600px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  backdrop-filter: blur(20px);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__close {
    cursor: pointer;
    font-size: 16px;
    color: var(--el-text-color-secondary);
    transition: color 0.3s;

    &:hover {
      color: var(--el-text-color-primary);
    }
  }

  &__content {
    max-height: 500px;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-fill-color-darker);
      border-radius: 3px;

      &:hover {
        background: var(--el-fill-color-dark);
      }
    }
  }

  &__loading,
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: var(--el-text-color-secondary);
    font-size: 14px;

    .el-icon {
      margin-bottom: 8px;
      font-size: 24px;
    }
  }

  &__tree {
    padding: 8px 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
