<script setup lang="ts">
import { i18n } from '@/.wxt/i18n'
import { searchEngines } from '@newtab/scripts/api/search'
import { useFocusStore } from '@newtab/scripts/store'
import { useSettingsStore } from '@/shared/settings'

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
        class="search-engine-menu__item"
        :class="{
          'search-engine-menu__item--active': settingsStore.search.selectedSearchEngine === index
        }"
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
      <div class="search-engine-menu__tip">
        <span>{{ i18n.t('newtab.search.searchEngineMenu.tipPrefix') }}</span>
        <kbd class="search-engine-menu__kbd">Tab</kbd>
        <span>{{ i18n.t('newtab.search.searchEngineMenu.tipSuffix') }}</span>
      </div>
    </template>
    <el-icon class="search-engine-menu__icon">
      <component :is="searchEngines[settingsStore.search.selectedSearchEngine]['icon']" />
    </el-icon>
  </el-tooltip>
</template>

<style lang="scss">
.search-engine-menu {
  &.is-customized {
    min-width: 210px;
    padding: 5px;
    background-color: var(--el-bg-color);

    --el-popper-border-radius: 10px;
    transition: background-color var(--el-transition-duration-fast) ease;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 18px;
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-primary);
    cursor: pointer;
    border-radius: 5px;

    &--active {
      background: var(--el-fill-color-dark);
    }

    .el-icon {
      margin-right: 10px;
      font-size: 13px;
      color: var(--el-text-color-regular);
    }
  }

  &__tip {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    padding: 0 10px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    transition: color var(--el-transition-duration-fast) ease;

    .search-engine-menu__kbd {
      padding: 2px 4px;
      margin: 0 3px;
      font-size: 10px;
      line-height: 1em;
      border: solid 1px currentColor;
      border-radius: 3px;
    }
  }

  .el-divider--horizontal {
    width: calc(100% - 36px);
    margin: 5px 18px;
  }
}
</style>
