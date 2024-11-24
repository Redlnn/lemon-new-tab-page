<script setup lang="ts">
import { ClearRound } from '@vicons/material'
import { ElMessage } from 'element-plus'
import type { TopSites } from 'wxt/browser'
import _ from 'lodash'
import { Pin16Regular, PinOff16Regular } from '@vicons/fluent'
import { h, onMounted, ref, watch } from 'vue'

import { i18n } from '@/.wxt/i18n'
import { useFocusStore } from '@/newtab/scripts/store'
import { useSettingsStore } from '@/newtab/scripts/store/settingsStore'
import { initBookmark, saveBookmark, useBookmarkStore } from '@/newtab/scripts/store/bookmarkStore'

import addBookmark from './components/addBookmark.vue'
import quickStartItem from './components/quickStartItem.vue'
import { blockSite, getTopSites } from './utils/topSites'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const bookmarkStore = useBookmarkStore()

const topSites = ref<TopSites.MostVisitedURL[]>([])
const mounted = ref(false)

async function reloadQS() {
  await initBookmark()
  const totalCellsNum =
    settingsStore.quickStart.quickStartColumns * settingsStore.quickStart.quickStartRows
  let tmpTopSites: TopSites.MostVisitedURL[] = await getTopSites()
  if (tmpTopSites === undefined || !settingsStore.quickStart.enableTopSites) {
    tmpTopSites = bookmarkStore.items
  }
  const bookmarkUrls = bookmarkStore.items.map((item) => item.url)
  tmpTopSites = tmpTopSites.filter((site) => !bookmarkUrls.includes(site.url))
  if (bookmarkStore.items.length < totalCellsNum) {
    topSites.value = tmpTopSites.slice(0, totalCellsNum - bookmarkStore.items.length - 1)
  }
}

function getQSSize() {
  return bookmarkStore.items.length + topSites.value.length + 1
}

async function removeBookmark(index: number) {
  const { url, title, favicon } = bookmarkStore.items[index]
  if (bookmarkStore.items.length > 1) {
    bookmarkStore.items = _.omit(bookmarkStore.items, index)
  } else {
    bookmarkStore.items = []
  }
  await saveBookmark(_.cloneDeep(bookmarkStore))
  ElMessage({
    message: h('p', null, [
      h(
        'span',
        { style: { color: 'var(--el-color-success)' } },
        i18n.t('newtab.quickstart.removePinnedMessage.content')
      ),
      h(
        'span',
        {
          style: { marginLeft: '20px', color: 'var(--el-color-primary)', cursor: 'pointer' },
          onClick: async () => {
            bookmarkStore.items.splice(index, 0, {
              url,
              title,
              favicon
            })
            await saveBookmark(_.cloneDeep(bookmarkStore))
            await reloadQS()
          }
        },
        i18n.t('newtab.quickstart.removePinnedMessage.revoke')
      )
    ]),
    type: 'success'
  })
}

async function sticky(url: string, title: string, favicon?: string) {
  bookmarkStore.items.push({
    url,
    title,
    favicon
  })
  await saveBookmark(_.cloneDeep(bookmarkStore))
  await reloadQS()
}

onMounted(async () => {
  await reloadQS()
  mounted.value = true
})
watch(() => settingsStore.quickStart.quickStartRows, reloadQS)
watch(() => settingsStore.quickStart.quickStartColumns, reloadQS)
watch(() => settingsStore.quickStart.enableTopSites, reloadQS)
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
      :class="[
        settingsStore.quickStart.showQuickStartContainerBg ? 'quickstart-contaniner-bg' : ''
      ]"
      :style="{
        pointerEvents: focusStore.isFocused ? 'none' : 'auto',
        maxWidth: `${settingsStore.quickStart.quickStartColumns * settingsStore.quickStart.quickStartItemWidth + 20}px`,
        maxHeight: `${settingsStore.quickStart.quickStartRows * 112 + 20}px`
      }"
    >
      <quick-start-item
        v-for="(site, index) in bookmarkStore.items"
        :key="index"
        :url="site.url"
        :title="site.title"
        :favicon="site.favicon"
        :qs-sites-size="getQSSize()"
        pined
      >
        <template #submenu>
          <el-dropdown-item>
            <span
              style="display: flex; align-items: center"
              @click="
                async () => {
                  removeBookmark(index)
                  await reloadQS()
                }
              "
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
        :qs-sites-size="getQSSize()"
        :favicon="site.favicon"
      >
        >
        <template #submenu>
          <el-dropdown-item>
            <span
              style="display: flex; align-items: center"
              @click="
                async () => {
                  await blockSite(site.url, reloadQS)
                  await reloadQS()
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
              @click="sticky(site.url, site.title || '')"
            >
              <el-icon>
                <pin16-regular />
              </el-icon>
              {{ i18n.t('newtab.quickstart.pin') }}
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
  z-index: 10;
  overflow: hidden;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &.quickstart-contaniner-bg {
    background-color: color-mix(in oklab, var(--el-bg-color), transparent 60%);
    box-shadow: var(--el-box-shadow-dark);
    border-radius: 10px;
    backdrop-filter: blur(3px);
  }

  html.dark &.quickstart-contaniner-bg {
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
    min-width: 80px;

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
      display: -webkit-box;
      -webkit-box-orient: vertical;
      line-clamp: 1;
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
