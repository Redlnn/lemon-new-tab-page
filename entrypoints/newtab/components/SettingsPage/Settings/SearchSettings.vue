<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

import { searchEngines, searchSuggestAPIs } from '@newtab/scripts/api/search'

const { t } = useTranslation('settings')

const settings = useSettingsStore()
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:common.enable') }}</div>
      <el-switch v-model="settings.search.enabled" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('search.defaultSearchEngine') }}</div>
      <el-select
        v-model="settings.search.selectedSearchEngine"
        style="width: 150px"
        fit-input-width
      >
        <el-option
          v-for="key in Object.keys(searchEngines) as (keyof typeof searchEngines)[]"
          :key="key"
          :label="t(searchEngines[key].nameKey)"
          :value="key"
        />
      </el-select>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('search.searchSuggestionProvider') }}
      </div>
      <el-select
        v-model="settings.search.selectedSearchSuggestionAPI"
        style="width: 150px"
        fit-input-width
      >
        <el-option
          v-for="name in Object.keys(searchSuggestAPIs)"
          :key="name"
          :label="t(searchSuggestAPIs[name as keyof typeof searchSuggestAPIs].nameKey)"
          :value="name"
        />
      </el-select>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('search.openInNewTab') }}</div>
      <el-switch v-model="settings.search.searchInNewTab" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('search.alwaysExpandSearchBar') }}</div>
      <el-switch v-model="settings.search.alwaysExpandSearchBar" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('search.enableShadow') }}</div>
      <el-switch v-model="settings.search.enableShadow" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('search.recordSearchHistory') }}</div>
      <el-switch v-model="settings.search.recordSearchHistory" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('search.placeholder') }}</div>
      <el-input v-model="settings.search.placeholder" style="width: 240px" />
    </div>
  </div>
</template>
