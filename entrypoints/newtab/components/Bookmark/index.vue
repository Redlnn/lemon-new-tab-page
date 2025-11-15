<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { useDialog } from '@newtab/composables/useDialog'

import { useBookmarkStore } from './bookmarks'
import BookmarkItem from './components/BookmarkItem.vue'

const { opened, show, hide, toggle } = useDialog()
defineExpose({ show, hide, toggle })

const { t } = useTranslation()

const store = useBookmarkStore()
onMounted(() => {
  if (!store.loaded) {
    store.loadBookmarks()
  }
})
</script>

<template>
  <el-drawer
    v-model="opened"
    direction="rtl"
    :title="t('bookmark')"
    class="bookmark"
    append-to-body
    resizable
    lock-scroll
    close-on-click-modal
    close-on-press-escape
    destroy-on-close
  >
    <el-collapse expand-icon-position="left" accordion>
      <bookmark-item v-for="item in store.sortedTree" :key="item.id" :node="item" />
    </el-collapse>
  </el-drawer>
</template>

<style lang="scss">
.bookmark {
  min-width: 400px;
}

@media (width <= 600px) {
  .bookmark {
    min-width: 100%;
  }
}

.bookmark .el-drawer__body {
  padding: 0;
}

.bookmark .el-collapse {
  --el-collapse-border-color: transparent;
  --el-collapse-header-height: 40px;

  .el-collapse-item__header {
    padding-right: 20px;
    padding-left: var(--depth);
  }

  .el-collapse-item__header:hover {
    background-color: var(--el-color-primary-light-8);
  }

  .el-collapse-item__title {
    display: flex;
    align-items: center;

    .el-icon {
      margin-right: 10px;
    }
  }

  .el-collapse-item__content {
    padding-bottom: 0;
  }
}

.bookmark-link-item {
  display: flex;
  gap: 10px;
  align-items: center;
  height: var(--el-collapse-header-height);
  padding-right: 20px;
  color: inherit;
  text-decoration: none;

  &:hover {
    background-color: var(--el-color-primary-light-8);
  }

  img {
    height: 1em;
    border-radius: 3px;
  }

  .el-text {
    font-size: inherit;
    line-height: 1.2em;
    color: inherit;
  }
}
</style>
