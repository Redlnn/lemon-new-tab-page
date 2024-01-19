<script setup lang="ts">
import { onBeforeMount, ref, onMounted, watch } from 'vue'
import type { TopSites } from 'webextension-polyfill'
import { ClearRound } from '@vicons/material'

import { useFocusStore, useSettingsStore } from '@/newtab/js/store'
import { getTopSites, getFaviconURL, blockSite } from '@/newtab/js/topSites'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()

const topSites = ref<TopSites.MostVisitedURL[]>([])
const mounted = ref(false)

async function reloadTopSites() {
  topSites.value = await getTopSites(settingsStore.topSitesColumns * settingsStore.topSitesRows)
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
    :style="{ opacity: mounted ? (focusStore.isFocused ? '0' : '1') : '1' }"
  >
    <el-scrollbar view-style="padding: 0 0 5px" always class="top-sites-scrollbar">
      <div
        class="top-sites"
        :style="{
          pointerEvents: focusStore.isFocused ? 'none' : 'auto',
          gridTemplateColumns: `repeat(${settingsStore.topSitesColumns}, 130px)`,
          gridTemplateRows: `repeat(${settingsStore.topSitesRows}, min-content)`
          // gridColumnGap: `${settingsStore.topSitesGap}px`,
          // gridRowGap: `${settingsStore.topSitesGap}px`
        }"
      >
        <div
          v-for="(site, index) in topSites"
          :key="index"
          class="top-sites-item"
          :style="{ margin: `${settingsStore.topSitesGap}px` }"
        >
          <a :href="site.url">
            <div class="site-icon">
              <span :style="{ backgroundImage: `url(${getFaviconURL(site.url)})` }"></span>
            </div>
            <div class="site-title">{{ site.title }}</div>
          </a>
          <el-icon
            class="block-site noselect"
            @click="
              async () => {
                await blockSite(site.url)
                await reloadTopSites()
              }
            "
          >
            <clear-round />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>
  </section>
</template>

<style scoped lang="scss">
.top-sites-wrapper {
  max-width: 80%;
  margin-top: 80px;
  transition: all 0.2s cubic-bezier(0.65, 0.05, 0.1, 1);
}

.top-sites {
  display: grid;
  z-index: 10;

  a {
    color: inherit;
    text-decoration: inherit;
  }

  .top-sites-item {
    position: relative;
    width: 110px;
    background-color: color-mix(in oklab, var(--el-bg-color), transparent 60%);
    backdrop-filter: blur(3px);
    padding: 10px 10px;
    border-radius: 10px;

    a {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    &:hover {
      background-color: color-mix(in oklab, var(--el-bg-color), transparent 30%);
    }

    .site-icon {
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

    .site-title {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      font-size: 13px;
      height: 18px;
      text-align: center;
      overflow-wrap: anywhere;
    }

    .block-site {
      position: absolute;
      top: 8px;
      right: 10px;
      font-size: 30px;
      padding: 5px;
      border-radius: 50%;
      transition: all 0.1s ease-in-out;
      cursor: pointer;
      color: transparent;

      &:hover {
        background-color: var(--el-bg-color);
        color: var(--el-text-color-primary);
        box-shadow: var(--el-box-shadow-lighter);
      }
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
