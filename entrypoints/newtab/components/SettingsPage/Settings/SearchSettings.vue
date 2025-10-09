<script setup lang="ts">
import { SearchOutlined } from '@vicons/antd'
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

import { searchEngines, searchSuggestAPIs } from '@newtab/scripts/api/search'

const { t } = useTranslation()

const settings = useSettingsStore()
</script>

<template>
  <div class="settings__title">
    <el-icon><search-outlined /></el-icon>
    <span>{{ t('newtab:settings.search.title') }}</span>
  </div>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.search.defaultSearchEngine') }}</div>
      <el-select
        v-model="settings.search.selectedSearchEngine"
        style="width: 100px"
        fit-input-width
      >
        <el-option
          v-for="key in Object.keys(searchEngines) as (keyof typeof searchEngines)[]"
          :key="key"
          :label="searchEngines[key].name"
          :value="key"
        />
      </el-select>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('newtab:settings.search.searchSuggestionProvider') }}
      </div>
      <el-select
        v-model="settings.search.selectedSearchSuggestionAPI"
        style="width: 100px"
        fit-input-width
      >
        <el-option
          v-for="name in Object.keys(searchSuggestAPIs)"
          :key="name"
          :label="searchSuggestAPIs[name as keyof typeof searchSuggestAPIs].name"
          :value="name"
        />
      </el-select>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.search.openInNewTab') }}</div>
      <el-switch v-model="settings.search.searchInNewTab" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.search.alwaysExpandSearchBar') }}</div>
      <el-switch v-model="settings.search.alwaysExpandSearchBar" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.search.enableShadow') }}</div>
      <el-switch v-model="settings.search.enableShadow" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.search.recordSearchHistory') }}</div>
      <el-switch v-model="settings.search.recordSearchHistory" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.search.placeholder') }}</div>
      <el-input v-model="settings.search.placeholder" style="width: 240px" />
    </div>
  </div>
</template>
