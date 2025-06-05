<script setup lang="ts">
import { ClearRound } from '@vicons/material'
import type { TopSites } from 'webextension-polyfill'
import { Pin16Regular, PinOff16Regular } from '@vicons/fluent'
import { onMounted, ref, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useDraggable } from 'vue-draggable-plus'

import { i18n } from '@/.wxt/i18n'
import {
  useFocusStore,
  useSettingsStore,
  initBookmark,
  useBookmarkStore
} from '@/newtab/scripts/store'

import addBookmark from './components/addBookmark.vue'
import ShortcutItem from './components/ShortcutItem.vue'
import { saveBookmark } from '@/newtab/scripts/store'
import { blockSite, getTopSites } from './utils/topSites'
import { removeBookmark, pinBookmark } from './utils/bookmark'

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

async function refresh() {
  await initBookmark()
  // 先把书签单独存，避免计算过程直接对原 store 更改导致画面闪烁
  const _bookmarks = bookmarkStore.items.slice()
  let _topSites: TopSites.MostVisitedURL[] = []

  if (settingsStore.shortcut.enableTopSites) {
    //如果 getTopSites() 返回 undefined，默认空数组
    _topSites = (await getTopSites()) ?? []

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
  }
}

const columnsNum = ref(0)
const rowsNum = ref(settingsStore.shortcut.rows)

onMounted(async () => {
  await refresh()
  mounted.value = true
})

watch(settingsStore.shortcut, refresh)
watch(() => windowWidth.value, refresh)
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
        settingsStore.shortcut.enableShadow ? 'shortcut__container--shadow' : undefined,
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
          <el-dropdown-item @click="removeBookmark(index, bookmarkStore, refresh)">
            <el-icon>
              <pin-off16-regular />
            </el-icon>
            {{ i18n.t('newtab.shortcut.unpin') }}
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
                await blockSite(site.url, refresh)
                await refresh()
              }
            "
          >
            <el-icon>
              <clear-round />
            </el-icon>
            {{ i18n.t('newtab.shortcut.remove') }}
          </el-dropdown-item>
          <el-dropdown-item
            @click="pinBookmark(bookmarkStore, refresh, site.url, site.title || '')"
          >
            <el-icon>
              <pin16-regular />
            </el-icon>
            {{ i18n.t('newtab.shortcut.pin') }}
          </el-dropdown-item>
        </template>
      </shortcut-item>
      <add-bookmark :reload="refresh" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.shortcut {
  max-width: 85%;
  transition: opacity 0.1s ease;

  &__container {
    z-index: 10;
    display: grid;
    place-items: center center;
    transition:
      background-color var(--el-transition-duration-fast) ease,
      box-shadow var(--el-transition-duration-fast) ease;

    &--bg {
      padding: 20px;
      background-color: color-mix(in srgb, var(--el-bg-color), transparent 60%);
      border-radius: 10px;
      backdrop-filter: blur(10px) saturate(1.4);
    }

    &--bg.shortcut__container--shadow {
      box-shadow: var(--el-box-shadow-dark);
    }

    html.dark &.shortcut__container--bg.shortcut__container--shadow {
      box-shadow: var(--el-box-shadow-light);
    }

    a {
      color: inherit;
      text-decoration: inherit;
    }
  }
}
</style>

<style lang="scss">
.shortcut__container {
  &--white-text-light .shortcut__title {
    color: white;
  }

  a {
    color: inherit;
    text-decoration: inherit;
  }

  .shortcut__item {
    position: relative;
    border-radius: 10px;

    .shortcut__icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--icon_size);
      height: var(--icon_size);
      color: var(--el-text-color-regular);
      background: color-mix(in srgb, var(--el-bg-color), transparent 60%);
      border-radius: 50%;
      backdrop-filter: blur(10px) saturate(1.4);
      transition: background-color 0.1s ease;

      span {
        display: block;
        width: calc(var(--icon_size) / 2);
        height: calc(var(--icon_size) / 2);
        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;
        border-radius: 3px;

        svg {
          width: 30px;
          height: 30px;
        }
      }
    }

    &:hover .shortcut__icon {
      background-color: color-mix(in srgb, var(--el-bg-color), transparent 30%);
    }

    .shortcut__item-link {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .shortcut__icon-container {
      position: relative;
      margin-bottom: 8px;
    }

    .shortcut__pin-icon {
      position: absolute;
      right: -3px;
      bottom: -3px;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--el-color-primary);
      background-color: color-mix(in srgb, var(--el-fill-color-light), transparent 60%);
      border-radius: 50%;
      box-shadow: var(--el-box-shadow-light);
      backdrop-filter: blur(10px);
    }

    .shortcut__title {
      display: -webkit-box;
      width: calc(var(--icon_size) + 30px);
      overflow: hidden;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      font-size: 13px;
      text-align: center;
      overflow-wrap: anywhere;
      -webkit-box-orient: vertical;
    }

    .shortcut__menu {
      position: absolute;
      top: -5px;
      right: -5px;
      overflow: hidden;
      color: transparent;
      cursor: pointer;
      border-radius: 50%;

      & > span {
        outline: none;
      }

      &:hover {
        color: var(--el-text-color-primary);
        background-color: var(--el-bg-color);
        box-shadow: var(--el-box-shadow-light);
      }
    }

    &:hover .shortcut__menu {
      color: var(--el-text-color-regular);
    }

    .shortcut__menu-icon {
      width: 26px;
      height: 26px;
      padding: 3px;
      font-size: 20px;
    }
  }
}
</style>
