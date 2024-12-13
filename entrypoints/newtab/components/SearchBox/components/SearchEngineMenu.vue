<script setup lang="ts">
import { i18n } from '@/.wxt/i18n'
import { searchEngines } from '@/newtab/scripts/api/search'
import { useFocusStore, useSettingsStore } from '@/newtab/scripts/store'

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
        :class="{ active: settingsStore.search.selectedSearchEngine === index }"
        @click="settingsStore.search.selectedSearchEngine = index"
      >
        <div style="display: flex; align-items: center">
          <el-icon><component :is="item['icon']" /></el-icon>
          <span>{{ item.name }}</span>
        </div>
        <div
          v-if="index === settingsStore.search.selectedSearchEngine"
          style="font-size: 11px; color: var(--el-text-color-secondary)"
        >
          {{ i18n.t('newtab.search.searchEngineMenu.current') }}
        </div>
      </div>
      <el-divider />
      <div class="tip">
        <span>{{ i18n.t('newtab.search.searchEngineMenu.tipPrefix') }}</span>
        <kbd class="kdb">Tab</kbd>
        <span>{{ i18n.t('newtab.search.searchEngineMenu.tipSuffix') }}</span>
      </div>
    </template>
    <el-icon class="search-engine-icon">
      <component :is="searchEngines[settingsStore.search.selectedSearchEngine]['icon']" />
    </el-icon>
  </el-tooltip>
</template>

<style lang="scss">
.search-engine-menu.is-customized {
  min-width: 210px;
  padding: 5px;
  background-color: var(--el-bg-color);
  --el-popper-border-radius: 10px;
  transition: background-color var(--el-transition-duration-fast) ease;

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
    padding: 0 10px;
    transition: color var(--el-transition-duration-fast) ease;

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
