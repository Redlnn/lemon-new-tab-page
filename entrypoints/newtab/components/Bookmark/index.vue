<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'

import { SearchRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

import { getPerfClasses } from '@newtab/composables/perfClasses'
import { useDialog } from '@newtab/composables/useDialog'

import { SortMode, useBookmarkStore } from './bookmarks'
import BookmarkItem from './components/BookmarkItem.vue'

const { opened, show, hide, toggle } = useDialog()
defineExpose({ show, hide, toggle })

const { t } = useTranslation()
const settings = useSettingsStore()

const store = useBookmarkStore()
onMounted(() => {
  if (!store.loaded) {
    store.loadBookmarks()
  }
})

const isComposing = ref(false)
const searchQuery = ref('')

function handleCompositionStart() {
  isComposing.value = true
}

function handleCompositionEnd() {
  isComposing.value = false
  // 输入法上屏后,触发搜索建议
  handleInput()
}

const updateStoreDebounced = useDebounceFn(() => {
  store.searchQuery = searchQuery.value
  store.updateFilteredResult()
}, 200)

function handleInput() {
  if (isComposing.value) {
    return
  }
  updateStoreDebounced()
}

const sortMode = ref('')
const sortOptions = [
  {
    value: '',
    labelKey: 'bookmarkSidebar.sortMode.origin',
    click: () => store.setSortMode(SortMode.Original)
  },
  {
    value: 'nameAsc',
    labelKey: 'bookmarkSidebar.sortMode.nameAsc',
    click: () => store.setSortMode(SortMode.NameAsc)
  },
  {
    value: 'nameDesc',
    labelKey: 'bookmarkSidebar.sortMode.nameDesc',
    click: () => store.setSortMode(SortMode.NameDesc)
  },
  {
    value: 'createdAsc',
    labelKey: 'bookmarkSidebar.sortMode.createdAsc',
    click: () => store.setSortMode(SortMode.CreatedDesc)
  },
  {
    value: 'createdDesc',
    labelKey: 'bookmarkSidebar.sortMode.createdDesc',
    click: () => store.setSortMode(SortMode.CreatedAsc)
  }
]

// 控制不同深度层级的激活值（按深度索引），避免父子 collapse 共享同一数组导致冲突
const activeMap = ref<Record<number, string | string[]>>({})
provide('bookmarkActiveMap', activeMap)

// 顶层 collapse 对应深度为 1，暴露一个 computed 以绑定到 v-model
const topModel = computed({
  get: () => activeMap.value[1] ?? '',
  set: (v: string | string[]) => {
    activeMap.value[1] = v
  }
})

watch(
  () => store.firstMatchPath,
  (path) => {
    const q = (store.searchQuery || '').trim()
    if (!q) {
      return
    }

    activeMap.value = {}
    if (path && path.length > 0) {
      path.forEach((id, i) => {
        // 深度索引从 1 开始
        activeMap.value[i + 1] = id
      })
    }
  },
  { immediate: true }
)
</script>

<template>
  <el-drawer
    v-model="opened"
    :direction="settings.bookmarkSidebar.direction"
    :title="t('bookmarkSidebar.title')"
    class="noselect"
    :class="[
      getPerfClasses(
        {
          transparentOff: settings.perf.disableBookmarkTransparent,
          blurOff: settings.perf.disableBookmarkBlur
        },
        'bookmark'
      )
    ]"
    append-to-body
    resizable
    lock-scroll
    close-on-click-modal
    close-on-press-escape
    destroy-on-close
  >
    <div class="bookmark-search" style="padding: 0 20px 10px">
      <el-input
        v-model="searchQuery"
        :prefix-icon="SearchRound"
        :empty-values="[null, undefined]"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
        @input="handleInput"
      />
      <el-select v-model="sortMode" :placeholder="t('bookmarkSidebar.sortBy')">
        <el-option
          v-for="(item, index) in sortOptions"
          :key="index"
          :label="t(item.labelKey)"
          :value="item.value"
          @click="item.click"
        />
      </el-select>
    </div>
    <template v-if="store.filteredResult.length > 0">
      <el-scrollbar style="height: calc(100% - 42px)">
        <el-collapse v-model="topModel" expand-icon-position="left" accordion>
          <bookmark-item v-for="item in store.filteredResult" :key="item.id" :node="item" />
        </el-collapse>
      </el-scrollbar>
    </template>
    <template v-else>
      <div class="bookmark-404">
        <div class="bookmark-404--icon">🧐</div>
        <code class="bookmark-404--title">404</code>
        <div class="bookmark-404--desc">{{ t('bookmarkSidebar.404') }}</div>
      </div>
    </template>
  </el-drawer>
</template>

<style lang="scss">
@use '@newtab/styles/mixins/acrylic.scss' as acrylic;

.bookmark {
  min-width: 400px;

  &--opacity.el-drawer {
    background-color: var(--le-bg-color-overlay-opacity-15);
  }

  html.colorful &:not(.bookmark--opacity) {
    background-color: var(--el-color-primary-light-9);
  }

  &--blur.el-drawer {
    @include acrylic.acrylic;
  }

  .el-drawer__body {
    padding: 0;
  }

  .el-drawer__title {
    font-weight: bold;
  }
}

@media (width <= 600px) {
  .bookmark {
    min-width: 100%;
  }
}

.bookmark-search {
  display: flex;
  gap: 5px;

  .el-select {
    flex-shrink: 0;
    width: 150px;
  }
}

.bookmark-404 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: max(50%, 134px);

  &--icon {
    font-size: 80px;
    line-height: 1em;
  }

  &--title {
    font-size: 40px;
    line-height: 1em;
  }

  &--desc {
    line-height: 1em;
  }
}

.bookmark .el-collapse {
  --el-collapse-border-color: transparent;
  --el-collapse-header-bg-color: transparent;
  --el-collapse-content-bg-color: transparent;
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
