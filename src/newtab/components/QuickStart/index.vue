<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { TopSites } from 'webextension-polyfill'
import _ from 'lodash'
import { ClearRound, VerticalAlignTopRound } from '@vicons/material'
import { h, onBeforeMount, onMounted, ref, watch } from 'vue'

import {
  readBookmark,
  saveBookmark,
  useBookmarkStore,
  useFocusStore,
  useSettingsStore
} from '@/newtab/js/store'

import addBookmark from './components/addBookmark.vue'
import quickStartItem from './components/quickStartItem.vue'
import { blockSite, getTopSites } from './utils/topSites'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const bookmarkStore = useBookmarkStore()

const topSites = ref<TopSites.MostVisitedURL[]>([])
const mounted = ref(false)

async function reloadQS() {
  bookmarkStore.items = (await readBookmark()).items
  const totalCellsNum = settingsStore.QuickStartColumns * settingsStore.QuickStartRows
  const bookmarkNum = Object.keys(bookmarkStore.items).length
  let tmp: TopSites.MostVisitedURL[] = await getTopSites()
  for (const idx in bookmarkStore.items) {
    for (let i = 0; i < tmp.length; i++) {
      if (bookmarkStore.items[idx].url === tmp[i].url) {
        tmp.splice(i, 1)
        continue
      }
    }
  }
  if (bookmarkNum < totalCellsNum) {
    topSites.value = tmp.slice(0, totalCellsNum - bookmarkNum - 1)
  }
}

function getQSSize() {
  return Object.keys(bookmarkStore.items).length + topSites.value.length + 1
}

async function removeBookmark(index: number) {
  const { url, title } = bookmarkStore.items[index]
  bookmarkStore.items = _.omit(bookmarkStore.items, index)
  await saveBookmark(bookmarkStore)
  ElMessage({
    message: h('p', null, [
      h('span', { style: { color: 'var(--el-color-success)' } }, '已移除快捷方式'),
      h(
        'span',
        {
          style: { marginLeft: '20px', color: 'var(--el-color-primary)', cursor: 'pointer' },
          onClick: async () => {
            bookmarkStore.items[index] = {
              url,
              title
            }
            await reloadQS()
          }
        },
        '撤销'
      )
    ]),
    type: 'success'
  })
}

async function sticky(url: string, title: string) {
  const bookmarkKeys = Object.keys(bookmarkStore.items)
  let newIndex = 0
  if (bookmarkKeys.length > 0) {
    newIndex = parseInt(bookmarkKeys[bookmarkKeys.length - 1]) + 1
  }
  bookmarkStore.items[newIndex] = {
    url,
    title
  }
  await reloadQS()
}

onBeforeMount(async () => {
  await reloadQS()
})
onMounted(() => {
  mounted.value = true
})
watch(() => settingsStore.QuickStartRows, reloadQS)
watch(() => settingsStore.QuickStartColumns, reloadQS)

bookmarkStore.$subscribe(
  async (mutation, state) => {
    await saveBookmark(state)
  },
  { detached: true }
)
</script>

<template>
  <section
    class="quickstart-wrapper"
    :style="{
      opacity: mounted ? (focusStore.isFocused ? '0' : '1') : '1'
    }"
  >
    <div
      class="quickstart-contaniner"
      :style="{
        pointerEvents: focusStore.isFocused ? 'none' : 'auto',
        maxWidth: `${settingsStore.QuickStartColumns * settingsStore.QuickStartItemWidth + 20}px`,
        maxHeight: `${settingsStore.QuickStartRows * 112 + 20}px`
      }"
    >
      <quick-start-item
        v-for="(site, index) in bookmarkStore.items"
        :key="index"
        :url="site.url"
        :title="site.title"
        :qs-sites-size="getQSSize()"
      >
        <template #submenu>
          <el-dropdown-item>
            <span
              @click="
                async () => {
                  removeBookmark(index)
                  await reloadQS()
                }
              "
              style="display: flex; align-items: center"
            >
              <el-icon>
                <clear-round />
              </el-icon>
              移除
            </span>
          </el-dropdown-item>
        </template>
      </quick-start-item>
      <quick-start-item
        v-for="(site, index) in topSites"
        :key="index"
        :url="site.url"
        :title="site.title || ''"
        :qs-sites-size="getQSSize()"
      >
        <template #submenu>
          <el-dropdown-item>
            <span
              @click="
                async () => {
                  await blockSite(site.url, reloadQS)
                  await reloadQS()
                }
              "
              style="display: flex; align-items: center"
            >
              <el-icon>
                <clear-round />
              </el-icon>
              移除
            </span>
          </el-dropdown-item>
          <el-dropdown-item>
            <span
              @click="sticky(site.url, site.title || '')"
              style="display: flex; align-items: center"
            >
              <el-icon>
                <vertical-align-top-round />
              </el-icon>
              置顶
            </span>
          </el-dropdown-item>
        </template>
      </quick-start-item>
      <add-bookmark :quick-start-size="getQSSize" :reload="reloadQS" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.quickstart-wrapper {
  max-width: 80%;
  margin-top: 80px;
  transition: all 0.2s cubic-bezier(0.65, 0.05, 0.1, 1);
}

.quickstart-contaniner {
  display: flex;
  flex-flow: row wrap;
  padding: 10px;
  background-color: color-mix(in oklab, var(--el-bg-color), transparent 60%);
  box-shadow: var(--el-box-shadow-dark);
  border-radius: 10px;
  backdrop-filter: blur(3px);
  z-index: 10;
  overflow: hidden;

  html.dark & {
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
  a {
    color: inherit;
    text-decoration: inherit;
  }

  .quickstart-item {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    flex: 0;

    .quickstart-item-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px;
    }

    &:hover {
      background-color: color-mix(in oklab, var(--el-bg-color), transparent 30%);
    }

    .quickstart-icon {
      width: 50px;
      height: 50px;
      margin: 10px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      background: color-mix(in oklab, var(--el-bg-color), transparent 10%);

      span {
        display: block;
        width: 30px;
        height: 30px;
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
      }
    }

    .quickstart-title {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      font-size: 13px;
      height: 18px;
      margin-bottom: 8px;
      text-align: center;
      overflow-wrap: anywhere;
    }

    &:hover .quickstart-menu {
      color: var(--el-text-color-regular);
    }

    .quickstart-menu {
      position: absolute;
      top: 6px;
      right: 6px;
      border-radius: 50%;
      color: transparent;
      transition: all 0.1s ease-in-out;
      overflow: hidden;
      cursor: pointer;

      & > span {
        outline: none;
      }

      &:hover {
        background-color: var(--el-bg-color);
        color: var(--el-text-color-primary);
        box-shadow: var(--el-box-shadow-lighter);
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
