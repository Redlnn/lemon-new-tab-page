<script setup lang="ts">
import { ClearRound } from '@vicons/material'
import type { TopSites } from 'wxt/browser'
import _ from 'lodash'
import { Pin16Regular, PinOff16Regular } from '@vicons/fluent'
import { onMounted, ref, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'

import { i18n } from '@/.wxt/i18n'
import {
  useFocusStore,
  useSettingsStore,
  initBookmark,
  useBookmarkStore
} from '@/newtab/scripts/store'

import addBookmark from './components/addBookmark.vue'
import quickStartItem from './components/quickStartItem.vue'
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

function getContainerWidth(num: number) {
  return (
    num * (15 + settingsStore.quickStart.itemSize + 15) +
    (num - 1) * settingsStore.quickStart.itemMarginH +
    40
  )
}

async function refresh() {
  await initBookmark()
  const _bookmarks = _.cloneDeep(bookmarkStore.items)

  let _topSites: TopSites.MostVisitedURL[] = await getTopSites()
  if (_topSites === undefined || !settingsStore.quickStart.enableTopSites) {
    _topSites = _bookmarks
  }
  const bookmarkUrls = _bookmarks.map((item) => item.url)
  _topSites = _topSites.filter((site) => !bookmarkUrls.includes(site.url))

  const _itemCount = _bookmarks.length + _topSites.length + 1

  let _columnsCount = Math.min(settingsStore.quickStart.columns, _itemCount)
  for (let i = _columnsCount; i > 0; i--) {
    if (getContainerWidth(i) < windowWidth.value * 0.85) {
      _columnsCount = i
      break
    }
  }

  columnsNum.value = _columnsCount
  if (_columnsCount <= settingsStore.quickStart.columns && _itemCount <= _columnsCount) {
    rowsNum.value = 1
  } else {
    rowsNum.value = Math.min(settingsStore.quickStart.rows, Math.ceil(_itemCount / _columnsCount))
  }

  bookmarks.value = _bookmarks
  const totalCellsNum = _columnsCount * rowsNum.value
  if (_bookmarks.length < totalCellsNum) {
    topSites.value = _topSites.slice(0, totalCellsNum - _bookmarks.length - 1)
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
      class="quickstart-contaniner"
      :class="[
        settingsStore.quickStart.showQuickStartContainerBg ? 'quickstart-contaniner-bg' : null,
        settingsStore.quickStart.enableShadow ? 'quickstart-contaniner-shadow' : null,
        settingsStore.quickStart.whiteTextInLightMode ? 'white-text-light' : null
      ]"
      :style="{
        pointerEvents: focusStore.isFocused ? 'none' : 'auto',
        gridTemplateColumns: `repeat(${columnsNum}, 1fr)`,
        gridTemplateRows: `repeat(${rowsNum}, 1fr)`,
        gridGap: `${2 * settingsStore.quickStart.itemMarginV}px ${settingsStore.quickStart.itemMarginH}px`,
        '--icon_size': `${settingsStore.quickStart.itemSize}px`
      }"
    >
      <quick-start-item
        v-for="(site, index) in bookmarks"
        :key="index"
        :url="site.url"
        :title="site.title"
        :favicon="site.favicon"
        :qs-sites-size="() => getQSSize(bookmarks, topSites)"
        pined
      >
        <template #submenu>
          <el-dropdown-item>
            <span
              style="display: flex; align-items: center"
              @click="removeBookmark(index, bookmarkStore, refresh)"
            >
              <el-icon>
                <pin-off16-regular />
              </el-icon>
              {{ i18n.t('newtab.quickstart.unpin') }}
            </span>
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
          <el-dropdown-item>
            <span
              style="display: flex; align-items: center"
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
            </span>
          </el-dropdown-item>
          <el-dropdown-item>
            <span
              style="display: flex; align-items: center"
              @click="pin(bookmarkStore, refresh, site.url, site.title || '')"
            >
              <el-icon>
                <pin16-regular />
              </el-icon>
              {{ i18n.t('newtab.quickstart.pin') }}
            </span>
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
