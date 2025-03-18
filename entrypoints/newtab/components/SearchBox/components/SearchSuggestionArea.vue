<script setup lang="ts">
import { TrashAlt } from '@vicons/fa'
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'

import { i18n } from '@/.wxt/i18n'
import { searchHistoriesStorage } from '@/newtab/scripts/storages/searchStorages'
import { searchSuggestAPIs } from '@/newtab/scripts/api/search'
import { useFocusStore, useSettingsStore } from '@/newtab/scripts/store'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()

const clearSearchHistory = ref<HTMLDivElement>()
const isShowSearchHistories = ref(false)
const currentActiveSuggest = ref<null | number>(null)
const searchSuggestionArea = ref<HTMLDivElement>()

const searchSuggestions = ref<string[]>([])

const props = defineProps<{ searchText: string; searchFormWidth: number }>()
const emit = defineEmits<(e: 'doSearchWithText', text: string) => Promise<void>>()

function handleInput() {
  if (focusStore.isFocused && !props.searchText) {
    // 如果搜索词为空，则显示搜索历史
    clearSearchSuggestions()
    showSearchHistories()
  } else {
    hideSearchHistories()
    showSuggestionsDebounced()
  }
}

async function showSearchHistories() {
  if (searchSuggestions.value.length > 0 && !isShowSearchHistories.value) return
  const searchHistories: string[] = await searchHistoriesStorage.getValue()
  if (searchHistories.length > 0 && clearSearchHistory.value) {
    searchSuggestions.value = searchHistories
    isShowSearchHistories.value = true
    clearSearchHistory.value.style.display = 'flex'
  }
}

const showSuggestionsDebounced = useDebounceFn(showSuggestions, 200)

async function showSuggestions() {
  if (props.searchText.length <= 0) return
  const suggestions = await searchSuggestAPIs[
    settingsStore.search.selectedSearchSuggestionAPI
  ].parser(props.searchText)
  searchSuggestions.value = suggestions
}
function clearActiveSuggest() {
  const suggestions = searchSuggestionArea.value?.children
  if (!suggestions) return
  for (const suggestion of suggestions) {
    suggestion.classList.remove('active')
  }
  currentActiveSuggest.value = null
}
function hideSearchHistories() {
  if (!clearSearchHistory.value) return
  clearSearchHistory.value.style.display = 'none'
  isShowSearchHistories.value = false
}

function clearSearchSuggestions() {
  hideSearchHistories()
  currentActiveSuggest.value = null
  searchSuggestions.value = []
}

async function clearSearchHistories() {
  await searchHistoriesStorage.setValue([])
  clearSearchSuggestions()
}

function getSearchSuggestionAreaHeight() {
  const length = searchSuggestions.value.length
  if (length > 0) {
    if (length > 10) {
      return isShowSearchHistories.value ? '363px' : '330px'
    } else {
      return isShowSearchHistories.value ? `${(length + 1) * 33}px` : `${length * 33}px`
    }
  } else {
    return '0'
  }
}

defineExpose({
  clearSearchSuggestions,
  hideSearchHistories,
  clearActiveSuggest,
  showSuggestionsDebounced,
  showSearchHistories,
  handleInput,
  clearSearchHistory,
  currentActiveSuggest,
  searchSuggestions,
  isShowSearchHistories,
  searchSuggestionArea
})
</script>

<template>
  <div
    ref="searchSuggestionArea"
    class="search-suggestion-area"
    :class="[
      settingsStore.search.enableShadow ? 'shadow' : undefined,
      settingsStore.background.bgType === 0 && searchSuggestions.length > 0 ? 'dark' : undefined
    ]"
    :style="{
      width: `${searchFormWidth}px`,
      height: getSearchSuggestionAreaHeight()
    }"
  >
    <div
      v-for="(item, index) in searchSuggestions.length > 10
        ? searchSuggestions.slice(0, 10)
        : searchSuggestions"
      :key="index"
      class="search-suggestion-item noselect"
      :class="{ active: currentActiveSuggest === index }"
      @click="emit('doSearchWithText', item)"
      @mouseover="
        (e) => {
          ;(e.target as HTMLDivElement | null)?.classList.add('active')
          currentActiveSuggest = index
        }
      "
      @mouseout="(e) => (e.target as HTMLDivElement | null)?.classList.remove('active')"
    >
      {{ item }}
    </div>
    <div
      ref="clearSearchHistory"
      class="search-suggestion-item clear-search-history noselect"
      style="display: none"
      @click="clearSearchHistories()"
    >
      <el-icon style="margin-right: 5px"><trash-alt /></el-icon>
      <span>{{ i18n.t('newtab.search.purgeSearchHistory') }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-suggestion-area {
  position: absolute;
  top: 60px;
  border-radius: 15px;
  overflow: hidden;
  font-size: 13px;
  z-index: 1000;
  background-color: color-mix(in oklab, var(--el-fill-color), transparent 50%);
  backdrop-filter: blur(30px) saturate(1.2);
  transition:
    height 0.1s var(--cubic-bezier),
    background-color var(--el-transition-duration-fast) ease,
    border var(--el-transition-duration-fast) ease,
    box-shadow var(--el-transition-duration-fast) ease;

  &.shadow {
    box-shadow: var(--el-box-shadow-light);
  }

  &.dark {
    background-color: var(--el-fill-color-blank);
    border: solid 1px var(--el-border-color-light);
  }

  .search-suggestion-item {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    overflow: hidden;
    height: 33px;
    padding: 0 20px;
    line-height: 33px;
    cursor: pointer;
    color: var(--el-text-color-primary);
    background-color: transparent;
    transition:
      padding var(--el-transition-duration-fast) var(--cubic-bezier),
      padding-left var(--el-transition-duration-fast) var(--cubic-bezier),
      color var(--el-transition-duration-fast) ease;

    &.active {
      background-color: color-mix(in oklab, var(--el-fill-color), transparent 60%);
      padding-left: 30px;
    }
  }

  .clear-search-history {
    font-size: 12px;
    color: color-mix(in oklab, var(--el-text-color-primary), transparent 20%);
    display: flex;
    align-items: center;
    background-color: transparent;
    transition: color var(--el-transition-duration-fast) ease;

    &:hover {
      background-color: color-mix(in oklab, var(--el-fill-color), transparent 60%);
      padding-left: 30px;
    }
  }
}
</style>
