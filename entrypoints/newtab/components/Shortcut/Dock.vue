<script setup lang="ts">
import { OnLongPress } from '@vueuse/components'
import { useDebounceFn, useResizeObserver, useWindowSize } from '@vueuse/core'

import { Apps24Regular } from '@vicons/fluent'
import { AddRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'
import { useShortcutStore } from '@/shared/shortcut'

import usePerfClasses from '@newtab/composables/usePerfClasses'
import { useFocusStore } from '@newtab/shared/store'
import { isHasTouchDevice, isTouchEvent } from '@newtab/shared/touch'

import ShortcutContextMenu from './components/ShortcutContextMenu.vue'
import type { CtxShortcutItem } from './composables/useShortcutContextMenu'
import { useShortcutData } from './composables/useShortcutData'
import { useDockLayout } from './composables/useShortcutLayout'
import { useTopSitesMerge } from './composables/useTopSitesMerge'
import Launchpad from './Launchpad.vue'

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
  shortcuts.value = shortcutStore.items.slice()

  // 合并最常访问
  if (settings.dock.enableTopSites) {
    topSites.value = await useTopSitesMerge({
      shortcuts: shortcuts.value,
      columns: 1,
      maxRows: 1,
      force: topSitesNeedsReload.value,
      noCap: true // 不截断，获取所有可用的 top sites
    })
    topSitesNeedsReload.value = false
  } else {
    topSites.value = []
  }

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
  if (!mounted.value) return '0'
  if (!focusStore.isFocused) return '1'
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
// 启动台入口（静态）
const launchpadBtnEl = ref<HTMLElement | null>(null)
const showLaunchpad = ref(false)

// 合并动态+静态，供 cacheNaturalCenters / updateScales 使用
const scalableEls = computed(() => {
  const els: HTMLElement[] = []
  if (launchpadBtnEl.value) els.push(launchpadBtnEl.value)
  els.push(...scalableDynEls.value)
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

// 追踪当前交互是否来自触屏，用于混合设备（鼠标+触屏）的判断
const isUsingTouch = ref(false)

function onPointerEnter(e: PointerEvent): void {
  isUsingTouch.value = e.pointerType !== 'mouse'
}

function applyTransition(duration: string): void {
  dockRef.value?.style.setProperty('--td', duration)
}

function onMouseEnter(e: MouseEvent): void {
  if (settings.perf.disableDockScale || isUsingTouch.value) return

  if (transitionTimer) clearTimeout(transitionTimer)
  applyTransition(TRANSITION_DURATION)
  transitionTimer = setTimeout(() => applyTransition('0s'), 80)
  cacheNaturalCenters() // 在缩放发生前缓存自然位置
  updateScales(e.clientX)
}

function onMouseMove(e: MouseEvent): void {
  if (settings.perf.disableDockScale || isUsingTouch.value) return

  updateScales(e.clientX)
}

function onMouseLeave(): void {
  if (settings.perf.disableDockScale || isUsingTouch.value) return

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

function setLaunchpadBtnRef(el: unknown): void {
  launchpadBtnEl.value = el instanceof HTMLElement ? el : null
}

// ---- 右键上下文菜单 ----
const ctxMenuRef = useTemplateRef<InstanceType<typeof ShortcutContextMenu>>('ctxMenuRef')

function handleContextmenu(
  event: MouseEvent | TouchEvent | PointerEvent,
  item: CtxShortcutItem
): void {
  ctxMenuRef.value?.open(event, item)
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
    @pointerenter="onPointerEnter"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @contextmenu.stop.prevent
  >
    <!--  -->
    <!-- 启动台固定入口 -->
    <template v-if="settings.dock.showLaunchpad">
      <el-tooltip
        :content="t('dock.launchpad.title')"
        placement="top"
        effect="light"
        :hide-after="0"
        :show-arrow="false"
        :enterable="false"
        :disabled="isUsingTouch"
        transition="none"
      >
        <div
          role="button"
          tabindex="0"
          class="dock-item"
          :ref="setLaunchpadBtnRef"
          @click="showLaunchpad = !showLaunchpad"
        >
          <apps24-regular />
        </div>
      </el-tooltip>
      <div class="dock-gap" :ref="setScalableRef"></div>
    </template>
    <template v-for="(item, idx) in visibleShortcuts" :key="`pin-${idx}`">
      <el-tooltip
        :content="item.title"
        placement="top"
        effect="light"
        :hide-after="0"
        :show-arrow="false"
        :enterable="false"
        :disabled="isUsingTouch"
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
                originalIndex: idx
              })
          "
          @trigger="
            (e: PointerEvent) => {
              if (isHasTouchDevice && isTouchEvent(e))
                handleContextmenu(e, {
                  url: item.url,
                  title: item.title,
                  isPinned: true,
                  originalIndex: idx
                })
            }
          "
        >
          <img :src="item.favicon || getFaviconURL(item.url).value" alt="favicon" />
        </OnLongPress>
      </el-tooltip>
      <div class="dock-gap" :ref="setScalableRef"></div>
    </template>
    <template v-if="visibleShortcuts.length > 0 || settings.dock.showLaunchpad">
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
        :disabled="isUsingTouch"
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
                originalIndex: j
              })
          "
          @trigger="
            (e: PointerEvent) => {
              if (isHasTouchDevice && isTouchEvent(e))
                handleContextmenu(e, {
                  url: item.url,
                  title: item.title || '',
                  isPinned: false,
                  originalIndex: j
                })
            }
          "
        >
          <img :src="item.favicon || getFaviconURL(item.url).value" alt="favicon" />
        </OnLongPress>
      </el-tooltip>
      <div v-if="j !== visibleTopSites.length - 1" class="dock-gap" :ref="setScalableRef"></div>
    </template>
    <template v-if="!settings.dock.showLaunchpad">
      <div class="dock-separator"></div>
      <div class="dock-gap" :ref="setPostSepGapRef"></div>
      <div class="dock-item" :ref="setAddBtnRef" @click="onOpenAddDialog">
        <add-round />
      </div>
    </template>

    <!-- 启动台覆盖层 -->
    <Launchpad v-model="showLaunchpad" :on-open-add-dialog="onOpenAddDialog" />

    <!-- 共享右键菜单 -->
    <shortcut-context-menu
      ref="ctxMenuRef"
      placement="top-start"
      :popper-class="popperClass"
      :refresh-fn="refreshDebounced"
    />
  </div>
</template>

<style lang="scss">
@use '@newtab/styles/mixins/acrylic.scss' as acrylic;

.dock {
  position: fixed;
  bottom: 20px;
  left: 50%;
  z-index: 2;
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
  transition:
    opacity var(--el-transition-duration-fast) ease,
    bottom var(--el-transition-duration-fast) ease;

  @include acrylic.acrylic(10px, 1.2, 1.1);
}

.app:has(.yiyan) {
  .dock {
    @media (height <= 800px) {
      bottom: 10px;
    }
  }
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

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: -2px;
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
