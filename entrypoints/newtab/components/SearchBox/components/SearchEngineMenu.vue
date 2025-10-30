<script setup lang="ts">
import type { TooltipInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'

import { useCustomSearchEngineStore } from '@/shared/customSearchEngine'
import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import { getPerfClasses } from '@newtab/composables/perfClasses'
import { searchEngines } from '@newtab/scripts/api/search'
import { useFocusStore } from '@newtab/scripts/store'

const { t } = useTranslation()

const focusStore = useFocusStore()
const settings = useSettingsStore()
const customSearchEngineStore = useCustomSearchEngineStore()
const searchEngineMenu = ref<TooltipInstance>()

const isBuiltInEngine = computed(() => {
  return settings.search.selectedSearchEngine in searchEngines
})

// 缓存自定义搜索引擎的 favicon Ref
const customEngineFaviconCache = new Map<string, Ref<string>>()

function getCustomEngineFavicon(engine: { id: string; url: string; icon?: string }): string {
  if (engine.icon) {
    return engine.icon
  }

  if (!customEngineFaviconCache.has(engine.id)) {
    customEngineFaviconCache.set(engine.id, getFaviconURL(engine.url))
  }

  return customEngineFaviconCache.get(engine.id)!.value
}

const currentCustomEngine = computed(() => {
  if (isBuiltInEngine.value) {
    return null
  } else {
    return customSearchEngineStore.items.find(
      (engine) => engine.id === settings.search.selectedSearchEngine
    )
  }
})

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
      <!-- 内置搜索引擎 -->
      <div
        v-for="key in Object.keys(searchEngines) as (keyof typeof searchEngines)[]"
        :key="key"
        class="search-engine-menu-item"
        :class="{
          'search-engine-menu-item--active': settings.search.selectedSearchEngine === key
        }"
        @click="settings.search.selectedSearchEngine = key"
      >
        <div style="display: flex; align-items: center">
          <el-icon class="search-engine-menu-item__icon"
            ><component :is="searchEngines[key].icon"
          /></el-icon>
          <span>{{ t(searchEngines[key].nameKey) }}</span>
        </div>
        <div
          v-if="key === settings.search.selectedSearchEngine"
          style="font-size: 11px; color: var(--el-text-color-secondary)"
        >
          {{ t('search.searchEngineMenu.current') }}
        </div>
      </div>

      <!-- 自定义搜索引擎 -->
      <template v-if="customSearchEngineStore.items.length > 0">
        <el-divider />
        <div
          v-for="engine in customSearchEngineStore.items"
          :key="engine.id"
          class="search-engine-menu-item"
          :class="{
            'search-engine-menu-item--active': settings.search.selectedSearchEngine === engine.id
          }"
          @click="settings.search.selectedSearchEngine = engine.id"
        >
          <div style="display: flex; align-items: center">
            <div
              class="search-engine-menu-item__icon search-engine-menu-item__icon--custom"
              :style="{
                backgroundImage: `url(${getCustomEngineFavicon(engine)})`
              }"
            ></div>
            <span>{{ engine.name }}</span>
          </div>
          <div
            v-if="engine.id === settings.search.selectedSearchEngine"
            style="font-size: 11px; color: var(--el-text-color-secondary)"
          >
            {{ t('search.searchEngineMenu.current') }}
          </div>
        </div>
      </template>
      <div class="search-engine-menu__tip">
        <span>{{ t('search.searchEngineMenu.tipPrefix') }}</span>
        <kbd class="search-engine-menu__kbd">Tab</kbd>
        <span>{{ t('search.searchEngineMenu.tipSuffix') }}</span>
      </div>
    </template>
    <el-icon
      v-if="isBuiltInEngine"
      class="search-engine-menu__icon"
      :style="{ opacity: focusStore.isFocused ? 1 : 0 }"
    >
      <component
        :is="searchEngines[settings.search.selectedSearchEngine as keyof typeof searchEngines].icon"
      />
    </el-icon>
    <div
      v-else
      class="search-engine-menu__icon search-engine-menu__icon--custom"
      :style="{ opacity: focusStore.isFocused ? 1 : 0 }"
    >
      <img :src="getCustomEngineFavicon(currentCustomEngine!)" />
    </div>
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

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 18px;
    overflow: hidden;
    font-size: var(--el-font-size-extra-small);
    color: var(--el-text-color-primary);
    cursor: pointer;
    border-radius: 7px;

    &:hover {
      background: var(--le-bg-color-overlay-opacity-30);
    }

    &--active {
      background: var(--le-bg-color-overlay-opacity-20);
    }

    .search-engine-menu-item__icon {
      margin-right: 10px;
      font-size: var(--el-font-size-small);
      color: var(--el-text-color-regular);

      &.search-engine-menu-item__icon--custom {
        width: 1em;
        height: 1em;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
      }
    }
  }

  &__tip {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    padding: 0 10px;
    margin-top: 5px;
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
