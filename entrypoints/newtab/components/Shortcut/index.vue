<script setup lang="ts">
import { useDebounceFn, useEventListener, useResizeObserver } from '@vueuse/core'

import {
  ChevronLeft20Filled,
  ChevronRight20Filled,
  Edit16Regular,
  Pin16Regular,
  PinOff16Regular
} from '@vicons/fluent'
import { ClearRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'
// 由于 wxt/browser 缺少火狐的 topSites 类型定义，直接用官方的 webextension-polyfill
import type { TopSites } from 'webextension-polyfill'

import { useSettingsStore } from '@/shared/settings'
import { shortcutStorage, useShortcutStore } from '@/shared/shortcut'

import { blockedTopSitesStorage } from '@newtab/shared/storages/topSitesStorage'
import { useFocusStore } from '@newtab/shared/store'
import { isOnlyTouchDevice } from '@newtab/shared/touch'

import getPerfClasses from '../../composables/perfClasses'
import AddShortcut from './components/AddShortcut.vue'
import ShortcutItem from './components/ShortcutItem.vue'
import ShortcutPaginationDots from './components/ShortcutPaginationDots.vue'
import { useShortcutDrag } from './composables/useShortcutDrag'
import { useShortcutLayout } from './composables/useShortcutLayout'
import { useShortcutPagination } from './composables/useShortcutPagination'
import { useTopSitesMerge } from './composables/useTopSitesMerge'
import { pinShortcut, removeShortcut } from './utils/shortcut'
import { blockSite, invalidateTopSitesCache } from './utils/topSites'

const { t } = useTranslation()

const focusStore = useFocusStore()
const settings = useSettingsStore()
const shortcutStore = useShortcutStore()

const shortcutEditorRef = ref<InstanceType<typeof AddShortcut> | null>(null)

const topSites = ref<TopSites.MostVisitedURL[]>([])
const shortcuts = ref<{ url: string; title: string; favicon?: string }[]>([])
const mounted = ref(false)
const topSitesNeedsReload = ref(true)

const { columnsNum, rowsNum, computeFitColumns, computeNeededRows } = useShortcutLayout()

// 每页格子数（用于分页计算）
const slotsPerPage = computed(() => columnsNum.value * rowsNum.value)

// 合并后的完整项目列表（shortcuts + topSites）
const allItems = computed(() => {
  const shortcutsArr = shortcuts.value
  const topSitesArr = topSites.value
  const shortcutsLen = shortcutsArr.length
  const topSitesLen = topSitesArr.length

  // 预分配数组大小，避免动态扩容
  const result: {
    url: string
    title: string
    favicon?: string
    isPinned: boolean
    originalIndex: number
  }[] = Array.from({ length: shortcutsLen + topSitesLen })

  for (let i = 0; i < shortcutsLen; i++) {
    const site = shortcutsArr[i]!
    result[i] = {
      url: site.url,
      title: site.title,
      favicon: site.favicon,
      isPinned: true,
      originalIndex: i
    }
  }

  for (let i = 0; i < topSitesLen; i++) {
    const site = topSitesArr[i]!
    result[shortcutsLen + i] = {
      url: site.url,
      title: site.title || '',
      favicon: site.favicon,
      isPinned: false,
      originalIndex: i
    }
  }

  return result
})

// 总项目数（用于分页计算，包含添加按钮）
const totalItemsCount = computed(() => allItems.value.length)

// 分页逻辑
// 如果用户禁用翻页，则将用于分页计算的总项目数限制为每页格子数，确保只有一页
const paginationTotalItems = computed(() =>
  settings.shortcut.disablePaging
    ? Math.min(totalItemsCount.value, slotsPerPage.value)
    : totalItemsCount.value
)

const {
  currentPage,
  totalPages,
  showPagination,
  isAnimating,
  slideDirection,
  noTransition,
  preloadTargetPage,
  prevPage,
  nextPage,
  goToPage,
  setupSwipe
} = useShortcutPagination(paginationTotalItems, slotsPerPage)

// 获取指定页的项目
function getPageItems(pageIndex: number) {
  if (pageIndex < 0 || pageIndex >= totalPages.value) {
    return []
  }

  const slots = slotsPerPage.value
  const startIndex = pageIndex * slots
  const isLastPage = pageIndex === totalPages.value - 1

  // 计算最大项目数，最后一页限制为 slots - 1
  const maxItems = isLastPage ? slots - 1 : slots
  return allItems.value.slice(startIndex, startIndex + maxItems)
}

// 动画期间显示的页码（用于渲染3页）
const displayPage = computed(() => {
  // 动画期间保持原页码，动画结束后 currentPage 会更新
  return currentPage.value
})

// 当前页显示的项目
const currentPageItems = computed(() => getPageItems(displayPage.value))

// 前一页的项目（用于预加载）
const prevPageItems = computed(() => {
  // 如果有预加载目标页且向右跳（目标页 < 当前页），将目标页内容加载到 prev 位置
  if (preloadTargetPage.value !== null && preloadTargetPage.value < displayPage.value) {
    return getPageItems(preloadTargetPage.value)
  }
  return getPageItems(displayPage.value - 1)
})

// 后一页的项目（用于预加载）
const nextPageItems = computed(() => {
  // 如果有预加载目标页且向左跳（目标页 > 当前页），将目标页内容加载到 next 位置
  if (preloadTargetPage.value !== null && preloadTargetPage.value > displayPage.value) {
    return getPageItems(preloadTargetPage.value)
  }
  return getPageItems(displayPage.value + 1)
})

// 前一页是否显示添加按钮（避免模板中重复计算）
const showPrevPageAddButton = computed(() => {
  const pageIndex =
    preloadTargetPage.value !== null && preloadTargetPage.value < displayPage.value
      ? preloadTargetPage.value
      : displayPage.value - 1
  return showAddButtonForPage(pageIndex)
})

// 后一页是否显示添加按钮（避免模板中重复计算）
const showNextPageAddButton = computed(() => {
  const pageIndex =
    preloadTargetPage.value !== null && preloadTargetPage.value > displayPage.value
      ? preloadTargetPage.value
      : displayPage.value + 1
  return showAddButtonForPage(pageIndex)
})

// 是否在指定页显示添加按钮
function showAddButtonForPage(pageIndex: number) {
  return pageIndex === totalPages.value - 1
}

// 是否在当前页显示添加按钮（始终在最后一页的最后一格）
const showAddButton = computed(() => showAddButtonForPage(displayPage.value))

// 当前页实际显示的项目数（包含添加按钮）
const currentPageTotalItems = computed(() => {
  return currentPageItems.value.length + (showAddButton.value ? 1 : 0)
})

// 提取容器通用class（避免模板中重复）
const containerBaseClasses = computed(() => [
  settings.shortcut.enableShadow ? 'shortcut__container--item-shadow' : undefined,
  settings.shortcut.whiteTextInLightMode ? 'shortcut__container--white-text-light' : undefined
])

// 容器动画class
const containerAnimationClasses = computed(() => ({
  'shortcut__container--slide-left': slideDirection.value === 'left',
  'shortcut__container--slide-right': slideDirection.value === 'right',
  'shortcut__container--no-transition': noTransition.value
}))

// 容器通用style
const containerGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${displayColumns.value}, 1fr)`,
  gridTemplateRows: `repeat(${displayRows.value}, 1fr)`,
  gridGap: `${2 * settings.shortcut.itemMarginV}px ${settings.shortcut.itemMarginH}px`,
  '--icon_size': `${settings.shortcut.iconSize}px`,
  '--icon_ratio': `${settings.shortcut.iconRatio}`
}))

// 导航按钮通用class
const navBtnBaseClasses = computed(() =>
  getPerfClasses(
    {
      transparentOff: settings.perf.disableShortcutTransparent,
      blurOff: settings.perf.disableShortcutBlur
    },
    'shortcut__nav-btn'
  )
)

// 动态计算当前页实际需要的列数
const displayColumns = computed(() => {
  // 超出一页时，保持最大列数
  if (totalPages.value > 1) {
    return columnsNum.value
  }
  // 只有一页时，根据项目数动态调整
  const itemCount = currentPageTotalItems.value
  return Math.max(1, Math.min(columnsNum.value, itemCount))
})

// 动态计算当前页实际需要的行数
const displayRows = computed(() => {
  // 超出一页时，保持最大行数
  if (totalPages.value > 1) {
    return rowsNum.value
  }
  // 只有一页时，根据项目数动态调整
  const itemCount = currentPageTotalItems.value
  const cols = displayColumns.value
  if (cols <= 0) return 1
  return computeNeededRows(itemCount, cols)
})

// 记录当前打开的右键菜单关闭函数，实现全局唯一
const openedMenuCloseFn = ref<(() => void) | null>(null)
provide('shortcutOpenedMenuCloseFn', openedMenuCloseFn)

// 切换页面时重置并关闭已打开的菜单
watch(
  () => currentPage.value,
  () => {
    if (openedMenuCloseFn.value) {
      openedMenuCloseFn.value()
      openedMenuCloseFn.value = null
    }
  }
)

const shortcutContainerRef = useTemplateRef('shortcutContainerRef')
const prevPageContainerRef = useTemplateRef('prevPageContainerRef')
const currentPageContainerRef = useTemplateRef('currentPageContainerRef')
const nextPageContainerRef = useTemplateRef('nextPageContainerRef')

const refreshDebounced = useDebounceFn(refresh, 100)
const { isDragging } = useShortcutDrag(currentPageContainerRef, shortcuts, refreshDebounced)

useEventListener(currentPageContainerRef, 'wheel', (evt: WheelEvent) => {
  if (isDragging.value) return
  if (evt.deltaY < 0 || evt.deltaX < 0) {
    // 向上滚动，上一页
    prevPage()
  } else if (evt.deltaY > 0 || evt.deltaX > 0) {
    // 向下滚动，下一页
    nextPage()
  }
})

// 开始拖拽时关闭已打开的菜单
watch(isDragging, (dragging) => {
  if (dragging && openedMenuCloseFn.value) {
    openedMenuCloseFn.value()
    openedMenuCloseFn.value = null
  }
})

async function refresh() {
  // 刷新时重置打开的菜单，防止布局或数据变化导致索引失效
  if (openedMenuCloseFn.value) {
    openedMenuCloseFn.value()
    openedMenuCloseFn.value = null
  }

  // 拆分数据读取与布局计算
  const _shortcuts = shortcutStore.items.slice()

  // 1) 纯计算：基于窗口宽度与设置确定列数上限
  const fitColumns = computeFitColumns(!isOnlyTouchDevice.value)
  columnsNum.value = fitColumns
  rowsNum.value = settings.shortcut.rows

  // 2) 合并最常访问
  let mergedTop: TopSites.MostVisitedURL[] = []
  if (settings.shortcut.enableTopSites) {
    const topList = await useTopSitesMerge({
      shortcuts: _shortcuts,
      columns: fitColumns,
      maxRows: settings.shortcut.rows,
      force: topSitesNeedsReload.value,
      noCap: true // 不截断，获取所有可用的 top sites
    })
    mergedTop = topList
    topSitesNeedsReload.value = false
  }

  shortcuts.value = _shortcuts
  topSites.value = mergedTop

  // 首次刷新完成后设置 mounted 标志
  if (!mounted.value) {
    mounted.value = true
  }
}

// 设置滑动手势支持（绑定到 slide-viewport，以便切换时能切换 overflow）
setupSwipe(
  shortcutContainerRef,
  prevPageContainerRef,
  currentPageContainerRef,
  nextPageContainerRef,
  isDragging
)

// useResizeObserver 会在开始观察时立即触发一次
useResizeObserver(document.documentElement, async () => {
  await refreshDebounced()
})

watch(
  () => [
    settings.shortcut.columns,
    settings.shortcut.rows,
    settings.shortcut.iconSize,
    settings.shortcut.itemMarginH,
    settings.shortcut.itemMarginV,
    settings.shortcut.showShortcutContainerBg,
    settings.shortcut.disablePaging
  ],
  refreshDebounced
)
watch(
  () => settings.shortcut.enableTopSites,
  (enabled) => {
    if (enabled) {
      topSitesNeedsReload.value = true
    }
    refreshDebounced()
  }
)

// 云同步或 popup 添加书签导致 storage 变动时刷新
shortcutStorage.watch(async (newValue) => {
  // 先同步 store 数据，再刷新 UI
  if (newValue) {
    shortcutStore.$patch(newValue)
  }
  await refreshDebounced()
})

blockedTopSitesStorage.watch(() => {
  topSitesNeedsReload.value = true
  invalidateTopSitesCache()
  refreshDebounced()
})

// 根据原始索引获取快捷方式的实际索引（用于编辑）
function getShortcutEditIndex(item: (typeof currentPageItems.value)[number]): number {
  if (item.isPinned) {
    return item.originalIndex
  }
  return -1
}

const isHideShortcut = computed(() => {
  if (!mounted.value) {
    return '0'
  }

  if (!focusStore.isFocused) {
    return '1'
  }

  return settings.shortcut.showOnSearchFocus ? '1' : '0'
})
</script>

<template>
  <section
    class="shortcut"
    :style="{
      opacity: isHideShortcut,
      paddingTop: `${settings.shortcut.marginTop / 2}px`,
      marginTop: `${settings.shortcut.marginTop / 2}px`
    }"
  >
    <div ref="shortcutWrapperRef" class="shortcut__wrapper">
      <div class="shortcut__wrapper-inner">
        <!-- 左翻页按钮 -->
        <button
          v-if="showPagination && !isOnlyTouchDevice"
          class="shortcut__nav-btn--prev"
          :class="[
            { 'shortcut__nav-btn--disabled': currentPage === 0 || isAnimating },
            navBtnBaseClasses
          ]"
          :disabled="currentPage === 0 || isAnimating"
          @click="prevPage"
        >
          <el-icon :size="20">
            <chevron-left20-filled />
          </el-icon>
        </button>
        <div style="overflow: hidden">
          <!-- 滑动轨道容器 -->
          <div
            ref="shortcutContainerRef"
            class="shortcut__slide-viewport"
            :class="[
              settings.shortcut.showShortcutContainerBg
                ? 'shortcut__slide-viewport--bg'
                : undefined,
              settings.shortcut.enableAreaShadow ? 'shortcut__slide-viewport--shadow' : undefined
            ]"
          >
            <div class="shortcut__slide-track">
              <!-- 前一页 -->
              <div
                v-if="displayPage > 0"
                ref="prevPageContainerRef"
                class="shortcut__container shortcut__container--page shortcut__container--prev"
                :class="[...containerBaseClasses, containerAnimationClasses]"
                :style="containerGridStyle"
              >
                <shortcut-item
                  v-for="item in prevPageItems"
                  :key="`${item.isPinned ? 'pin' : 'top'}-${item.originalIndex}`"
                  v-memo="[item.url, item.title, item.favicon, item.isPinned]"
                  :url="item.url"
                  :title="item.title"
                  :favicon="item.favicon"
                  :pined="item.isPinned"
                />
                <add-shortcut
                  v-if="showPrevPageAddButton"
                  :reload="refreshDebounced"
                  :show-button="true"
                />
              </div>
              <!-- 前一页占位（当没有前一页时） -->
              <div
                v-else
                class="shortcut__container shortcut__container--page shortcut__container--prev shortcut__container--placeholder"
              ></div>

              <!-- 当前页 -->
              <div
                ref="currentPageContainerRef"
                class="shortcut__container shortcut__container--page shortcut__container--current"
                :class="[...containerBaseClasses, containerAnimationClasses]"
                :style="{
                  pointerEvents:
                    settings.shortcut.showOnSearchFocus || !focusStore.isFocused ? 'auto' : 'none',
                  ...containerGridStyle
                }"
              >
                <shortcut-item
                  v-for="item in currentPageItems"
                  :key="`${item.isPinned ? 'pin' : 'top'}-${item.originalIndex}`"
                  v-memo="[item.url, item.title, item.favicon, item.isPinned]"
                  :url="item.url"
                  :title="item.title"
                  :favicon="item.favicon"
                  :pined="item.isPinned"
                >
                  <template #submenu>
                    <template v-if="item.isPinned">
                      <el-dropdown-item
                        divided
                        @click="shortcutEditorRef?.openEditDialog(getShortcutEditIndex(item))"
                      >
                        <el-icon>
                          <edit16-regular />
                        </el-icon>
                        {{ t('common.edit') }}
                      </el-dropdown-item>
                      <el-dropdown-item
                        @click="removeShortcut(item.originalIndex, shortcutStore, refreshDebounced)"
                      >
                        <el-icon>
                          <pin-off16-regular />
                        </el-icon>
                        {{ t('shortcut.unpin') }}
                      </el-dropdown-item>
                    </template>
                    <template v-else>
                      <el-dropdown-item
                        divided
                        @click="
                          async () => {
                            await blockSite(item.url, refreshDebounced)
                            await refreshDebounced()
                          }
                        "
                      >
                        <el-icon>
                          <clear-round />
                        </el-icon>
                        {{ t('shortcut.hide') }}
                      </el-dropdown-item>
                      <el-dropdown-item
                        @click="pinShortcut(shortcutStore, refreshDebounced, item.url, item.title)"
                      >
                        <el-icon>
                          <pin16-regular />
                        </el-icon>
                        {{ t('shortcut.pin') }}
                      </el-dropdown-item>
                    </template>
                  </template>
                </shortcut-item>

                <!-- 添加快捷方式按钮（始终在最后一页最后一格） -->
                <add-shortcut
                  ref="shortcutEditorRef"
                  :reload="refreshDebounced"
                  :show-button="showAddButton"
                />
              </div>

              <!-- 后一页 -->
              <div
                v-if="displayPage < totalPages - 1"
                ref="nextPageContainerRef"
                class="shortcut__container shortcut__container--page shortcut__container--next"
                :class="[...containerBaseClasses, containerAnimationClasses]"
                :style="containerGridStyle"
              >
                <shortcut-item
                  v-for="item in nextPageItems"
                  :key="`${item.isPinned ? 'pin' : 'top'}-${item.originalIndex}`"
                  v-memo="[item.url, item.title, item.favicon, item.isPinned]"
                  :url="item.url"
                  :title="item.title"
                  :favicon="item.favicon"
                  :pined="item.isPinned"
                />
                <add-shortcut
                  v-if="showNextPageAddButton"
                  :reload="refreshDebounced"
                  :show-button="true"
                />
              </div>
              <!-- 后一页占位（当没有后一页时） -->
              <div
                v-else
                class="shortcut__container shortcut__container--page shortcut__container--next shortcut__container--placeholder"
              />
            </div>
          </div>
        </div>
        <!-- 右翻页按钮 -->
        <button
          v-if="showPagination && !isOnlyTouchDevice"
          class="shortcut__nav-btn--next"
          :class="[
            { 'shortcut__nav-btn--disabled': currentPage === totalPages - 1 || isAnimating },
            navBtnBaseClasses
          ]"
          :disabled="currentPage === totalPages - 1 || isAnimating"
          @click="nextPage"
        >
          <el-icon :size="20">
            <chevron-right20-filled />
          </el-icon>
        </button>
      </div>

      <!-- 页数指示器 -->
      <shortcut-pagination-dots
        v-if="showPagination"
        :current-page="currentPage"
        :total-pages="totalPages"
        @goto="goToPage"
      />
    </div>
  </section>
</template>
