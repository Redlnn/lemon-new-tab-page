<script setup lang="ts">
import { OnLongPress } from '@vueuse/components'
import { useDebounceFn, useResizeObserver, useWindowSize } from '@vueuse/core'

import { Pin12Regular, PinOff16Regular, Star12Regular } from '@vicons/fluent'
import { AddRound, BlockRound, ContentCopyRound, OpenInNewRound } from '@vicons/material'
import type { DropdownInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'
// 由于 wxt/browser 缺少火狐的 topSites 类型定义，直接用官方的 webextension-polyfill
import type { TopSites } from 'webextension-polyfill'

import { browser } from '#imports'

import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'
import { useShortcutStore } from '@/shared/shortcut'

import usePerfClasses from '@newtab/composables/usePerfClasses'
import { useFocusStore } from '@newtab/shared/store'
import { isHasTouchDevice, isTouchEvent } from '@newtab/shared/touch'

import { useShortcutData } from './composables/useShortcutData'
import { useDockLayout } from './composables/useShortcutLayout'
import { useTopSitesMerge } from './composables/useTopSitesMerge'
import { pinShortcut, removeShortcut } from './utils/shortcut'
import { blockSite } from './utils/topSites'

defineProps<{
  onOpenAddDialog?: () => void
}>()

const perf = usePerfClasses(() => ({
  transparentOff: settings.perf.disableShortcutTransparent,
  blurOff: settings.perf.disableShortcutBlur
}))

const popperClass = perf('shortcut__menu-popper')

const { t } = useTranslation()
const focusStore = useFocusStore()
const settings = useSettingsStore()
const shortcutStore = useShortcutStore()

const { updateMaxCols, maxFitCols } = useDockLayout()

const refreshDebounced = useDebounceFn(refresh, 100)

const { topSites, shortcuts, mounted, topSitesNeedsReload } = useShortcutData(refreshDebounced)

async function refresh() {
  const _shortcuts = shortcutStore.items.slice()

  // 合并最常访问
  let mergedTop: TopSites.MostVisitedURL[] = []
  if (settings.dock.enableTopSites) {
    const topList = await useTopSitesMerge({
      shortcuts: _shortcuts,
      columns: 1,
      maxRows: 1,
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

// 根据屏幕宽度初始两个区块的可见项目
const visibleShortcuts = computed(() => shortcuts.value.slice(0, maxFitCols.value))
const visibleTopSites = computed(() =>
  topSites.value.slice(0, Math.max(0, maxFitCols.value - visibleShortcuts.value.length))
)

// 屏幕尺寸变化时更新最大列数
// useResizeObserver 会在开始观察时立即触发一次，因此不需要额外的 onMounted 刷新调用
useResizeObserver(document.documentElement, async () => {
  updateMaxCols()
  await refreshDebounced()
})

watch(
  () => [settings.dock.iconSize, settings.dock.limitCount, settings.dock.maxCount],
  async () => {
    updateMaxCols()
    await refreshDebounced()
  }
)

watch(
  () => settings.dock.enableTopSites,
  (enabled) => {
    if (enabled) {
      topSitesNeedsReload.value = true
    }
    refreshDebounced()
  }
)

const isHideDock = computed(() => {
  if (!mounted.value) {
    return '0'
  }

  if (!focusStore.isFocused) {
    return '1'
  }

  return settings.dock.showOnSearchFocus ? '1' : '0'
})

// ---- Dock 缩放逻辑（正弦波曲线，直接操作 DOM CSS 变量，不走响应式）----
const { width: windowWidth } = useWindowSize({ type: 'visual' })

const CURVE_RANGE = 200
const TRANSITION_DURATION = '0.1s'
const MIN_SCALE = 1
const MAX_SCALE = computed(() => (windowWidth.value < 500 ? 1.2 : 1.6))

const dockRef = ref<HTMLElement | null>(null)
// 按文档顺序存放所有需缩放的元素（item 与 gap 交替）
// 动态部分（v-for 生成）：每次更新前清空后重新收集
const scalableDynEls = shallowRef<HTMLElement[]>([])
// 静态部分（不在 v-for 内）：只在挂载时收集，不受 onBeforeUpdate 影响
const postSepGapEl = ref<HTMLElement | null>(null)
const addBtnEl = ref<HTMLElement | null>(null)

// 合并动态+静态，供 cacheNaturalCenters / updateScales 使用
const scalableEls = computed(() => {
  const els = [...scalableDynEls.value]
  if (postSepGapEl.value) els.push(postSepGapEl.value)
  if (addBtnEl.value) els.push(addBtnEl.value)
  return els
})
// 缓存元素在 scale=1 时的中心点 X 坐标，避免放大后位置偏移导致波形变形
let naturalCenters: number[] = []

function cacheNaturalCenters(): void {
  naturalCenters = scalableEls.value.map((el) => {
    if (!el) return 0
    const { left, width } = el.getBoundingClientRect()
    return left + width / 2
  })
}

function scaleCurve(curveCentreX: number, itemCentreX: number): number {
  const beginX = curveCentreX - CURVE_RANGE / 2
  const endX = curveCentreX + CURVE_RANGE / 2
  if (itemCentreX < beginX || itemCentreX > endX) return MIN_SCALE
  const amplitude = MAX_SCALE.value - MIN_SCALE
  const angle = ((itemCentreX - beginX) / CURVE_RANGE) * Math.PI
  return Math.sin(angle) * amplitude + MIN_SCALE
}

function updateScales(clientX: number | null): void {
  for (let i = 0; i < scalableEls.value.length; i++) {
    const el = scalableEls.value[i]
    if (!el) continue
    // 优先使用缓存的自然中心点，保证波形形状不随元素大小变化
    const center =
      naturalCenters[i] ?? el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2
    const scale = clientX === null ? MIN_SCALE : scaleCurve(clientX, center)
    el.style.setProperty('--scale', String(scale))
  }
}

let transitionTimer: ReturnType<typeof setTimeout> | null = null

function applyTransition(duration: string): void {
  dockRef.value?.style.setProperty('--td', duration)
}

function onMouseEnter(e: MouseEvent): void {
  if (settings.perf.disableDockScale) return

  if (transitionTimer) clearTimeout(transitionTimer)
  applyTransition(TRANSITION_DURATION)
  transitionTimer = setTimeout(() => applyTransition('0s'), 80)
  cacheNaturalCenters() // 在缩放发生前缓存自然位置
  updateScales(e.clientX)
}

function onMouseMove(e: MouseEvent): void {
  if (settings.perf.disableDockScale) return

  updateScales(e.clientX)
}

function onMouseLeave(): void {
  if (settings.perf.disableDockScale) return

  if (transitionTimer) clearTimeout(transitionTimer)
  applyTransition(TRANSITION_DURATION)
  updateScales(null)
  transitionTimer = setTimeout(() => applyTransition('0s'), 80)
}

// 每次 DOM 更新前只清空动态部分，静态元素 ref 不受影响
onBeforeUpdate(() => {
  scalableDynEls.value = []
})

function setScalableRef(el: unknown): void {
  let node: HTMLElement | null = null
  if (el instanceof HTMLElement) {
    node = el
  } else if (
    el !== null &&
    typeof el === 'object' &&
    '$el' in el &&
    el.$el instanceof HTMLElement
  ) {
    node = el.$el
  }
  if (node) scalableDynEls.value.push(node)
}

function setPostSepGapRef(el: unknown): void {
  postSepGapEl.value = el instanceof HTMLElement ? el : null
}

function setAddBtnRef(el: unknown): void {
  addBtnEl.value = el instanceof HTMLElement ? el : null
}

// ---- 右键上下文菜单 ----
const ctxDropdownRef = ref<DropdownInstance>()
const ctxPosition = ref<DOMRect>(DOMRect.fromRect({ x: 0, y: 0 }))
const ctxTriggerRef = ref({
  getBoundingClientRect: () => ctxPosition.value
})
const ctxItem = ref<{
  url: string
  title: string
  isPinned: boolean
  idx: number
} | null>(null)

function handleContextmenu(
  event: MouseEvent | TouchEvent | PointerEvent,
  item: { url: string; title: string; isPinned: boolean; idx: number }
): void {
  ctxItem.value = item

  let clientX = 0
  let clientY = 0

  if ('clientX' in event) {
    clientX = event.clientX
    clientY = event.clientY
  } else if ('touches' in event && event.touches[0]) {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  }

  ctxPosition.value = DOMRect.fromRect({ x: clientX, y: clientY })
  ctxDropdownRef.value?.handleOpen()
}

function ctxOpenInNewTab(): void {
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
  if (!ctxItem.value || !ctxItem.value.isPinned) return
  await removeShortcut(ctxItem.value.idx, shortcutStore, refreshDebounced)
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
</script>

<template>
  <div
    ref="dockRef"
    class="dock"
    :style="{
      opacity: isHideDock,
      pointerEvents: isHideDock === '0' ? 'none' : 'auto',
      '--item-size': settings.dock.iconSize + 'px',
      '--item-ratio': settings.dock.iconRatio * 100 + '%',
      '--gap-size': settings.dock.gap + 'px'
    }"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @contextmenu.stop.prevent
  >
    <template v-for="(item, idx) in visibleShortcuts" :key="`pin-${idx}`">
      <el-tooltip
        :content="item.title"
        placement="top"
        effect="light"
        :hide-after="0"
        :show-arrow="false"
        :enterable="false"
        transition="none"
      >
        <OnLongPress
          as="a"
          class="dock-item"
          :href="item.url"
          :ref="setScalableRef"
          :target="settings.dock.openInNewTab ? '_blank' : '_self'"
          @contextmenu.stop.prevent="
            (e: MouseEvent) =>
              handleContextmenu(e, {
                url: item.url,
                title: item.title,
                isPinned: true,
                idx
              })
          "
          @trigger="
            (e: PointerEvent) => {
              if (isHasTouchDevice && isTouchEvent(e))
                handleContextmenu(e, { url: item.url, title: item.title, isPinned: true, idx })
            }
          "
        >
          <img :src="item.favicon || getFaviconURL(item.url).value" alt="favicon" />
        </OnLongPress>
      </el-tooltip>
      <div class="dock-gap" :ref="setScalableRef"></div>
    </template>
    <!-- shortcuts 与 topSites 之间的分隔符，两者都有内容时才显示 -->
    <template v-if="visibleShortcuts.length && visibleTopSites.length">
      <div class="dock-separator"></div>
      <div class="dock-gap" :ref="setScalableRef"></div>
    </template>
    <template v-for="(item, j) in visibleTopSites" :key="`top-${j}`">
      <el-tooltip
        :content="item.title"
        placement="top"
        effect="light"
        :hide-after="0"
        :show-arrow="false"
        :enterable="false"
        transition="none"
      >
        <OnLongPress
          as="a"
          class="dock-item"
          :href="item.url"
          :ref="setScalableRef"
          :target="settings.dock.openInNewTab ? '_blank' : '_self'"
          @contextmenu.stop.prevent="
            (e: MouseEvent) =>
              handleContextmenu(e, {
                url: item.url,
                title: item.title || '',
                isPinned: false,
                idx: j
              })
          "
          @trigger="
            (e: PointerEvent) => {
              if (isHasTouchDevice && isTouchEvent(e))
                handleContextmenu(e, {
                  url: item.url,
                  title: item.title || '',
                  isPinned: false,
                  idx: j
                })
            }
          "
        >
          <img :src="item.favicon || getFaviconURL(item.url).value" alt="favicon" />
        </OnLongPress>
      </el-tooltip>
      <div class="dock-gap" :ref="setScalableRef"></div>
    </template>
    <div class="dock-separator"></div>
    <div class="dock-gap" :ref="setPostSepGapRef"></div>
    <div class="dock-item" :ref="setAddBtnRef" @click="onOpenAddDialog">
      <add-round />
    </div>

    <!-- 共享右键菜单 -->
    <el-dropdown
      ref="ctxDropdownRef"
      :virtual-ref="ctxTriggerRef"
      :show-arrow="false"
      virtual-triggering
      trigger="contextmenu"
      placement="top-start"
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
            <el-dropdown-item :icon="PinOff16Regular" divided @click="ctxUnpin">
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
  </div>
</template>

<style lang="scss">
@use '@newtab/styles/mixins/acrylic.scss' as acrylic;

.dock {
  position: fixed;
  bottom: 20px;
  left: 50%;
  display: flex;
  align-items: flex-end;
  max-width: 93%;
  height: calc(var(--item-size) + 10px);
  padding: 5px;
  overflow: visible;
  background-color: var(--le-bg-color-overlay-opacity-60);
  border-radius: 15px;
  box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
  transform: translateX(-50%);
  transition: opacity var(--el-transition-duration-fast) ease;

  @include acrylic.acrylic(10px, 1.2, 1.1);
}

.dock-item {
  display: inline-flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(var(--scale, 1) * var(--item-size));
  height: calc(var(--scale, 1) * var(--item-size));
  overflow: hidden;
  cursor: pointer;
  background-color: var(--le-bg-color-overlay-opacity-20);
  border-radius: calc(var(--scale, 1) * var(--item-size) * 0.25);
  transition:
    width var(--td, 0s),
    height var(--td, 0s),
    border-radius var(--td, 0s);

  img {
    width: 75%;
    width: var(--item-ratio);
    height: var(--item-ratio);
    object-fit: cover;
    border-radius: calc(var(--scale, 1) * var(--item-size) * 0.15);
    transition: border-radius var(--td, 0s);
  }

  svg {
    width: var(--item-ratio);
    height: var(--item-ratio);
    border-radius: 6px;
  }
}

.dock-gap {
  width: calc(var(--scale, 1) * var(--gap-size));
  min-width: var(--gap-size);
  height: calc(var(--scale, 1) * var(--item-size));
  margin-bottom: calc((var(--scale, 1) - 1) * var(--item-size));
  transition:
    width var(--td, 0s),
    height var(--td, 0s),
    margin-bottom var(--td, 0s);
}

.dock-separator {
  align-self: center;
  width: 1px;
  height: 60%;
  background-color: rgb(255 255 255 / 50%);
}
</style>
