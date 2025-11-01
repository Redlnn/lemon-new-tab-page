<script setup lang="ts">
import { Plus } from '@vicons/fa'
import { CheckmarkCircle12Filled } from '@vicons/fluent'
import { useTranslation } from 'i18next-vue'

import { saveCustomSearchEngine, useCustomSearchEngineStore } from '@/shared/customSearchEngine'
import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import BaseDialog from '@newtab/components/BaseDialog.vue'
import { useDialog } from '@newtab/composables/useDialog'
import { searchEngines } from '@newtab/scripts/api/search'

import AddCustomSearchEngine from './components/AddCustomSearchEngine.vue'
import CustomEngineItem from './components/CustomEngineItem.vue'

const { t } = useTranslation()

const { opened, show, hide, toggle } = useDialog()
defineExpose({ show, hide, toggle })

const settings = useSettingsStore()
const customSearchEngineStore = useCustomSearchEngineStore()

const addCustomSearchEngineRef = ref<InstanceType<typeof AddCustomSearchEngine>>()

function selectCustomEngine(engineId: string) {
  settings.search.selectedSearchEngine = engineId
}

function editCustomEngine(index: number) {
  addCustomSearchEngineRef.value?.openEditDialog(index)
}

async function deleteCustomEngine(index: number) {
  const engine = customSearchEngineStore.items[index]
  if (!engine) return

  try {
    await ElMessageBox.confirm(
      t('customSearchEngine.deleteConfirm', { title: engine.name }),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    // 如果删除的是当前选中的引擎，切换到 Bing
    if (settings.search.selectedSearchEngine === engine.id) {
      settings.search.selectedSearchEngine = 'bing'
    }

    customSearchEngineStore.items.splice(index, 1)
    await saveCustomSearchEngine(customSearchEngineStore.$state)
  } catch {
    // 用户取消删除
  }
}

type CustomEngineItemRef = InstanceType<typeof CustomEngineItem> | null
const openedDropdownIndex = ref<number | null>(null)
const dropdownRefs = ref<Array<CustomEngineItemRef>>([])

function setChildRef(i: number, el: CustomEngineItemRef) {
  dropdownRefs.value[i] = el
}

function onChildOpened(index: number) {
  if (openedDropdownIndex.value !== null && openedDropdownIndex.value !== index) {
    const prev = dropdownRefs.value[openedDropdownIndex.value]
    if (prev) {
      prev.close()
    }
  }
  openedDropdownIndex.value = index
}

function handleScroll() {
  if (openedDropdownIndex.value !== null) {
    const curr = dropdownRefs.value[openedDropdownIndex.value]
    if (curr) {
      curr.close()
    }
    openedDropdownIndex.value = null
  }
}

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
</script>

<template>
  <base-dialog
    v-model="opened"
    :title="t('menu.searchEnginePreference')"
    acrylic
    opacity
    @scroll="handleScroll"
  >
    <div style="width: 100%; margin-top: 20px; overflow: hidden">
      <!-- 内置搜索引擎 -->
      <el-row :gutter="10" class="se-switcher-container noselect">
        <el-col
          v-for="key in Object.keys(searchEngines) as (keyof typeof searchEngines)[]"
          :key="key"
          :span="12"
        >
          <div
            class="se-switcher-item"
            :class="{ 'is-active': settings.search.selectedSearchEngine === key }"
            @click="settings.search.selectedSearchEngine = key"
          >
            <el-icon size="16" class="se-switcher-item__icon">
              <component :is="searchEngines[key].icon" />
            </el-icon>
            <div class="se-switcher-item__content">
              <div class="se-switcher-item__label">
                {{ t(searchEngines[key].nameKey) }}
              </div>
              <el-text truncated class="se-switcher-item__url">
                {{ searchEngines[key].url }}
              </el-text>
            </div>
            <el-icon size="16" class="se-switcher-item__checked">
              <CheckmarkCircle12Filled />
            </el-icon>
          </div>
        </el-col>
      </el-row>

      <div class="se-switcher-divider noselect">
        {{ t('customSearchEngine.title') }}
      </div>
      <el-row :gutter="10" class="se-switcher-container noselect">
        <el-col
          v-for="(engine, index) in customSearchEngineStore.items"
          :key="engine.id"
          :span="12"
        >
          <CustomEngineItem
            :engine="engine"
            :is-active="settings.search.selectedSearchEngine === engine.id"
            :icon-url="getCustomEngineFavicon(engine)"
            @select="selectCustomEngine"
            @edit="() => editCustomEngine(index)"
            @delete="() => deleteCustomEngine(index)"
            @opened="() => onChildOpened(index)"
            :ref="(el) => setChildRef(index, el as InstanceType<typeof CustomEngineItem>)"
          />
        </el-col>
        <el-col :span="12">
          <div
            class="se-switcher-item se-switcher-item--add"
            @click="addCustomSearchEngineRef?.openAddDialog"
          >
            <el-icon size="16" class="se-switcher-item__icon">
              <Plus />
            </el-icon>
            <div class="se-switcher-item__content">
              <div class="se-switcher-item__label" style="font-weight: var(--el-font-size-base)">
                {{ t('customSearchEngine.add') }}
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </base-dialog>

  <add-custom-search-engine ref="addCustomSearchEngineRef" />
</template>

<style lang="scss">
@use '@newtab/styles/mixins/acrylic.scss' as acrylic;

.se-switcher-divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  font-size: var(--el-font-size-extra-small);
  color: var(--el-text-color-placeholder);

  &::before,
  &::after {
    flex: 1;
    min-width: 0; /* 允许缩小到 0，避免被文本撑开 */
    height: 0.5px; /* 粗细 */
    content: '';
    background: currentColor;
  }

  &::before {
    margin-right: 0.75em;
  }

  &::after {
    margin-left: 0.75em;
  }
}

.se-switcher-container .el-col:not(:last-child) {
  margin-bottom: 10px;
}

.se-switcher-item {
  display: flex;
  align-items: center;
  height: 65px;
  padding: 16px 18px;
  cursor: pointer;
  background-color: var(--el-bg-color);
  border-radius: 8px;

  &:hover {
    background-color: var(--el-fill-color-dark);
  }

  &.is-active {
    color: var(--el-color-white);
    background-color: var(--el-color-primary);

    html.dark & {
      background-color: var(--el-color-primary-light-3);
    }
  }

  html.colorful &:not(.is-active) {
    background-color: var(--el-color-primary-light-8);

    &:hover {
      background-color: var(--el-color-primary-light-7);
    }
  }

  &--add {
    color: var(--el-text-color-secondary);
  }

  &__icon {
    flex-grow: 0;
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    margin-right: 8px;
    background-color: var(--el-fill-color-blank);
    border-radius: 50%;

    &:has(img) {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    img {
      width: 16px;
      height: 16px;
      object-fit: cover;
    }

    &--default {
      opacity: 0.5;
    }

    html.dark & {
      background-color: var(--le-text-color-primary-opacity-65);
    }

    html.dark .se-switcher-item:hover &,
    html.dark .se-switcher-item.is-active & {
      background-color: var(--el-text-color-primary);
    }
  }

  &__content {
    flex-grow: 1;
    min-width: 0;
  }

  &__label {
    font-weight: 600;
  }

  &__url {
    margin-top: 1px;
    vertical-align: text-bottom;
    color: var(--el-text-color-secondary);
  }

  &.is-active &__url {
    color: var(--el-fill-color);
  }

  html.dark &.is-active &__url {
    color: var(--el-text-color-secondary);
  }

  &__checked {
    display: none;
    flex-grow: 0;
    margin-left: 12px;

    .is-active & {
      display: block;
    }
  }
}

.se-switcher-item__menu-popper.el-dropdown__popper.el-popper {
  .el-dropdown-menu__item {
    padding: 2px 15px;
    font-size: var(--el-font-size-small);
  }

  &.se-switcher-item__menu-popper--opacity.se-switcher-item__menu-popper--blur {
    // 只有模糊时才有透明度效果，否则会影响可读性
    background-color: var(--le-bg-color-overlay-opacity-30);
  }

  &.se-switcher-item__menu-popper--blur {
    @include acrylic.acrylic;
  }

  .el-dropdown-menu {
    background-color: initial;
  }
}
</style>
