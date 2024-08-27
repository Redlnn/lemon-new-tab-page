<script setup lang="ts">
import { ClearRound } from '@vicons/material'
import { ElMessage } from 'element-plus'
import _ from 'lodash'
import { Pin16Regular, PinOff16Regular } from '@vicons/fluent'
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

const topSites = ref<chrome.topSites.MostVisitedURL[]>([])
const mounted = ref(false)

async function reloadQS() {
  bookmarkStore.items = (await readBookmark()).items
  const totalCellsNum = settingsStore.quickStartColumns * settingsStore.quickStartRows
  let tmpTopSites: chrome.topSites.MostVisitedURL[] = await getTopSites()
  for (let markIdx = 0; markIdx < bookmarkStore.items.length; markIdx++) {
    for (let topIdx = 0; topIdx < tmpTopSites.length; topIdx++) {
      if (bookmarkStore.items[markIdx].url === tmpTopSites[topIdx].url) {
        tmpTopSites.splice(topIdx, 1)
        continue
      }
    }
  }
  if (bookmarkStore.items.length < totalCellsNum) {
    topSites.value = tmpTopSites.slice(0, totalCellsNum - bookmarkStore.items.length - 1)
  }
}

function getQSSize() {
  return bookmarkStore.items.length + topSites.value.length + 1
}

async function removeBookmark(index: number) {
  const { url, title } = bookmarkStore.items[index]
  bookmarkStore.items = _.omit(bookmarkStore.items, index)
  await saveBookmark(bookmarkStore)
  ElMessage({
    message: h('p', null, [
      h('span', { style: { color: 'var(--el-color-success)' } }, '已移除该置顶链接'),
      h(
        'span',
        {
          style: { marginLeft: '20px', color: 'var(--el-color-primary)', cursor: 'pointer' },
          onClick: async () => {
            bookmarkStore.items.splice(index, 0, {
              url,
              title
            })
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
  bookmarkStore.items.push({
    url,
    title
  })
  await saveBookmark(bookmarkStore)
  await reloadQS()
}

onBeforeMount(async () => {
  await reloadQS()
})
onMounted(() => {
  mounted.value = true
})
watch(() => settingsStore.quickStartRows, reloadQS)
watch(() => settingsStore.quickStartColumns, reloadQS)
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
        maxWidth: `${settingsStore.quickStartColumns * settingsStore.quickStartItemWidth + 20}px`,
        maxHeight: `${settingsStore.quickStartRows * 112 + 20}px`
      }"
    >
      <quick-start-item
        v-for="(site, index) in bookmarkStore.items"
        :key="index"
        :url="site.url"
        :title="site.title"
        :qs-sites-size="getQSSize()"
        pined
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
                <pin-off16-regular />
              </el-icon>
              取消置顶
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
                <pin16-regular />
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
      position: relative;
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
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      font-size: 13px;
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
