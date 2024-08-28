<script setup lang="ts">
import { TrashAlt } from '@vicons/fa'
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'

import { LocalExtensionStorage } from '@/entrypoints/newtab/js/storage'
import { searchSuggestAPIs } from '@/entrypoints/newtab/js/api/search'
import { useFocusStore, useSettingsStore } from '@/entrypoints/newtab/js/store'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()

const clearSearchHistory = ref<HTMLDivElement>()
const isShowSearchHistories = ref(false)
const currentActiveSuggest = ref<null | number>(null)
const searchSuggestionArea = ref<HTMLDivElement>()

const searchSuggestions = ref<string[]>([])

const props = defineProps<{ searchText: string; searchFormWidth: number }>()
const emit = defineEmits<{
  (e: 'doSearchWithText', text: string): Promise<void>
}>()

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
  const searchHistories: string[] = await LocalExtensionStorage.getItem<string[]>(
    'searchHistories',
    []
  )
  if (searchHistories.length > 0 && clearSearchHistory) {
    searchSuggestions.value = searchHistories
    isShowSearchHistories.value = true
    clearSearchHistory.value!.style.display = 'flex'
  }
}
const showSuggestionsDebounced = useDebounceFn(showSuggestions, 200)
async function showSuggestions() {
  if (props.searchText.length <= 0) return
  const suggestions = await searchSuggestAPIs[settingsStore.selectedSearchSuggestionAPI](
    props.searchText
  )
  searchSuggestions.value = suggestions
}
function clearActiveSuggest() {
  const suggestions = searchSuggestionArea.value?.children
  if (!suggestions) return
  for (let i = 0; i < suggestions.length; i++) {
    suggestions[i].classList.remove('active')
    currentActiveSuggest.value = null
  }
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
  await LocalExtensionStorage.setItem<string[]>('searchHistories', [])
  clearSearchSuggestions()
}

function getSearchSuggestionAreaHeight() {
  if (searchSuggestions.value.length > 0) {
    if (searchSuggestions.value.length > 10) {
      if (isShowSearchHistories.value) return '363px'
      else return '330px'
    } else {
      if (isShowSearchHistories.value) return `${(searchSuggestions.value.length + 1) * 33}px`
      else return `${searchSuggestions.value.length * 33}px`
    }
  } else return '0'
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
    class="search-suggestion-area"
    ref="searchSuggestionArea"
    :style="{
      width: `${searchFormWidth}px`,
      height: getSearchSuggestionAreaHeight()
    }"
  >
    <div
      class="search-suggestion-item noselect"
      v-for="(item, index) in searchSuggestions.length > 10
        ? searchSuggestions.slice(0, 10)
        : searchSuggestions"
      :class="{ active: currentActiveSuggest === index }"
      :key="index"
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
      class="search-suggestion-item clear-search-history noselect"
      ref="clearSearchHistory"
      style="display: none"
      @click="clearSearchHistories()"
    >
      <el-icon style="margin-right: 5px"><trash-alt /></el-icon>
      <span>清除历史记录</span>
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
  box-shadow: var(--el-box-shadow-light);
  transition: height 0.1s var(--cubic-bezier);

  .search-suggestion-item {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    height: 33px;
    padding: 0 20px;
    line-height: 33px;
    cursor: pointer;
    color: var(--el-text-color-primary);
    transition: all 0.2s var(--cubic-bezier);

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

    &:hover {
      background-color: color-mix(in oklab, var(--el-fill-color), transparent 60%);
      padding-left: 30px;
    }
  }
}
</style>
