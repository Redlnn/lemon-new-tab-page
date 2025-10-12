<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import { Edit16Regular, Pin16Regular, PinOff16Regular } from '@vicons/fluent'
import { ClearRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'
// 由于 wxt/browser 缺少火狐的 topSites 类型定义，直接用官方的 webextension-polyfill
import type { TopSites } from 'webextension-polyfill'

import { useShortcutDrag } from '@/entrypoints/newtab/components/Shortcut/composables/useShortcutDrag'
import { useShortcutLayout } from '@/entrypoints/newtab/components/Shortcut/composables/useShortcutLayout'
import { useTopSitesMerge } from '@/entrypoints/newtab/components/Shortcut/composables/useTopSitesMerge'
import { bookmarkStorage, initBookmark, useBookmarkStore } from '@/shared/bookmark'
import { useSettingsStore } from '@/shared/settings'

import { useFocusStore } from '@newtab/scripts/store'

import addBookmark from './components/addBookmark.vue'
import ShortcutItem from './components/ShortcutItem.vue'
import { pinBookmark, removeBookmark } from './utils/bookmark'
import { blockSite } from './utils/topSites'

const { t } = useTranslation()

const focusStore = useFocusStore()
const settings = useSettingsStore()
const bookmarkStore = useBookmarkStore()
const bookmarkEditorRef = ref<InstanceType<typeof addBookmark> | null>(null)

const topSites = ref<TopSites.MostVisitedURL[]>([])
const bookmarks = ref<{ url: string; title: string; favicon?: string }[]>([])
const mounted = ref(false)

const { columnsNum, rowsNum, computeFitColumns, computeNeededRows } = useShortcutLayout()

const shortcutContainerRef = ref()
useShortcutDrag(shortcutContainerRef, bookmarks)

const refreshDebounced = useDebounceFn(refresh, 100)

async function refresh() {
  await initBookmark()
  // 拆分数据读取与布局计算，避免频繁响应写入
  const _bookmarks = bookmarkStore.items.slice()

  // 1) 纯计算：基于窗口宽度与设置确定列数上限（fitColumns 可能大于实际项目数）
  const fitColumns = computeFitColumns()

  // 2) 首先保证“书签 + 添加按钮”可布局（不够就增加行数，已由 computeRowsGivenColumns 约束至上限）
  const baseItemCount = _bookmarks.length + 1
  const baseRows = computeNeededRows(baseItemCount, fitColumns)
  // 初始容量（预留添加按钮）
  let capacity = fitColumns * baseRows - 1

  // 3) 合并最常访问：一次性基于“列*最大行 - 1”的容量进行去重与截断
  let mergedTop: TopSites.MostVisitedURL[] = []
  if (settings.shortcut.enableTopSites) {
    const topList = await useTopSitesMerge({
      bookmarks: _bookmarks,
      columns: fitColumns,
      maxRows: settings.shortcut.rows
    })
    mergedTop = topList
    // 合并后的完整项目数（包含添加按钮）
    const totalItems = _bookmarks.length + mergedTop.length + 1

    // 4) 最终列数不应超过实际项目数
    const finalColumns = Math.min(fitColumns, totalItems)
    if (columnsNum.value !== finalColumns) {
      columnsNum.value = finalColumns
    }

    // 5) 使用最终列数重新计算行数与容量，并对 TopSites 做最终截断
    const finalRows = computeNeededRows(totalItems, finalColumns)
    capacity = finalColumns * finalRows - 1
    if (_bookmarks.length < capacity) {
      mergedTop = mergedTop.slice(0, capacity - _bookmarks.length)
    } else {
      mergedTop = []
    }
  } else {
    // 6) 未启用 TopSites，同样收敛列数至“书签 + 添加按钮”总数
    const totalItems = _bookmarks.length + 1
    const finalColumns = Math.min(fitColumns, totalItems)
    if (columnsNum.value !== finalColumns) {
      columnsNum.value = finalColumns
    }
    const finalRows = computeNeededRows(totalItems, finalColumns)
    capacity = finalColumns * finalRows - 1
  }

  bookmarks.value = _bookmarks
  topSites.value = _bookmarks.length < capacity ? mergedTop : []
}

onMounted(async () => {
  await refreshDebounced()
  mounted.value = true
})

watch(settings.shortcut, refreshDebounced)
watch(() => columnsNum.value, refreshDebounced)

// 云同步导致书签变动时刷新
bookmarkStorage.watch(refreshDebounced)
</script>

<template>
  <section
    class="shortcut"
    :style="{
      opacity: mounted ? (focusStore.isFocused ? '0' : '1') : '0',
      marginTop: `${settings.shortcut.marginTop}px`
    }"
  >
    <div
      ref="shortcutContainerRef"
      class="shortcut__container"
      :class="[
        settings.shortcut.showShortcutContainerBg ? 'shortcut__container--bg' : undefined,
        settings.shortcut.enableAreaShadow ? 'shortcut__container--shadow' : undefined,
        settings.shortcut.enableShadow ? 'shortcut__container--item-shadow' : undefined,
        settings.shortcut.whiteTextInLightMode ? 'shortcut__container--white-text-light' : undefined
      ]"
      :style="{
        pointerEvents: focusStore.isFocused ? 'none' : 'auto',
        gridTemplateColumns: `repeat(${columnsNum}, 1fr)`,
        gridTemplateRows: `repeat(${rowsNum}, 1fr)`,
        gridGap: `${2 * settings.shortcut.itemMarginV}px ${settings.shortcut.itemMarginH}px`,
        '--icon_size': `${settings.shortcut.iconSize}px`
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
          <el-dropdown-item @click="bookmarkEditorRef?.openEditDialog(index)">
            <el-icon>
              <edit16-regular />
            </el-icon>
            {{ t('newtab:shortcut.edit') }}
          </el-dropdown-item>
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
                await refreshDebounced()
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
      <add-bookmark ref="bookmarkEditorRef" :reload="refreshDebounced" />
    </div>
  </section>
</template>
