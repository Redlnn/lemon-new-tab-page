<script setup lang="ts">
import { useDebounceFn, useEventListener, useResizeObserver, useWindowSize } from '@vueuse/core'

import {
  ChevronLeft20Filled,
  ChevronRight20Filled,
  Edit16Regular,
  Pin12Regular,
  PinOff16Regular,
  Star12Regular
} from '@vicons/fluent'
import { BlockRound, ContentCopyRound, OpenInNewRound } from '@vicons/material'
import type { DropdownInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'
// 由于 wxt/browser 缺少火狐的 topSites 类型定义，直接用官方的 webextension-polyfill
import type { TopSites } from 'webextension-polyfill'

import { browser } from '#imports'

import { useSettingsStore } from '@/shared/settings'
import { useShortcutStore } from '@/shared/shortcut'

import usePerfClasses from '@newtab/composables/usePerfClasses'
import { SHORTCUT_OPENED_MENU_CLOSE_FN } from '@newtab/shared/keys'
import { useFocusStore } from '@newtab/shared/store'
import { isOnlyTouchDevice } from '@newtab/shared/touch'

import AddShortcut from './components/AddShortcut.vue'
import ShortcutItem from './components/ShortcutItem.vue'
import ShortcutPaginationDots from './components/ShortcutPaginationDots.vue'
import { useShortcutData } from './composables/useShortcutData'
import { useShortcutDrag } from './composables/useShortcutDrag'
import { solveGridColumnFirst, usePagedGridLayout } from './composables/useShortcutLayout'
import { useShortcutPagination } from './composables/useShortcutPagination'
import { useTopSitesMerge } from './composables/useTopSitesMerge'
import { pinShortcut, removeShortcut } from './utils/shortcut'
import { blockSite } from './utils/topSites'

const { t } = useTranslation()

const focusStore = useFocusStore()
const settings = useSettingsStore()
const shortcutStore = useShortcutStore()

const { height } = useWindowSize({ type: 'visual' })

const props = defineProps<{
  onOpenAddDialog?: () => void
  onOpenEditDialog?: (index: number) => void
}>()

const { onOpenAddDialog, onOpenEditDialog } = props

const refreshDebounced = useDebounceFn(refresh, 100)

const { topSites, shortcuts, mounted, topSitesNeedsReload } = useShortcutData(refreshDebounced)

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

const { updateMaxCols, maxFitCols, maxFitRows } = usePagedGridLayout()
const slotsPerPage = computed(() => maxFitCols.value * maxFitRows.value)
const totalItemsCount = computed(() => allItems.value.length)

// 如果用户禁用翻页，则将用于分页计算的总项目数限制为每页格子数，确保只有一页
const paginationTotalItems = computed(() =>
  settings.shortcut.disablePaging
    ? Math.min(totalItemsCount.value, slotsPerPage.value)
    : totalItemsCount.value
)

// 分页逻辑
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

// 是否在指定页显示添加按钮
function showAddButtonForPage(pageIndex: number) {
  return pageIndex === totalPages.value - 1
}

// 是否在当前页显示添加按钮（始终在最后一页的最后一格）
const showAddButton = computed(() => showAddButtonForPage(currentPage.value))

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

// 当前页显示的项目
const currentPageItems = computed(() => getPageItems(currentPage.value))

// 前一页的项目（用于预加载）
const prevPageItems = computed(() => {
  // 如果有预加载目标页且向右跳（目标页 < 当前页），将目标页内容加载到 prev 位置
  if (preloadTargetPage.value !== null && preloadTargetPage.value < currentPage.value) {
    return getPageItems(preloadTargetPage.value)
  }
  return getPageItems(currentPage.value - 1)
})

// 后一页的项目（用于预加载）
const nextPageItems = computed(() => {
  // 如果有预加载目标页且向左跳（目标页 > 当前页），将目标页内容加载到 next 位置
  if (preloadTargetPage.value !== null && preloadTargetPage.value > currentPage.value) {
    return getPageItems(preloadTargetPage.value)
  }
  return getPageItems(currentPage.value + 1)
})

// 前一页是否显示添加按钮（避免模板中重复计算）
const showPrevPageAddButton = computed(() => {
  const pageIndex =
    preloadTargetPage.value !== null && preloadTargetPage.value < currentPage.value
      ? preloadTargetPage.value
      : currentPage.value - 1
  return showAddButtonForPage(pageIndex)
})

// 后一页是否显示添加按钮（避免模板中重复计算）
const showNextPageAddButton = computed(() => {
  const pageIndex =
    preloadTargetPage.value !== null && preloadTargetPage.value > currentPage.value
      ? preloadTargetPage.value
      : currentPage.value + 1
  return showAddButtonForPage(pageIndex)
})

// 记录当前打开的右键菜单关闭函数，实现全局唯一
const openedMenuCloseFn = ref<(() => void) | null>(null)
provide(SHORTCUT_OPENED_MENU_CLOSE_FN, openedMenuCloseFn)

// ---- 共享右键菜单 ----
const perf = usePerfClasses(() => ({
  transparentOff: settings.perf.disableShortcutTransparent,
  blurOff: settings.perf.disableShortcutBlur
}))
const popperClass = perf('shortcut__menu-popper')
const navBtnPerfClass = perf('shortcut__nav-btn')

const ctxDropdownRef = ref<DropdownInstance>()
const ctxPosition = shallowRef<DOMRect>(DOMRect.fromRect({ x: 0, y: 0 }))
const ctxTriggerRef = ref({ getBoundingClientRect: () => ctxPosition.value })
const ctxItem = shallowRef<{
  url: string
  title: string
  isPinned: boolean
  originalIndex: number
} | null>(null)

function openCtxMenu(
  event: MouseEvent | PointerEvent,
  item: { url: string; title: string; isPinned: boolean; originalIndex: number }
): void {
  // 关闭上一个
  if (openedMenuCloseFn.value) {
    openedMenuCloseFn.value()
  }
  ctxItem.value = item
  ctxPosition.value = DOMRect.fromRect({ x: event.clientX, y: event.clientY })
  ctxDropdownRef.value?.handleOpen()
  openedMenuCloseFn.value = () => ctxDropdownRef.value?.handleClose()
}

async function ctxOpenInNewTab(): Promise<void> {
  if (ctxItem.value) window.open(ctxItem.value.url, '_blank')
}

function ctxOpenInNewWindow(): void {
  if (ctxItem.value) browser.windows.create({ url: ctxItem.value.url })
}

function ctxCopyLink(): void {
  if (ctxItem.value) navigator.clipboard.writeText(ctxItem.value.url)
}

async function ctxCreateBookmark(): Promise<void> {
  if (!ctxItem.value) return
  const { url, title } = ctxItem.value
  const res = await browser.bookmarks.search({ url })
  if (res.length !== 0) {
    ElMessage.info(t('shortcut.bookmark.existing'))
    return
  }
  browser.bookmarks.create({ title, url }, (created) => {
    if (!created.parentId) return
    chrome.bookmarks.get(created.parentId, (nodes) => {
      const folderTitle = nodes?.[0]?.title ?? null
      ElMessage.success(t('shortcut.bookmark.success', { folder: folderTitle }))
    })
  })
}

async function ctxUnpin(): Promise<void> {
  if (!ctxItem.value?.isPinned) return
  await removeShortcut(ctxItem.value.originalIndex, shortcutStore, refreshDebounced)
}

async function ctxPin(): Promise<void> {
  if (!ctxItem.value || ctxItem.value.isPinned) return
  await pinShortcut(shortcutStore, refreshDebounced, ctxItem.value.url, ctxItem.value.title)
}

async function ctxBlockSite(): Promise<void> {
  if (!ctxItem.value || ctxItem.value.isPinned) return
  await blockSite(ctxItem.value.url, refreshDebounced)
  await refreshDebounced()
}

function ctxEdit(): void {
  if (!ctxItem.value?.isPinned) return
  onOpenEditDialog?.(ctxItem.value.originalIndex)
}

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

// 网格解算
const grid = computed(() => {
  // 多页 → 固定布局
  if (totalPages.value > 1) {
    return { cols: maxFitCols.value, rows: maxFitRows.value }
  }
  const currentCount = currentPageItems.value.length
  const isLastPage = currentPage.value === totalPages.value - 1
  // 单页 → 根据内容收缩
  return solveGridColumnFirst(
    isLastPage ? currentCount + 1 : currentCount,
    maxFitCols.value,
    maxFitRows.value
  )
})

const displayColumns = computed(() => grid.value.cols)
const displayRows = computed(() => grid.value.rows)

const shortcutContainerRef = useTemplateRef('shortcutContainerRef')
const prevPageContainerRef = useTemplateRef('prevPageContainerRef')
const currentPageContainerRef = useTemplateRef('currentPageContainerRef')
const nextPageContainerRef = useTemplateRef('nextPageContainerRef')

async function refresh() {
  // 刷新时重置打开的菜单，防止布局或数据变化导致索引失效
  if (openedMenuCloseFn.value) {
    openedMenuCloseFn.value()
    openedMenuCloseFn.value = null
  }

  const _shortcuts = shortcutStore.items.slice()

  // 合并最常访问
  let mergedTop: TopSites.MostVisitedURL[] = []
  if (settings.shortcut.enableTopSites) {
    const topList = await useTopSitesMerge({
      shortcuts: _shortcuts,
      columns: displayColumns.value,
      maxRows: displayRows.value,
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

const { isDragging } = useShortcutDrag(currentPageContainerRef, shortcuts, refreshDebounced)

// 设置滑动手势支持（绑定到 slide-viewport，以便切换时能切换 overflow）
setupSwipe(
  shortcutContainerRef,
  prevPageContainerRef,
  currentPageContainerRef,
  nextPageContainerRef,
  isDragging
)

// 开始拖拽时关闭已打开的菜单
watch(isDragging, (dragging) => {
  if (dragging && openedMenuCloseFn.value) {
    openedMenuCloseFn.value()
    openedMenuCloseFn.value = null
  }
})

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

// useResizeObserver 会在开始观察时立即触发一次，因此不需要额外的 onMounted 刷新调用
useResizeObserver(document.documentElement, async () => {
  updateMaxCols()
  await refreshDebounced()
})

watch(
  () => [
    settings.shortcut.columns,
    settings.shortcut.rows,
    settings.shortcut.iconSize,
    settings.shortcut.itemMarginH,
    settings.shortcut.itemMarginV,
    settings.shortcut.disablePaging
  ],
  async () => {
    updateMaxCols()
    await refreshDebounced()
  }
)

watch(isOnlyTouchDevice, updateMaxCols)

watch(
  () => settings.shortcut.enableTopSites,
  (enabled) => {
    if (enabled) {
      topSitesNeedsReload.value = true
    }
    refreshDebounced()
  }
)

const isHideShortcut = computed(() => {
  if (!mounted.value) {
    return '0'
  }

  if (!focusStore.isFocused) {
    return '1'
  }

  return settings.shortcut.showOnSearchFocus ? '1' : '0'
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
  gridGap: `${settings.shortcut.itemMarginV}px ${settings.shortcut.itemMarginH}px`,
  '--icon_size': `${settings.shortcut.iconSize}px`,
  '--icon_ratio': `${settings.shortcut.iconRatio}`
}))
</script>

<template>
  <section
    class="shortcut"
    :style="{
      opacity: isHideShortcut,
      paddingTop: `${settings.shortcut.marginTop / 2}px`,
      marginTop: height > 500 ? `${settings.shortcut.marginTop / 2}px` : undefined
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
            navBtnPerfClass
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
          <div ref="shortcutContainerRef" class="shortcut__slide-viewport">
            <div class="shortcut__slide-track">
              <!-- 前一页 -->
              <div
                v-if="currentPage > 0"
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
                  :on-context-menu="(e) => openCtxMenu(e, item)"
                />
                <add-shortcut
                  v-if="showPrevPageAddButton"
                  :show-button="true"
                  :tabindex="false"
                  :on-open="onOpenAddDialog"
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
                  :on-context-menu="(e) => openCtxMenu(e, item)"
                  :tabindex="focusStore.isFocused ? -1 : 0"
                />

                <!-- 添加快捷方式按钮（始终在最后一页最后一格） -->
                <add-shortcut :show-button="showAddButton" :on-open="onOpenAddDialog" />
              </div>

              <!-- 后一页 -->
              <div
                v-if="currentPage < totalPages - 1"
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
                  :on-context-menu="(e) => openCtxMenu(e, item)"
                />
                <add-shortcut
                  v-if="showNextPageAddButton"
                  :show-button="true"
                  :tabindex="false"
                  :on-open="onOpenAddDialog"
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
            navBtnPerfClass
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

    <!-- 共享右键菜单 -->
    <el-dropdown
      ref="ctxDropdownRef"
      :virtual-ref="ctxTriggerRef"
      :show-arrow="false"
      virtual-triggering
      trigger="contextmenu"
      placement="bottom-start"
      :popper-options="{
        modifiers: [{ name: 'offset', options: { offset: [0, 0] } }]
      }"
      :popper-class="popperClass"
    >
      <template #dropdown>
        <el-dropdown-menu class="noselect">
          <el-dropdown-item :icon="OpenInNewRound" @click="ctxOpenInNewTab">
            <span>{{ t('settings:common.openInNewTab') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :icon="OpenInNewRound" @click="ctxOpenInNewWindow">
            <span>{{ t('settings:common.openInNewWindow') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :icon="ContentCopyRound" @click="ctxCopyLink">
            <span>{{ t('settings:common.copyLink') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :icon="Star12Regular" @click="ctxCreateBookmark">
            <span>{{ t('shortcut.bookmark.add') }}</span>
          </el-dropdown-item>
          <template v-if="ctxItem?.isPinned">
            <el-dropdown-item :icon="Edit16Regular" divided @click="ctxEdit">
              <span>{{ t('common.edit') }}</span>
            </el-dropdown-item>
            <el-dropdown-item :icon="PinOff16Regular" @click="ctxUnpin">
              <span>{{ t('shortcut.unpin') }}</span>
            </el-dropdown-item>
          </template>
          <template v-else>
            <el-dropdown-item :icon="Pin12Regular" divided @click="ctxPin">
              <span>{{ t('shortcut.pin') }}</span>
            </el-dropdown-item>
            <el-dropdown-item :icon="BlockRound" @click="ctxBlockSite">
              <span>{{ t('shortcut.hide') }}</span>
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </section>
</template>
