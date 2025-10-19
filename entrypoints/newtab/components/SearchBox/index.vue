<script lang="ts" setup>
import {
  onClickOutside,
  useActiveElement,
  useElementSize,
  useTimeoutFn,
  useWindowFocus
} from '@vueuse/core'

import { Search } from '@vicons/fa'

import { getPerfClasses } from '@/shared/composables/perfClasses'
import { BgType, useSettingsStore } from '@/shared/settings'

import { useSearchHistoryCache } from '@newtab/composables/useSearchHistoryCache'
import { searchEngines } from '@newtab/scripts/api/search'
import { useFocusStore } from '@newtab/scripts/store'

import SearchEngineMenu from './components/SearchEngineMenu.vue'
import SearchSuggestionArea from './components/SearchSuggestionArea.vue'

const searchBox = ref<HTMLDivElement>()
const searchForm = ref<HTMLFormElement>()
const searchInput = ref<HTMLInputElement>()
const suggedtionArea = ref<InstanceType<typeof SearchSuggestionArea>>()
const searchEngineMenuRef = ref<typeof SearchEngineMenu>()

const searchText = ref('')
const originSearchText = ref<string | null>(null)
const mounted = ref(false)
const isComposing = ref(false) // 跟踪输入法组合输入状态

const focusStore = useFocusStore()
const settings = useSettingsStore()
const isWindowFocused = useWindowFocus()
const activeElement = useActiveElement()
const { addHistory, ensureLoaded: ensureHistoryLoaded } = useSearchHistoryCache()

const { width: searchFormWidth } = useElementSize(searchForm)

const formClasses = computed(() => [
  {
    'search-box__form--shadow': settings.search.enableShadow,
    'search-box__form--dark': settings.background.bgType === BgType.None,
    'search-box__form--expand': settings.search.alwaysExpandSearchBar
  },
  getPerfClasses(
    {
      transparentOff: settings.perf.disableSearchBarTransparent,
      blurOff: settings.perf.disableSearchBarBlur
    },
    'search-box__form'
  )
])

const searchPlaceholder = computed(() =>
  focusStore.isFocused ? undefined : settings.search.placeholder
)

function resetSearch() {
  searchText.value = ''
  originSearchText.value = ''
  suggedtionArea.value?.clearSearchSuggestions()
  searchForm.value?.classList.remove('search-box__form--focus')
  focusStore.blur()
}

watch(isWindowFocused, (isFocused) => {
  if (searchText.value.length > 0 || isFocused) {
    return
  }
  resetSearch()
  searchInput.value?.blur()
})

onClickOutside(searchBox, (e) => {
  if (!focusStore.isFocused) {
    return
  }

  if (activeElement.value?.classList.contains('search-engine-menu')) {
    searchEngineMenuRef.value?.hide()
    useTimeoutFn(() => searchInput.value?.focus(), 10)
    return
  }

  const target = e.target as HTMLElement
  if (target.classList.contains('yiyan__main')) {
    return
  }
  resetSearch()
})

function handleFocus() {
  searchForm.value?.classList.add('search-box__form--focus')
  suggedtionArea.value?.showSearchHistories()
  focusStore.focus()
}

// 处理输入法组合输入开始
function handleCompositionStart() {
  isComposing.value = true
}

// 处理输入法组合输入结束(文字上屏)
function handleCompositionEnd() {
  isComposing.value = false
  // 输入法上屏后,触发搜索建议
  handleInput()
}

// 处理输入事件
function handleInput() {
  // 如果正在组合输入中(拼音未上屏),不触发搜索
  if (isComposing.value) {
    return
  }
  suggedtionArea.value?.handleInput()
}

function navigateSuggestions(direction: number) {
  const suggestionsLength = suggedtionArea.value!.searchSuggestions.length
  if (suggestionsLength <= 0) {
    return
  }
  const _current = suggedtionArea.value!.currentActiveSuggest
  suggedtionArea.value!.clearActiveSuggest()

  if (originSearchText.value === null) {
    originSearchText.value = searchText.value
  }

  if (_current === null) {
    activeOneSuggest(direction > 0 ? direction - 1 : suggestionsLength + direction)
  } else {
    const newIndex = _current + direction
    if (newIndex < 0 || newIndex >= suggestionsLength) {
      searchText.value = originSearchText.value || ''
      originSearchText.value = ''
      suggedtionArea.value!.currentActiveSuggest = null
    } else {
      activeOneSuggest(newIndex)
    }
  }
}

function handleUp() {
  navigateSuggestions(-1)
}

function handleDown() {
  navigateSuggestions(1)
}

function activeOneSuggest(index: number) {
  const suggestions = suggedtionArea.value!.searchSuggestionArea?.children
  if (!suggestions) {
    return
  }
  suggestions[index]?.classList.add('active')
  suggedtionArea.value!.currentActiveSuggest = index
  searchText.value = suggedtionArea.value!.searchSuggestions[index]!
}

function handleTabNavigation(direction: 1 | -1) {
  const currentKey = settings.search.selectedSearchEngine
  const searchEngineKeys = Object.keys(searchEngines) as (keyof typeof searchEngines)[]
  const currentIndex = searchEngineKeys.indexOf(currentKey)

  const newIndex = (currentIndex + direction + searchEngineKeys.length) % searchEngineKeys.length
  settings.search.selectedSearchEngine = searchEngineKeys[newIndex] as keyof typeof searchEngines
}

function handlePrevTab() {
  handleTabNavigation(-1)
}

function handleNextTab() {
  handleTabNavigation(1)
}

const saveSearchHistory = async (text: string) => {
  if (!settings.search.recordSearchHistory || !text) {
    return
  }
  await addHistory(text)
}

const doSearchWithText = async (text: string) => {
  if (text.length <= 0) {
    searchInput.value?.focus()
    return
  }

  await saveSearchHistory(text)

  window.open(
    searchEngines[settings.search.selectedSearchEngine].url.replace('%s', text),
    settings.search.searchInNewTab ? '_blank' : '_self'
  )
  suggedtionArea.value!.clearSearchSuggestions()
}

function doSearch() {
  doSearchWithText(searchText.value)
  searchText.value = ''
}

onMounted(() => {
  useTimeoutFn(() => (mounted.value = true), 100)
  void ensureHistoryLoaded()
})
</script>

<template>
  <section ref="searchBox" class="search-box">
    <form
      ref="searchForm"
      class="search-box__form"
      :class="formClasses"
      :style="{ '--width': mounted ? undefined : '0' }"
      @submit.prevent="doSearch"
    >
      <search-engine-menu ref="searchEngineMenuRef" />
      <input
        ref="searchInput"
        v-model="searchText"
        :placeholder="searchPlaceholder"
        class="search-box__input"
        @input="handleInput"
        @focus="handleFocus"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
        @keydown.up.prevent="handleUp"
        @keydown.down.prevent="handleDown"
        @keydown.tab.shift.prevent.exact="handlePrevTab"
        @keydown.tab.prevent.exact="handleNextTab"
      />
      <div class="search-box__btn" :style="{ opacity: focusStore.isFocused ? 1 : 0 }">
        <el-icon @click="doSearch"><search /></el-icon>
      </div>
    </form>
    <search-suggestion-area
      ref="suggedtionArea"
      :search-text="searchText"
      :origin-search-text="originSearchText"
      :search-form-width="searchFormWidth"
      @do-search-with-text="doSearchWithText"
    />
  </section>
</template>
