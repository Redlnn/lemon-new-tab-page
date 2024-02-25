<script setup lang="ts">
import { searchEngines } from '@/newtab/js/api/search'
import { useFocusStore, useSettingsStore } from '@/newtab/js/store'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
</script>

<template>
  <el-tooltip
    ref="searchEngineMenu"
    trigger="click"
    :disabled="!focusStore.isFocused"
    :show-arrow="false"
    popper-class="search-engine-menu"
    placement="bottom-start"
    effect="customized"
    raw-content
  >
    <template #content>
      <div
        v-for="(item, index) in searchEngines"
        :key="index"
        class="search-engine-menu-item"
        :class="{ active: settingsStore.selectedSearchEngine === index }"
        @click="settingsStore.selectedSearchEngine = index"
      >
        <div style="display: flex; align-items: center">
          <el-icon><component :is="item['icon']" /></el-icon>
          <span>{{ item.name }}</span>
        </div>
        <div
          v-if="index === settingsStore.selectedSearchEngine"
          style="font-size: 11px; color: var(--el-text-color-secondary)"
        >
          当前
        </div>
      </div>
      <el-divider />
      <div class="tip">
        <span>Tip: 按下</span>
        <kbd class="kdb">Tab</kbd>
        <span>切换搜索引擎</span>
      </div>
    </template>
    <el-icon class="search-engine-icon">
      <component :is="searchEngines[settingsStore.selectedSearchEngine]['icon']" />
    </el-icon>
  </el-tooltip>
</template>

<style lang="scss">
.search-engine-menu.is-customized {
  width: 220px;
  padding: 5px;
  background-color: var(--el-bg-color);
  --el-popper-border-radius: 10px;

  .search-engine-menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    padding: 8px 18px;
    color: var(--el-text-color-primary);
    border-radius: 5px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.1s ease-in-out;

    &:hover {
      background: var(--el-fill-color-dark);
    }

    .el-icon {
      margin-right: 10px;
      color: var(--el-text-color-regular);
      font-size: 13px;
    }
  }

  .tip {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    height: 20px;
    color: var(--el-text-color-secondary);

    .kdb {
      border: solid 1px currentColor;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 10px;
      line-height: 1em;
      margin: 0 3px;
    }
  }

  .el-divider--horizontal {
    width: calc(100% - 36px);
    margin: 5px 18px;
  }
}
</style>
