<script lang="ts" setup>
import { Search } from '@vicons/fa'
import type { TooltipInstance } from 'element-plus'
import {
  onClickOutside,
  useActiveElement,
  useElementSize,
  useTimeoutFn,
  useWindowFocus
} from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'

import { i18n } from '@/.wxt/i18n'
import { searchEngines } from '@/newtab/scripts/api/search'
import { searchHistoriesStorage } from '@/newtab/scripts/storages/searchStorages'
import { useFocusStore, useSettingsStore } from '@/newtab/scripts/store'

import SearchEngineMenu from './components/SearchEngineMenu.vue'
import SearchSuggestionArea from './components/SearchSuggestionArea.vue'

const searchBox = ref<HTMLDivElement>()
const searchForm = ref<HTMLFormElement>()
const searchInput = ref<HTMLInputElement>()
const suggedtionArea = ref<InstanceType<typeof SearchSuggestionArea>>()
const searchEngineMenuRef = ref<TooltipInstance>()

const searchText = ref('')
const originSearchText = ref<string | null>(null) // 当使用上下方向键时使用，记录原始搜索文本
const mounted = ref(false)

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const isWindowFocused = useWindowFocus()
const activeElement = useActiveElement()

const { width: searchFormWidth } = useElementSize(searchForm)

function resetSearch() {
  searchText.value = ''
  originSearchText.value = ''
  suggedtionArea.value?.clearSearchSuggestions()
  searchForm.value?.classList.remove('focus')
  focusStore.blur()
}

watch(isWindowFocused, (isFocused) => {
  if (searchText.value.length > 0 || isFocused) return
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
  if (!(target.localName == 'main' || target.classList.contains('quickstart-wrapper'))) {
    return
  }
  resetSearch()
})

function handleFocus() {
  searchForm.value?.classList.add('focus')
  suggedtionArea.value!.showSearchHistories()
  focusStore.focus()
}

function navigateSuggestions(direction: number) {
  const suggestionsLength = suggedtionArea.value!.searchSuggestions.length
  if (suggestionsLength <= 0) return
  const _current = suggedtionArea.value!.currentActiveSuggest
  suggedtionArea.value!.clearActiveSuggest()
  if (originSearchText.value === null) originSearchText.value = searchText.value
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
  if (!suggestions) return
  suggestions[index].classList.add('active')
  suggedtionArea.value!.currentActiveSuggest = index
  searchText.value = suggedtionArea.value!.searchSuggestions[index]
}

function selectSearch(index: number) {
  settingsStore.search.selectedSearchEngine = index
}

function handlePrevTab() {
  selectSearch(
    (settingsStore.search.selectedSearchEngine - 1 + searchEngines.length) % searchEngines.length
  )
}

function handleNextTab() {
  selectSearch((settingsStore.search.selectedSearchEngine + 1) % searchEngines.length)
}

async function doSearch() {
  doSearchWithText(searchText.value)
  searchText.value = ''
}

async function doSearchWithText(text: string) {
  if (text.length <= 0) {
    searchInput.value?.focus()
    return
  }
  if (settingsStore.search.recordSearchHistory) {
    const searchHistories: string[] = await searchHistoriesStorage.getValue()
    // 判断当前搜索词是否在搜索历史里。如果在，则将其移动到最前面，如果不在，则将其添加到搜索历史
    const index = searchHistories.indexOf(text)
    if (index !== -1) {
      searchHistories.splice(index, 1)
    }
    searchHistories.unshift(text)
    // 如果历史搜索词大于15个，则删除最后几个只留下15个
    if (searchHistories.length > 15) {
      searchHistories.splice(15)
    }
    await searchHistoriesStorage.setValue(searchHistories)
  }
  // 跳转搜索结果
  window.open(
    searchEngines[settingsStore.search.selectedSearchEngine].url.replace('%s', text),
    settingsStore.search.searchInNewTab ? '_blank' : '_self'
  )
  suggedtionArea.value!.clearSearchSuggestions()
}

onMounted(() => useTimeoutFn(() => (mounted.value = true), 100))
</script>

<template>
  <section ref="searchBox" class="search-box">
    <form
      ref="searchForm"
      class="search-form"
      :class="[
        settingsStore.search.enableShadow ? 'shadow' : undefined,
        settingsStore.background.bgType === 0 ? 'dark' : undefined
      ]"
      :style="{ '--width': mounted ? undefined : '0' }"
      @submit.prevent="doSearch"
    >
      <search-engine-menu />
      <input
        ref="searchInput"
        v-model="searchText"
        :placeholder="focusStore.isFocused ? undefined : i18n.t('newtab.search.placeholder')"
        class="search-input"
        @input="suggedtionArea!.handleInput"
        @focus="handleFocus"
        @keydown.up.prevent="handleUp"
        @keydown.down.prevent="handleDown"
        @keydown.tab.shift.prevent.exact="handlePrevTab"
        @keydown.tab.prevent.exact="handleNextTab"
        :autofocus="settingsStore.search.autoFocus"
      />
      <div class="search-btn">
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

<style lang="scss" scoped>
.search-box {
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  --cubic-bezier: cubic-bezier(0.65, 0.05, 0.1, 1);
  position: relative;
}

.search-form {
  --height: 44px;
  --width: 300px;
  --search-form-placeholder-color: var(--el-text-color-regular);
  height: var(--height);
  width: var(--width);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  border-radius: calc(var(--height) / 2);
  font-size: 15px;
  backdrop-filter: blur(10px) saturate(1.4);
  background-color: color-mix(in oklab, var(--el-fill-color), transparent 60%);
  color: transparent;
  transition:
    background-color var(--el-transition-duration-fast) ease,
    box-shadow var(--el-transition-duration-fast) ease,
    border var(--el-transition-duration-fast) ease,
    width var(--el-transition-duration-fast) var(--cubic-bezier);

  &.shadow {
    box-shadow: var(--el-box-shadow-dark);
  }

  html.dark & {
    --search-form-placeholder-color: var(--el-text-color-secondary);

    &.shadow {
      box-shadow: var(--el-box-shadow-light);
    }
  }

  &:hover:not(.focus) {
    --width: 500px;
    background-color: color-mix(in oklab, var(--el-fill-color), transparent 40%);
    --search-form-placeholder-color: var(--el-text-color-primary);
  }

  &.focus {
    background-color: color-mix(in oklab, var(--el-fill-color), transparent 20%);
    --width: 500px;
  }

  html:not(.dark) &.dark {
    background-color: var(--el-fill-color-blank);
    border: solid 1px var(--el-border-color-light);
  }

  :deep() .search-engine-icon,
  :deep() .search-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;
    height: calc(var(--height) - 10px);
    width: calc(var(--height) - 10px);
    overflow: hidden;
    border-radius: 50%;
    transition:
      color var(--el-transition-duration-fast) ease,
      background-color var(--el-transition-duration-fast) ease;
  }

  &.focus:deep() {
    .search-engine-icon,
    .search-btn {
      cursor: pointer;

      &:hover {
        background: white;
      }
    }
    .search-engine-icon {
      color: var(--el-text-color-regular);
    }
    .search-btn {
      color: var(--el-color-primary);
    }
  }

  .search-input {
    height: 100%;
    width: calc(100% - 2 * var(--height) - 20px);
    color: var(--el-text-color-primary);
    text-align: center;
    font-size: 1em;
    outline: none;
    border: none;
    background: none;
    transition:
      width var(--el-transition-duration-fast) var(--cubic-bezier),
      color var(--el-transition-duration-fast) ease;

    &::placeholder {
      color: var(--search-form-placeholder-color);
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      -khtml-user-select: none;
      user-select: none;
    }
  }
}

@media screen and (max-width: 600px) {
  .search-form {
    --width: 75vw;
    --height: 40px;

    &:hover:not(.focus),
    &.focus {
      --width: 85vw;
    }
  }
}
</style>
