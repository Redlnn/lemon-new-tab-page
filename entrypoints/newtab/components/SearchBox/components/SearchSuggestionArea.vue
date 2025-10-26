<script setup lang="ts">
import { TrashAlt } from '@vicons/fa'
import { useTranslation } from 'i18next-vue'

import { BgType, useSettingsStore } from '@/shared/settings'

import { getPerfClasses } from '@newtab/composables/perfClasses'
import { useSearchHistoryCache } from '@newtab/composables/useSearchHistoryCache'
import { searchSuggestAPIs } from '@newtab/scripts/api/search'
import { searchSuggestCache } from '@newtab/scripts/api/search/suggestCache'
import { createSuggestRunner } from '@newtab/scripts/api/search/suggestRunner'
import { useFocusStore } from '@newtab/scripts/store'

import SuggestListItem from './SuggestListItem.vue'

const { t } = useTranslation()

const focusStore = useFocusStore()
const settings = useSettingsStore()
const {
  histories: cachedHistories,
  ensureLoaded: ensureHistoryLoaded,
  clearHistories: clearHistoryCache
} = useSearchHistoryCache()

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

const areaClasses = computed(() => [
  {
    'search-suggestion-area--shadow': settings.search.enableShadow,
    'search-suggestion-area--dark':
      settings.background.bgType === BgType.None && searchSuggestions.value.length > 0
  },
  getPerfClasses(
    {
      transparentOff: settings.perf.disableSearchBarTransparent,
      blurOff: settings.perf.disableSearchBarBlur
    },
    'search-suggestion-area'
  )
])

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
    runner.cancel()
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

  await ensureHistoryLoaded()
  const searchHistories = cachedHistories.value
  if (searchHistories.length > 0) {
    searchSuggestions.value = searchHistories.slice()
    isShowSearchHistories.value = true
  }
}

// 统一“请求 + 取消 + 防抖 + 重试”（重试统一在运行器层）
const runner = createSuggestRunner({ debounceMs: 300, maxRetries: 2, retryDelay: 100 })
runner.onResult((list) => {
  searchSuggestions.value = list
  // 缓存搜索建议结果
  if (props.searchText && list.length > 0) {
    searchSuggestCache.set(props.searchText, list)
  }
})
runner.onError((err) => {
  console.error('Failed to fetch search suggestions:', err)
  searchSuggestions.value = []
})

function showSuggestionsDebounced() {
  // 至少2个字符才触发搜索建议
  if (props.searchText.length < 2) {
    return
  }

  // 先检查缓存，命中则直接返回
  const cached = searchSuggestCache.get(props.searchText)
  if (cached) {
    searchSuggestions.value = cached
    return
  }

  const api = searchSuggestAPIs[settings.search.selectedSearchSuggestionAPI]
  if (!api) {
    console.error('Selected search suggestion API not found')
    return
  }
  runner.run(props.searchText, api.parser)
}

onUnmounted(() => {
  runner.cancel()
})

function clearActiveSuggest() {
  currentActiveSuggest.value = null
}

function hideSearchHistories() {
  isShowSearchHistories.value = false
}

function clearSearchSuggestions() {
  hideSearchHistories()
  currentActiveSuggest.value = null
  searchSuggestions.value = []
}

async function clearSearchHistories() {
  await clearHistoryCache()
  clearSearchSuggestions()
}

watch(
  () => cachedHistories.value,
  (list) => {
    if (isShowSearchHistories.value) {
      searchSuggestions.value = list.slice()
    }
  }
)

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
    <suggest-list-item
      v-for="(item, index) in displayedSuggestions"
      :key="index"
      :text="item"
      :active="currentActiveSuggest === index"
      @click="emit('doSearchWithText', item)"
      @hover="currentActiveSuggest = index"
      @leave="currentActiveSuggest = currentActiveSuggest === index ? null : currentActiveSuggest"
    />
    <div
      v-show="isShowSearchHistories"
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
@use '@newtab/styles/mixins/acrylic.scss' as acrylic;

.search-suggestion-area {
  --cubic-bezier: cubic-bezier(0.65, 0.05, 0.1, 1);

  position: absolute;
  top: 60px;
  z-index: 1000;
  overflow: hidden;
  font-size: var(--el-font-size-small);
  background-color: var(--el-fill-color-darker);

  html.colorful &:not(.search-suggestion-area--opacity) {
    background-color: var(--el-color-primary-light-9);
  }

  &.search-suggestion-area--opacity {
    background-color: var(--le-bg-color-overlay-opacity-50);
  }

  &.search-suggestion-area--blur {
    @include acrylic.acrylic(30px);
  }
  border-radius: 15px;
  transition:
    height 0.1s var(--cubic-bezier),
    background-color var(--el-transition-duration-fast) ease,
    border var(--el-transition-duration-fast) ease,
    box-shadow var(--el-transition-duration-fast) ease;

  &--shadow {
    box-shadow: var(--el-box-shadow-light);
  }

  html:not(.colorful) &--dark {
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
      background-color: var(--le-bg-color-overlay-opacity-60);
    }
  }

  &__clear-history {
    display: flex;
    align-items: center;
    font-size: var(--el-font-size-extra-small);
    color: var(--el-text-color-regular);
    background-color: transparent;
    transition:
      padding var(--el-transition-duration-fast) var(--cubic-bezier),
      padding-left var(--el-transition-duration-fast) var(--cubic-bezier),
      color var(--el-transition-duration-fast) ease;

    &:hover {
      padding-left: 30px;
      background-color: var(--le-bg-color-overlay-opacity-60);
    }
  }
}
</style>
