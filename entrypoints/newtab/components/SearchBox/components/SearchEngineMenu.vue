<script setup lang="ts">
import { ref } from 'vue'

import type { TooltipInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'

import { getPerfClasses } from '@/shared/composables/perfClasses'
import { useSettingsStore } from '@/shared/settings'

import { searchEngines } from '@newtab/scripts/api/search'
import { useFocusStore } from '@newtab/scripts/store'

const { t } = useTranslation()

const focusStore = useFocusStore()
const settings = useSettingsStore()
const searchEngineMenu = ref<TooltipInstance>()

function hide() {
  searchEngineMenu.value?.hide()
}

defineExpose({ hide })
</script>

<template>
  <el-tooltip
    ref="searchEngineMenu"
    trigger="click"
    :disabled="!focusStore.isFocused"
    :show-arrow="false"
    :popper-class="
      getPerfClasses(
        {
          transparentOff: settings.perf.disableSearchBarTransparent,
          blurOff: settings.perf.disableSearchBarBlur
        },
        'search-engine-menu'
      )
    "
    placement="bottom-start"
    effect="customized"
  >
    <template #content>
      <div
        v-for="key in Object.keys(searchEngines) as (keyof typeof searchEngines)[]"
        :key="key"
        class="search-engine-menu__item"
        :class="{
          'search-engine-menu__item--active': settings.search.selectedSearchEngine === key
        }"
        @click="settings.search.selectedSearchEngine = key"
      >
        <div style="display: flex; align-items: center">
          <el-icon><component :is="searchEngines[key].icon" /></el-icon>
          <span>{{ searchEngines[key].name }}</span>
        </div>
        <div
          v-if="key === settings.search.selectedSearchEngine"
          style="font-size: 11px; color: var(--el-text-color-secondary)"
        >
          {{ t('newtab:search.searchEngineMenu.current') }}
        </div>
      </div>
      <el-divider />
      <div class="search-engine-menu__tip">
        <span>{{ t('newtab:search.searchEngineMenu.tipPrefix') }}</span>
        <kbd class="search-engine-menu__kbd">Tab</kbd>
        <span>{{ t('newtab:search.searchEngineMenu.tipSuffix') }}</span>
      </div>
    </template>
    <el-icon class="search-engine-menu__icon" :style="{ opacity: focusStore.isFocused ? 1 : 0 }">
      <component :is="searchEngines[settings.search.selectedSearchEngine].icon" />
    </el-icon>
  </el-tooltip>
</template>

<style lang="scss">
@use '@newtab/styles/mixins/acrylic.scss' as acrylic;

.search-engine-menu {
  &.is-customized {
    --el-popper-border-radius: 10px;

    min-width: 210px;
    padding: 5px;
    background-color: var(--el-bg-color-overlay);
    transition: background-color var(--el-transition-duration-fast) ease;

    &.search-engine-menu--opacity {
      background-color: var(--le-bg-color-overlay-opacity-30);
    }

    &.search-engine-menu--blur {
      @include acrylic.acrylic;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 18px;
    overflow: hidden;
    font-size: var(--el-font-size-extra-small);
    color: var(--el-text-color-primary);
    cursor: pointer;
    border-radius: 5px;

    &--active {
      background: var(--el-fill-color-dark);
    }

    .el-icon {
      margin-right: 10px;
      font-size: var(--el-font-size-small);
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
