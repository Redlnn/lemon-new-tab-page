<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import type { TopSites } from 'webextension-polyfill'
import { ClearRound, MoreVertRound } from '@vicons/material'

import { useFocusStore, useSettingsStore } from '@/newtab/js/store'
import { blockSite, getFaviconURL, getTopSites } from '@/newtab/js/topSites'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()

const topSites = ref<TopSites.MostVisitedURL[]>([])
const mounted = ref(false)

async function reloadTopSites() {
  topSites.value = await getTopSites(settingsStore.topSitesColumns * settingsStore.topSitesRows)
}

function getTopSiteItemWidth(TopSitesNum: number) {
  console.log(TopSitesNum)
  console.log(settingsStore.topSitesColumns * settingsStore.topSitesRows)
  if (
    TopSitesNum < settingsStore.topSitesColumns * settingsStore.topSitesRows &&
    TopSitesNum != 10
  ) {
    return 100 / TopSitesNum + '%'
  } else {
    return 100 / settingsStore.topSitesColumns + '%'
  }
}

onBeforeMount(async () => {
  await reloadTopSites()
})
onMounted(() => {
  mounted.value = true
})
watch(() => settingsStore.topSitesRows, reloadTopSites)
watch(() => settingsStore.topSitesColumns, reloadTopSites)
</script>

<template>
  <section
    class="top-sites-wrapper"
    :style="{
      opacity: mounted ? (focusStore.isFocused ? '0' : '1') : '1'
    }"
  >
    <div
      class="top-sites"
      :style="{
        pointerEvents: focusStore.isFocused ? 'none' : 'auto',
        maxWidth: `${settingsStore.topSitesColumns * settingsStore.topSitesItemWidth + 20}px`,
        maxHeight: `${settingsStore.topSitesRows * 112 + 20}px`
      }"
    >
      <div
        v-for="(site, index) in topSites"
        :key="index"
        class="top-sites-item"
        :style="{
          flexBasis: getTopSiteItemWidth(topSites.length),
          width: `${settingsStore.topSitesItemWidth}px`
        }"
      >
        <a :href="site.url">
          <div class="top-site-icon">
            <span :style="{ backgroundImage: `url(${getFaviconURL(site.url)})` }"></span>
          </div>
          <div class="top-site-title">{{ site.title }}</div>
        </a>
        <el-dropdown class="top-site-menu" trigger="click" placement="bottom-end" size="small">
          <span class="top-site-menu-icon">
            <el-icon>
              <more-vert-round />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <span
                  @click="
                    async () => {
                      await blockSite(site.url, reloadTopSites)
                      await reloadTopSites()
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
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.top-sites-wrapper {
  max-width: 80%;
  margin-top: 80px;
  transition: all 0.2s cubic-bezier(0.65, 0.05, 0.1, 1);
}

.top-sites {
  display: flex;
  flex-flow: row wrap;
  padding: 10px;
  background-color: color-mix(in oklab, var(--el-bg-color), transparent 60%);
  border-radius: 10px;
  backdrop-filter: blur(3px);
  z-index: 10;
  overflow: hidden;

  a {
    color: inherit;
    text-decoration: inherit;
  }

  .top-sites-item {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    flex: 0;

    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px;
    }

    &:hover {
      background-color: color-mix(in oklab, var(--el-bg-color), transparent 30%);
    }

    .top-site-icon {
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

    .top-site-title {
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

    &:hover .top-site-menu {
      color: var(--el-text-color-regular);
    }

    .top-site-menu {
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

    .top-site-menu-icon {
      width: 26px;
      height: 26px;
      font-size: 20px;
      padding: 3px;
    }
  }
}
</style>

<style lang="scss">
.top-sites-scrollbar {
  .el-scrollbar__thumb {
    --el-scrollbar-opacity: 0.4;
    --el-scrollbar-hover-opacity: 0.6;
    --el-scrollbar-bg-color: var(--el-bg-color);
    --el-scrollbar-hover-bg-color: var(--el-bg-color);
  }
}
</style>
