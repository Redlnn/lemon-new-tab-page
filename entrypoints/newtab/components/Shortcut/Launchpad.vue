<script setup lang="ts">
import { onKeyStroke, useSwipe, useWindowSize } from '@vueuse/core'

import { useTranslation } from 'i18next-vue'

import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'
import { useShortcutStore } from '@/shared/shortcut'

import { getTopSites } from './utils/topSites'

const model = defineModel<boolean>({ required: true })

const { t } = useTranslation()
const settings = useSettingsStore()
const shortcutStore = useShortcutStore()

const { width: windowWidth } = useWindowSize({ type: 'visual' })

// ---- 配置 ----
const COLS = computed(() => (windowWidth.value <= 600 ? 4 : windowWidth.value <= 1000 ? 5 : 7))
const ROWS = 2

const pageSize = computed(() => COLS.value * ROWS)

// ---- 状态 ----
const query = ref('')
const page = ref(0)
const containerRef = useTemplateRef<HTMLElement>('container')
const searchInputRef = useTemplateRef<{ focus: () => void }>('searchInput')

const shortcuts = ref<{ url: string; title: string; favicon?: string }[]>([])
const topSites = ref<{ url: string; title: string; favicon?: string }[]>([])
const allItems = computed(() => [...shortcuts.value, ...topSites.value])

const isSearching = computed(() => query.value.trim().length > 0)

const filteredItems = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return allItems.value
  return allItems.value.filter(
    (item) => item.title?.toLowerCase().includes(q) || item.url.toLowerCase().includes(q)
  )
})

const pageCount = computed(() => Math.max(1, Math.ceil(allItems.value.length / pageSize.value)))

const currentItems = computed(() => {
  if (isSearching.value) return filteredItems.value
  const start = page.value * pageSize.value
  return allItems.value.slice(start, start + pageSize.value)
})

// ---- 数据获取 ----
async function refresh() {
  shortcuts.value = shortcutStore.items.slice()
  if (settings.dock.enableTopSites) {
    try {
      const sites = await getTopSites()
      const shortcutUrls = new Set(shortcuts.value.map((s) => s.url))
      topSites.value = sites
        .filter((s) => s.url && !shortcutUrls.has(s.url))
        .map((s) => {
          let title = s.title?.trim()
          if (!title) {
            try {
              title = new URL(s.url).hostname.replace(/^www\./, '')
            } catch {
              title = s.url
            }
          }
          return { url: s.url, title }
        })
    } catch {
      topSites.value = []
    }
  } else {
    topSites.value = []
  }
}

// ---- 翻页 ----
function prevPage() {
  if (page.value > 0) page.value--
}

function nextPage() {
  if (page.value < pageCount.value - 1) page.value++
}

// ---- 关闭 ----
function close() {
  model.value = false
}

// ---- 滑动翻页（移动端）----
useSwipe(containerRef, {
  onSwipeEnd(_e, dir) {
    if (dir === 'left') nextPage()
    else if (dir === 'right') prevPage()
  }
})

// ---- 键盘 ----
onKeyStroke('Escape', (e) => {
  if (model.value) {
    e.preventDefault()
    close()
  }
})

onKeyStroke('ArrowLeft', (e) => {
  if (model.value && !isSearching.value) {
    e.preventDefault()
    prevPage()
  }
})

onKeyStroke('ArrowRight', (e) => {
  if (model.value && !isSearching.value) {
    e.preventDefault()
    nextPage()
  }
})

// ---- 打开时重置 & 刷新 ----
watch(model, async (v) => {
  if (v) {
    query.value = ''
    page.value = 0
    await refresh()
    await nextTick()
    searchInputRef.value?.focus()
  }
})

// 搜索时回到第0页
watch(query, () => {
  page.value = 0
})

// 页数变化时确保当前页有效
watch(pageCount, (count) => {
  if (page.value >= count) page.value = Math.max(0, count - 1)
})

// ---- 点击打开 ----
function openItem(url: string) {
  window.open(url, settings.dock.openInNewTab ? '_blank' : '_self')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="launchpad-fade">
      <div v-if="model" class="launchpad-overlay noselect" @click.self="close">
        <div class="launchpad-wrapper" ref="container">
          <!-- 搜索栏 -->
          <div class="launchpad-search">
            <el-input
              ref="searchInput"
              v-model="query"
              :placeholder="t('dock.launchpad.search')"
              clearable
              size="large"
              class="launchpad-search__input"
            >
              <template #prefix>
                <el-icon :size="16">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                    />
                  </svg>
                </el-icon>
              </template>
            </el-input>
          </div>

          <!-- 图标网格 -->
          <Transition name="launchpad-page" mode="out-in">
            <div
              :key="isSearching ? 'search' : page"
              class="launchpad-grid"
              :style="{ '--lp-cols': COLS }"
            >
              <div
                v-for="item in currentItems"
                :key="item.url"
                class="launchpad-item"
                @click="openItem(item.url)"
              >
                <div class="launchpad-item__icon">
                  <img :src="item.favicon || getFaviconURL(item.url).value" alt="" />
                </div>
                <div class="launchpad-item__label">{{ item.title }}</div>
              </div>
              <!-- 无结果 -->
              <div v-if="currentItems.length === 0" class="launchpad-empty">
                {{ t('dock.launchpad.empty') }}
              </div>
            </div>
          </Transition>

          <!-- 分页控制（非搜索模式，多于1页时显示） -->
          <div v-if="!isSearching && pageCount > 1" class="launchpad-pagination">
            <button class="launchpad-arrow" :disabled="page === 0" @click="prevPage">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
              </svg>
            </button>
            <div class="launchpad-dots">
              <span
                v-for="i in pageCount"
                :key="i"
                class="launchpad-dot"
                :class="{ 'launchpad-dot--active': page === i - 1 }"
                @click="page = i - 1"
              />
            </div>
            <button class="launchpad-arrow" :disabled="page === pageCount - 1" @click="nextPage">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
.launchpad-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(0 0 0 / 55%);
  -webkit-backdrop-filter: blur(40px) saturate(1.5);
  backdrop-filter: blur(40px) saturate(1.5);
}

.launchpad-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  max-height: 100vh;
  padding: 60px 40px 40px;
  overflow: hidden;

  @media (width <= 600px) {
    padding: 40px 16px 30px;
  }
}

.launchpad-search {
  width: 320px;
  max-width: 90vw;
  margin-bottom: 48px;

  @media (width <= 600px) {
    margin-bottom: 30px;
  }

  &__input {
    --el-input-bg-color: rgb(255 255 255 / 20%);
    --el-input-border-color: rgb(255 255 255 / 30%);
    --el-input-hover-border-color: rgb(255 255 255 / 60%);
    --el-input-focus-border-color: rgb(255 255 255 / 80%);
    --el-input-text-color: #fff;
    --el-input-placeholder-color: rgb(255 255 255 / 55%);
    --el-input-icon-color: rgb(255 255 255 / 65%);
    --el-input-clear-hover-color: #fff;

    .el-input__wrapper {
      border-radius: 30px;
      box-shadow: 0 0 0 1px var(--el-input-border-color);
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);

      &:hover {
        box-shadow: 0 0 0 1px var(--el-input-hover-border-color);
      }

      &.is-focus {
        box-shadow: 0 0 0 1px var(--el-input-focus-border-color);
      }
    }
  }
}

.launchpad-grid {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(var(--lp-cols, 7), 1fr);
  gap: 8px 0;
  align-content: start;
  width: 100%;
  max-width: 1000px;
}

.launchpad-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 16px;
  transition:
    background-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background-color: rgb(255 255 255 / 12%);
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.95);
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    margin-bottom: 8px;
    overflow: hidden;
    border-radius: 18px;

    // background-color: var(--el-fill-color-lighter);
    // box-shadow: 0 2px 8px rgb(0 0 0 / 20%);

    @media (width <= 800px) {
      width: 58px;
      height: 58px;
      border-radius: 14px;
    }

    @media (width <= 600px) {
      width: 48px;
      height: 48px;
      border-radius: 12px;
    }

    img {
      width: 75%;
      height: 75%;
      object-fit: contain;
      border-radius: 10px;

      // filter: drop-shadow(0 0 3px rgb(0 0 0 / 30%));
    }
  }

  &__label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    text-shadow: 0 1px 4px rgb(0 0 0 / 40%);
  }
}

.launchpad-empty {
  display: flex;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 16px;
  color: rgb(255 255 255 / 50%);
}

.launchpad-pagination {
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  align-items: center;
  margin-top: 32px;
}

.launchpad-dots {
  display: flex;
  gap: 8px;
}

.launchpad-dot {
  width: 7px;
  height: 7px;
  cursor: pointer;
  background-color: rgb(255 255 255 / 35%);
  border-radius: 50%;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background-color: rgb(255 255 255 / 65%);
  }

  &--active {
    background-color: #fff;
    transform: scale(1.2);
  }
}

.launchpad-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  overflow: hidden;
  color: rgb(255 255 255 / 70%);
  cursor: pointer;
  background: rgb(255 255 255 / 12%);
  border: none;
  border-radius: 50%;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover:not(:disabled) {
    color: #fff;
    background: rgb(255 255 255 / 25%);
  }

  &:disabled {
    cursor: default;
    opacity: 0.3;
  }
}

/* ---- 入场/离场动画 ---- */
.launchpad-fade-enter-active,
.launchpad-fade-leave-active {
  transition:
    opacity 0.3s ease,
    backdrop-filter 0.3s ease;

  .launchpad-wrapper {
    transition: transform 0.3s ease;
  }
}

.launchpad-fade-enter-from,
.launchpad-fade-leave-to {
  opacity: 0;

  .launchpad-wrapper {
    transform: scale(1.05);
  }
}

/* ---- 翻页动画 ---- */
.launchpad-page-enter-active,
.launchpad-page-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.launchpad-page-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.launchpad-page-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
</style>
