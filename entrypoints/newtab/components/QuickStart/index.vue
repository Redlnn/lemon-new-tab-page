<script setup lang="ts">
import { ClearRound } from '@vicons/material'
import type { TopSites } from 'wxt/browser'
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
import quickStartItem from './components/quickStartItem.vue'
import { saveBookmark } from '@/newtab/scripts/store'
import { getQSSize } from './utils'
import { blockSite, getTopSites } from './utils/topSites'
import { removeBookmark, pin } from './utils/bookmark'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const bookmarkStore = useBookmarkStore()

const topSites = ref<TopSites.MostVisitedURL[]>([])
const bookmarks = ref<{ url: string; title: string; favicon?: string }[]>([])
const mounted = ref(false)
const { width: windowWidth } = useWindowSize()

const quickstartContaninerRef = ref()
useDraggable(quickstartContaninerRef, bookmarks, {
  animation: 150,
  handle: '.quickstart-item',
  onUpdate() {
    bookmarkStore.items = bookmarks.value
    saveBookmark(bookmarkStore)
  }
})

function getContainerWidth(num: number) {
  const width =
    num * (15 + settingsStore.quickStart.iconSize + 15) +
    (num - 1) * settingsStore.quickStart.itemMarginH
  if (settingsStore.quickStart.showQuickStartContainerBg) {
    return width + 40
  }
  return width
}

async function refresh() {
  await initBookmark()
  // 先把书签单独存，避免计算过程直接对原 store 更改导致画面闪烁
  const _bookmarks = bookmarkStore.items.slice()
  let _topSites: TopSites.MostVisitedURL[] = []

  if (settingsStore.quickStart.enableTopSites) {
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
  let _columnsCount = Math.min(settingsStore.quickStart.columns, _itemCount)
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
    rowsNum.value = Math.min(settingsStore.quickStart.rows, Math.ceil(_itemCount / _columnsCount))
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
const rowsNum = ref(settingsStore.quickStart.rows)

onMounted(async () => {
  await refresh()
  mounted.value = true
})

watch(settingsStore.quickStart, refresh)
watch(() => windowWidth.value, refresh)
</script>

<template>
  <section
    class="quickstart-wrapper"
    :style="{
      opacity: mounted ? (focusStore.isFocused ? '0' : '1') : '0'
    }"
  >
    <div
      ref="quickstartContaninerRef"
      class="quickstart-contaniner"
      :class="[
        settingsStore.quickStart.showQuickStartContainerBg ? 'quickstart-contaniner-bg' : undefined,
        settingsStore.quickStart.enableShadow ? 'quickstart-contaniner-shadow' : undefined,
        settingsStore.quickStart.whiteTextInLightMode ? 'white-text-light' : undefined
      ]"
      :style="{
        pointerEvents: focusStore.isFocused ? 'none' : 'auto',
        gridTemplateColumns: `repeat(${columnsNum}, 1fr)`,
        gridTemplateRows: `repeat(${rowsNum}, 1fr)`,
        gridGap: `${2 * settingsStore.quickStart.itemMarginV}px ${settingsStore.quickStart.itemMarginH}px`,
        '--icon_size': `${settingsStore.quickStart.iconSize}px`
      }"
    >
      <quick-start-item
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
            {{ i18n.t('newtab.quickstart.unpin') }}
          </el-dropdown-item>
        </template>
      </quick-start-item>
      <quick-start-item
        v-for="(site, index) in topSites"
        :key="index"
        :url="site.url"
        :title="site.title || ''"
        :qs-sites-size="() => getQSSize(bookmarks, topSites)"
        :favicon="site.favicon"
      >
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
            {{ i18n.t('newtab.quickstart.remove') }}
          </el-dropdown-item>
          <el-dropdown-item @click="pin(bookmarkStore, refresh, site.url, site.title || '')">
            <el-icon>
              <pin16-regular />
            </el-icon>
            {{ i18n.t('newtab.quickstart.pin') }}
          </el-dropdown-item>
        </template>
      </quick-start-item>
      <add-bookmark :reload="refresh" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.quickstart-wrapper {
  max-width: 85%;
  margin-top: 80px;
  transition: opacity 0.1s ease;
}

.quickstart-contaniner {
  display: grid;
  justify-items: center;
  align-items: center;
  z-index: 10;
  transition:
    background-color var(--el-transition-duration-fast) ease,
    box-shadow var(--el-transition-duration-fast) ease;

  &.quickstart-contaniner-bg {
    padding: 20px;
    background-color: color-mix(in oklab, var(--el-bg-color), transparent 60%);
    border-radius: 10px;
    backdrop-filter: blur(10px) saturate(1.4);

    &.quickstart-contaniner-shadow {
      box-shadow: var(--el-box-shadow-dark);
    }
  }

  html.dark &.quickstart-contaniner-bg.quickstart-contaniner-shadow {
    box-shadow: var(--el-box-shadow-light);
  }

  a {
    color: inherit;
    text-decoration: inherit;
  }
}
</style>

<style lang="scss">
.quickstart-contaniner {
  &.white-text-light a {
    color: white;
  }

  a {
    color: inherit;
    text-decoration: inherit;
  }

  .quickstart-item {
    position: relative;
    border-radius: 10px;

    &:hover .quickstart-icon {
      background-color: color-mix(in oklab, var(--el-bg-color), transparent 30%);
    }

    .quickstart-item-link {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .quickstart-icon {
      position: relative;
      width: var(--icon_size);
      height: var(--icon_size);
      margin-bottom: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      background: color-mix(in oklab, var(--el-bg-color), transparent 70%);
      backdrop-filter: blur(10px) saturate(1.4);
      transition: background-color 0.1s ease;

      span {
        display: block;
        width: calc(var(--icon_size) / 2);
        height: calc(var(--icon_size) / 2);
        border-radius: 3px;
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
        color: var(--el-text-color-regular);

        svg {
          width: 30px;
          height: 30px;
        }
      }

      .pin-icon {
        position: absolute;
        bottom: -3px;
        right: -3px;
        height: 20px;
        width: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--el-fill-color-light);
        border-radius: 50%;
        color: var(--el-color-primary);
        box-shadow: var(--el-box-shadow-light);
      }
    }

    .quickstart-title {
      width: calc(var(--icon_size) + 30px);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      line-clamp: 1;
      -webkit-line-clamp: 1;
      overflow: hidden;
      font-size: 13px;
      text-align: center;
      overflow-wrap: anywhere;
    }

    &:hover .quickstart-menu {
      color: var(--el-text-color-regular);
    }

    .quickstart-menu {
      position: absolute;
      top: -5px;
      right: -5px;
      border-radius: 50%;
      color: transparent;
      overflow: hidden;
      cursor: pointer;

      & > span {
        outline: none;
      }

      &:hover {
        background-color: var(--el-bg-color);
        color: var(--el-text-color-primary);
        box-shadow: var(--el-box-shadow-light);
      }
    }

    .quickstart-menu-icon {
      width: 26px;
      height: 26px;
      font-size: 20px;
      padding: 3px;
    }
  }
}
</style>
