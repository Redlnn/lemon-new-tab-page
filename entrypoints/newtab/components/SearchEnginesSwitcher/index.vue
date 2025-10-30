<script setup lang="ts">
import { Plus } from '@vicons/fa'
import { CheckmarkCircle12Filled, Delete16Regular, Edit16Regular } from '@vicons/fluent'
import type { DropdownInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'

import { saveCustomSearchEngine, useCustomSearchEngineStore } from '@/shared/customSearchEngine'
import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import BaseDialog from '@newtab/components/BaseDialog.vue'
import { useDialog } from '@newtab/composables/useDialog'
import { searchEngines } from '@newtab/scripts/api/search'

import AddCustomSearchEngine from './components/AddCustomSearchEngine.vue'

const { t } = useTranslation()

const { opened, show, hide, toggle } = useDialog()
defineExpose({ show, hide, toggle })

const settings = useSettingsStore()
const customSearchEngineStore = useCustomSearchEngineStore()
const addCustomSearchEngineRef = ref<InstanceType<typeof AddCustomSearchEngine>>()

function selectCustomEngine(engineId: string) {
  // TypeScript 会报错但运行时正常，因为 settings 定义需要在 Phase 4 修改
  ;(settings.search.selectedSearchEngine as string) = engineId
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
const dropdownRef = ref<DropdownInstance>()
const position = ref({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0
} as DOMRect)
const triggerRef = ref({
  getBoundingClientRect: () => position.value
})

// 记录当前右键点击的引擎索引
const currentEngineIndex = ref<number>(-1)

function handleContextmenu(event: MouseEvent, index: number): void {
  const { clientX, clientY } = event
  position.value = DOMRect.fromRect({
    x: clientX,
    y: clientY
  })
  currentEngineIndex.value = index
  event.preventDefault()
  dropdownRef.value?.handleOpen()
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
  <base-dialog v-model="opened" :title="t('menu.searchEnginePreference')" acrylic opacity>
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

      <el-divider class="se-switcher-divider">{{ t('customSearchEngine.title') }}</el-divider>
      <el-row :gutter="10" class="se-switcher-container noselect">
        <el-col
          v-for="(engine, index) in customSearchEngineStore.items"
          :key="engine.id"
          :span="12"
        >
          <div
            class="se-switcher-item se-switcher-item--custom"
            :class="{ 'is-active': settings.search.selectedSearchEngine === engine.id }"
          >
            <div
              class="se-switcher-item__main"
              @click="selectCustomEngine(engine.id)"
              @contextmenu="(e) => handleContextmenu(e, index)"
            >
              <div class="se-switcher-item__icon">
                <img :src="getCustomEngineFavicon(engine)" alt="" />
              </div>
              <div class="se-switcher-item__content">
                <div class="se-switcher-item__label">
                  {{ engine.name }}
                </div>
                <el-text truncated class="se-switcher-item__url">
                  {{ engine.url }}
                </el-text>
              </div>
              <el-icon size="16" class="se-switcher-item__checked">
                <CheckmarkCircle12Filled />
              </el-icon>
            </div>
          </div>
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
              <div class="se-switcher-item__label">
                {{ t('customSearchEngine.add') }}
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-dropdown
        ref="dropdownRef"
        :virtual-ref="triggerRef"
        :show-arrow="false"
        :popper-options="{
          modifiers: [{ name: 'offset', options: { offset: [0, 0] } }]
        }"
        virtual-triggering
        trigger="contextmenu"
        placement="bottom-start"
      >
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :icon="Edit16Regular" @click="editCustomEngine(currentEngineIndex)">
              <span>编辑</span>
            </el-dropdown-item>
            <el-dropdown-item
              :icon="Delete16Regular"
              @click="deleteCustomEngine(currentEngineIndex)"
            >
              <span>删除</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </base-dialog>

  <add-custom-search-engine ref="addCustomSearchEngineRef" />
</template>

<style lang="scss">
.se-switcher-divider .el-divider__text {
  font-size: var(--el-font-size-extra-small);
  color: var(--el-text-color-disabled);
  background-color: initial;
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

  &__main {
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
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
    font-weight: 550;
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
</style>
