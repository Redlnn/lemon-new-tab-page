<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'

import { TrashAlt } from '@vicons/fa'
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

import { searchSuggestAPIs } from '@newtab/scripts/api/search'
import { searchHistoriesStorage } from '@newtab/scripts/storages/searchStorages'
import { useFocusStore } from '@newtab/scripts/store'

const { t } = useTranslation()

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()

const clearSearchHistory = ref<HTMLDivElement>()
const isShowSearchHistories = ref(false)
const currentActiveSuggest = ref<null | number>(null)
const searchSuggestionArea = ref<HTMLDivElement>()
const searchSuggestions = ref<string[]>([])

const props = defineProps<{
  searchText: string
  searchFormWidth: number
}>()

const emit = defineEmits<{
  doSearchWithText: [text: string]
}>()

const areaClasses = computed(() => ({
  'search-suggestion-area--shadow': settingsStore.search.enableShadow,
  'search-suggestion-area--dark':
    settingsStore.background.bgType === 0 && searchSuggestions.value.length > 0
}))

const areaHeight = computed(() => {
  const length = searchSuggestions.value.length
  if (length === 0) {
    return '0'
  }
  if (length > 10) {
    return isShowSearchHistories.value ? '363px' : '330px'
  }
  return isShowSearchHistories.value ? `${(length + 1) * 33}px` : `${length * 33}px`
})

const displayedSuggestions = computed(() =>
  searchSuggestions.value.length > 10
    ? searchSuggestions.value.slice(0, 10)
    : searchSuggestions.value
)

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
  if (searchSuggestions.value.length > 0 && !isShowSearchHistories.value) {
    return
  }

  const searchHistories = await searchHistoriesStorage.getValue()
  if (searchHistories.length > 0 && clearSearchHistory.value) {
    searchSuggestions.value = searchHistories
    isShowSearchHistories.value = true
    clearSearchHistory.value.style.display = 'flex'
  }
}

const showSuggestionsDebounced = useDebounceFn(async () => {
  if (props.searchText.length <= 0) {
    return
  }

  const api = searchSuggestAPIs[settingsStore.search.selectedSearchSuggestionAPI]
  if (!api) {
    console.error('Selected search suggestion API not found')
    return
  }

  try {
    const suggestions = await api.parser(props.searchText)
    searchSuggestions.value = suggestions
  } catch (error) {
    console.error('Failed to fetch search suggestions:', error)
    searchSuggestions.value = []
  }
}, 200)

function clearActiveSuggest() {
  const suggestions = searchSuggestionArea.value?.children
  if (!suggestions) {
    return
  }

  for (const suggestion of suggestions) {
    suggestion.classList.remove('active')
  }
  currentActiveSuggest.value = null
}

function hideSearchHistories() {
  if (!clearSearchHistory.value) {
    return
  }
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
    :class="areaClasses"
    :style="{
      width: `${searchFormWidth}px`,
      height: areaHeight
    }"
  >
    <div
      v-for="(item, index) in displayedSuggestions"
      :key="index"
      class="search-suggestion-area__item noselect"
      :class="{ 'search-suggestion-area__item--active': currentActiveSuggest === index }"
      @click="emit('doSearchWithText', item)"
      @mouseover="
        (e) => {
          ;(e.target as HTMLDivElement).classList.add('search-suggestion-area__item--active')
          currentActiveSuggest = index
        }
      "
      @mouseout="
        (e) => (e.target as HTMLDivElement).classList.remove('search-suggestion-area__item--active')
      "
    >
      {{ item }}
    </div>
    <div
      ref="clearSearchHistory"
      class="search-suggestion-area__item search-suggestion-area__clear-history noselect"
      style="display: none"
      @click="clearSearchHistories()"
    >
      <el-icon style="margin-right: 5px"><trash-alt /></el-icon>
      <span>{{ t('newtab:search.purgeSearchHistory') }}</span>
    </div>
  </div>
</template>

<style lang="scss">
.search-suggestion-area {
  --cubic-bezier: cubic-bezier(0.65, 0.05, 0.1, 1);

  position: absolute;
  top: 60px;
  z-index: 1000;
  overflow: hidden;
  font-size: var(--el-font-size-small);
  background-color: color-mix(in srgb, var(--el-fill-color), transparent 50%);
  border-radius: 15px;
  backdrop-filter: blur(30px) saturate(1.4) brightness(1.1);
  transition:
    height 0.1s var(--cubic-bezier),
    background-color var(--el-transition-duration-fast) ease,
    border var(--el-transition-duration-fast) ease,
    box-shadow var(--el-transition-duration-fast) ease;

  &--shadow {
    box-shadow: var(--el-box-shadow-light);
  }

  &--dark {
    background-color: var(--el-fill-color-blank);
    border: solid 1px var(--el-border-color-light);
  }

  &__item {
    display: -webkit-box;
    align-items: center;
    height: 33px;
    padding: 0 20px;
    overflow: hidden;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    line-height: 33px;
    color: var(--el-text-color-primary);
    cursor: pointer;
    background-color: transparent;
    transition:
      padding var(--el-transition-duration-fast) var(--cubic-bezier),
      padding-left var(--el-transition-duration-fast) var(--cubic-bezier),
      color var(--el-transition-duration-fast) ease;

    &--active {
      padding-left: 30px;
      background-color: color-mix(in srgb, var(--el-fill-color), transparent 60%);
    }
  }

  &__clear-history {
    display: flex;
    align-items: center;
    font-size: var(--el-font-size-extra-small);
    color: color-mix(in srgb, var(--el-text-color-primary), transparent 20%);
    background-color: transparent;
    transition:
      padding var(--el-transition-duration-fast) var(--cubic-bezier),
      padding-left var(--el-transition-duration-fast) var(--cubic-bezier),
      color var(--el-transition-duration-fast) ease;

    &:hover {
      padding-left: 30px;
      background-color: color-mix(in srgb, var(--el-fill-color), transparent 60%);
    }
  }
}
</style>
