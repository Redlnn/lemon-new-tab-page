<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  onClickOutside,
  useActiveElement,
  useElementSize,
  useTimeoutFn,
  useWindowFocus
} from '@vueuse/core'

import { Search } from '@vicons/fa'
import type { TooltipInstance } from 'element-plus'

import { useSettingsStore } from '@/shared/settings'

import { searchEngines } from '@newtab/scripts/api/search'
import { searchHistoriesStorage } from '@newtab/scripts/storages/searchStorages'
import { useFocusStore } from '@newtab/scripts/store'

import SearchEngineMenu from './components/SearchEngineMenu.vue'
import SearchSuggestionArea from './components/SearchSuggestionArea.vue'

const searchBox = ref<HTMLDivElement>()
const searchForm = ref<HTMLFormElement>()
const searchInput = ref<HTMLInputElement>()
const suggedtionArea = ref<InstanceType<typeof SearchSuggestionArea>>()
const searchEngineMenuRef = ref<TooltipInstance>()

const searchText = ref('')
const originSearchText = ref<string | null>(null)
const mounted = ref(false)

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const isWindowFocused = useWindowFocus()
const activeElement = useActiveElement()

const { width: searchFormWidth } = useElementSize(searchForm)

const formClasses = computed(() => {
  return {
    'search-box__form--shadow': settingsStore.search.enableShadow,
    'search-box__form--dark': settingsStore.background.bgType === 0
  }
})

const searchPlaceholder = computed(() =>
  focusStore.isFocused ? undefined : settingsStore.search.placeholder
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
  if (activeElement.value?.classList.contains('search-engine-menu')) {
    searchInput.value?.focus()
    searchEngineMenuRef.value?.hide()
    return
  }
  const target = e.target as HTMLElement
  if (!(target.localName == 'main' || target.classList.contains('shortcut-wrapper'))) {
    return
  }
  resetSearch()
})

function handleFocus() {
  searchForm.value?.classList.add('search-box__form--focus')
  suggedtionArea.value?.showSearchHistories()
  focusStore.focus()
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
  const currentKey = settingsStore.search.selectedSearchEngine
  const searchEngineKeys = Object.keys(searchEngines) as (keyof typeof searchEngines)[]
  const currentIndex = searchEngineKeys.indexOf(currentKey)

  const newIndex = (currentIndex + direction + searchEngineKeys.length) % searchEngineKeys.length
  settingsStore.search.selectedSearchEngine = searchEngineKeys[
    newIndex
  ] as keyof typeof searchEngines
}

function handlePrevTab() {
  handleTabNavigation(-1)
}

function handleNextTab() {
  handleTabNavigation(1)
}

const saveSearchHistory = async (text: string) => {
  if (!settingsStore.search.recordSearchHistory || !text) {
    return
  }
  // 判断当前搜索词是否在搜索历史里。如果在，则将其移动到最前面，如果不在，则将其添加到搜索历史
  const searchHistories = (await searchHistoriesStorage.getValue()).filter((t) => t !== text)
  searchHistories.unshift(text)
  // 如果历史搜索词大于15个，则删除最后几个只留下15个
  if (searchHistories.length > 15) {
    searchHistories.length = 15
  }
  await searchHistoriesStorage.setValue(searchHistories)
}

const doSearchWithText = async (text: string) => {
  if (text.length <= 0) {
    searchInput.value?.focus()
    return
  }

  await saveSearchHistory(text)

  window.open(
    searchEngines[settingsStore.search.selectedSearchEngine].url.replace('%s', text),
    settingsStore.search.searchInNewTab ? '_blank' : '_self'
  )
  suggedtionArea.value!.clearSearchSuggestions()
}

function doSearch() {
  doSearchWithText(searchText.value)
  searchText.value = ''
}

onMounted(() => {
  if (settingsStore.search.autoFocus) {
    handleFocus()
    searchInput.value?.focus()
  }
  useTimeoutFn(() => (mounted.value = true), 100)
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
      <search-engine-menu />
      <input
        ref="searchInput"
        v-model="searchText"
        :placeholder="searchPlaceholder"
        class="search-box__input"
        @input="suggedtionArea!.handleInput"
        @focus="handleFocus"
        @keydown.up.prevent="handleUp"
        @keydown.down.prevent="handleDown"
        @keydown.tab.shift.prevent.exact="handlePrevTab"
        @keydown.tab.prevent.exact="handleNextTab"
        :autofocus="settingsStore.search.autoFocus"
      />
      <div class="search-box__btn">
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
