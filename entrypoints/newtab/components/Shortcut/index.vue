<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useDebounceFn, useWindowSize } from '@vueuse/core'

import { Pin16Regular, PinOff16Regular } from '@vicons/fluent'
import { ClearRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'
import { useDraggable } from 'vue-draggable-plus'
// 由于 wxt/browser 缺少火狐的 topSites 类型定义，直接用官方的 webextension-polyfill
import type { TopSites } from 'webextension-polyfill'

import { bookmarkStorage, initBookmark, saveBookmark, useBookmarkStore } from '@/shared/bookmark'
import { useSettingsStore } from '@/shared/settings'

import { useFocusStore } from '@newtab/scripts/store'

import addBookmark from './components/addBookmark.vue'
import ShortcutItem from './components/ShortcutItem.vue'
import { pinBookmark, removeBookmark } from './utils/bookmark'
import { blockSite, getTopSites } from './utils/topSites'

const { t } = useTranslation()

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const bookmarkStore = useBookmarkStore()

const topSites = ref<TopSites.MostVisitedURL[]>([])
const bookmarks = ref<{ url: string; title: string; favicon?: string }[]>([])
const mounted = ref(false)
const { width: windowWidth } = useWindowSize()

const shortcutContainerRef = ref()
useDraggable(shortcutContainerRef, bookmarks, {
  animation: 150,
  handle: '.shortcut__item',
  onUpdate() {
    bookmarkStore.items = bookmarks.value
    saveBookmark(bookmarkStore)
  }
})

function getContainerWidth(num: number) {
  const width =
    num * (15 + settingsStore.shortcut.iconSize + 15) +
    (num - 1) * settingsStore.shortcut.itemMarginH
  if (settingsStore.shortcut.showShortcutContainerBg) {
    return width + 40
  }
  return width
}

const refreshDebounced = useDebounceFn(refresh, 100)

async function refresh() {
  await initBookmark()
  // 先把书签单独存，避免计算过程直接对原 store 更改导致画面闪烁
  const _bookmarks = bookmarkStore.items.slice()
  let _topSites: TopSites.MostVisitedURL[] = []

  if (settingsStore.shortcut.enableTopSites) {
    //如果 getTopSites() 返回 undefined，默认空数组
    _topSites = (await getTopSites()) ?? []
    topSites.value = []

    if (_topSites.length > 0) {
      // 拿到书签里的url，比对最常访问里有没有重复的，有就去掉
      const bookmarkUrlsSet = new Set(_bookmarks.map((item) => item.url))
      _topSites = _topSites.filter((site) => !bookmarkUrlsSet.has(site.url))
    }
  }

  // 计算快捷访问元素总数，为书签数+最常访问数+添加按钮
  const _itemCount = _bookmarks.length + _topSites.length + 1

  // 当元素总数少于设置中的列数时，使实际列数=元素总数
  let _columnsCount = Math.min(settingsStore.shortcut.columns, _itemCount)
  // 遍历列数，计算小于多少列时，容器大小不会超出页面
  const containerWidth = windowWidth.value * 0.85
  for (let i = _columnsCount; i > 0; i--) {
    if (getContainerWidth(i) < containerWidth) {
      _columnsCount = i
      break
    }
  }

  columnsNum.value = _columnsCount
  // 当项目数量小于等于设置的列数时，行数为1
  // 否则计算实际需要的行数
  if (_itemCount <= _columnsCount) {
    rowsNum.value = 1
  } else {
    // 讲元素总数÷实际列数（所需行数）与最大行数比较，取小的作为实际行数
    rowsNum.value = Math.min(settingsStore.shortcut.rows, Math.ceil(_itemCount / _columnsCount))
  }

  // 定好行数和列数后才把书签上屏避免闪烁
  bookmarks.value = _bookmarks
  // 计算实际可用的格子
  const totalCellsNum = _columnsCount * rowsNum.value - 1
  // 如果书签数量小于可用格子，就把最常访问填充剩余格子上屏
  if (_bookmarks.length < totalCellsNum) {
    topSites.value = _topSites.slice(0, totalCellsNum - _bookmarks.length)
  } else {
    topSites.value = []
  }
}

const columnsNum = ref(0)
const rowsNum = ref(settingsStore.shortcut.rows)

onMounted(async () => {
  await refreshDebounced()
  mounted.value = true
})

watch(settingsStore.shortcut, refreshDebounced)
watch(() => windowWidth.value, refreshDebounced)
// 云同步导致书签变动时刷新
bookmarkStorage.watch(refreshDebounced)
</script>

<template>
  <section
    class="shortcut"
    :style="{
      opacity: mounted ? (focusStore.isFocused ? '0' : '1') : '0',
      marginTop: `${settingsStore.shortcut.marginTop}px`
    }"
  >
    <div
      ref="shortcutContainerRef"
      class="shortcut__container"
      :class="[
        settingsStore.shortcut.showShortcutContainerBg ? 'shortcut__container--bg' : undefined,
        settingsStore.shortcut.enableAreaShadow ? 'shortcut__container--shadow' : undefined,
        settingsStore.shortcut.enableShadow ? 'shortcut__container--item-shadow' : undefined,
        settingsStore.shortcut.whiteTextInLightMode
          ? 'shortcut__container--white-text-light'
          : undefined
      ]"
      :style="{
        pointerEvents: focusStore.isFocused ? 'none' : 'auto',
        gridTemplateColumns: `repeat(${columnsNum}, 1fr)`,
        gridTemplateRows: `repeat(${rowsNum}, 1fr)`,
        gridGap: `${2 * settingsStore.shortcut.itemMarginV}px ${settingsStore.shortcut.itemMarginH}px`,
        '--icon_size': `${settingsStore.shortcut.iconSize}px`
      }"
    >
      <shortcut-item
        v-for="(site, index) in bookmarks"
        ref="bookmarkItemsRef"
        :key="index"
        :url="site.url"
        :title="site.title"
        :favicon="site.favicon"
        pined
      >
        <template #submenu>
          <el-dropdown-item @click="removeBookmark(index, bookmarkStore, refreshDebounced)">
            <el-icon>
              <pin-off16-regular />
            </el-icon>
            {{ t('newtab:shortcut.unpin') }}
          </el-dropdown-item>
        </template>
      </shortcut-item>
      <shortcut-item
        v-for="(site, index) in topSites"
        :key="index"
        :url="site.url"
        :title="site.title || ''"
        :favicon="site.favicon"
      >
        <template #submenu>
          <el-dropdown-item
            @click="
              async () => {
                await blockSite(site.url, refreshDebounced)
                await refresh()
              }
            "
          >
            <el-icon>
              <clear-round />
            </el-icon>
            {{ t('newtab:shortcut.remove') }}
          </el-dropdown-item>
          <el-dropdown-item
            @click="pinBookmark(bookmarkStore, refreshDebounced, site.url, site.title || '')"
          >
            <el-icon>
              <pin16-regular />
            </el-icon>
            {{ t('newtab:shortcut.pin') }}
          </el-dropdown-item>
        </template>
      </shortcut-item>
      <add-bookmark :reload="refreshDebounced" />
    </div>
  </section>
</template>
