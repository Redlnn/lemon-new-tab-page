<script setup lang="ts">
import { CheckmarkCircle12Filled } from '@vicons/fluent'
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

import BaseDialog from '@newtab/components/BaseDialog.vue'
import { useDialog } from '@newtab/composables/useDialog'
import { searchEngines } from '@newtab/scripts/api/search'

const { t } = useTranslation()

const { opened, show, hide, toggle } = useDialog()
defineExpose({ show, hide, toggle })

const settings = useSettingsStore()
</script>

<template>
  <base-dialog v-model="opened" :title="t('newtab:menu.searchEnginePreference')" acrylic opacity>
    <div style="width: 100%; overflow: hidden">
      <el-row :gutter="10" class="se-switcher">
        <el-col
          v-for="key in Object.keys(searchEngines) as (keyof typeof searchEngines)[]"
          :key="key"
          :xs="24"
          :sm="12"
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
                {{ searchEngines[key].name }}
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
    </div>
  </base-dialog>
</template>

<style scoped lang="scss">
.se-switcher {
  margin-top: 10px;
}

.se-switcher-item {
  display: flex;
  align-items: center;
  padding: 16px 18px;
  margin-top: 10px;
  cursor: pointer;
  background-color: var(--el-bg-color);
  border-radius: 8px;

  &.is-active {
    color: var(--el-color-white);
    background-color: var(--el-color-primary);
  }

  &:hover:not(.is-active) {
    background-color: var(--el-fill-color-dark);
  }

  &__icon {
    flex-grow: 0;
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    margin-right: 8px;
    background-color: var(--el-fill-color-blank);
    border-radius: 50%;

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
