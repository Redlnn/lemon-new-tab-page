<script setup lang="ts">
import { SearchOutlined } from '@vicons/antd'

import { i18n } from '@/.wxt/i18n'
import { useSettingsStore } from '@/entrypoints/newtab/js/store/settingsStore'
import { searchEngines, searchSuggestAPIs } from '@/entrypoints/newtab/js/api/search'

const settingsStore = useSettingsStore()
</script>

<template>
  <div class="settings-title">
    <el-icon><search-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.search.title') }}</span>
  </div>
  <div class="setting-items-container">
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.search.default_search_engine') }}</div>
      <el-select
        v-model="settingsStore.search.selectedSearchEngine"
        style="width: 100px"
        fit-input-width
      >
        <el-option
          v-for="(item, index) in searchEngines"
          :key="item.name"
          :label="item.name"
          :value="index"
        />
      </el-select>
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">
        {{ i18n.t('newtab.settings.search.search_suggestion_provider') }}
      </div>
      <el-select
        v-model="settingsStore.search.selectedSearchSuggestionAPI"
        style="width: 100px"
        fit-input-width
      >
        <el-option
          v-for="name in Object.keys(searchSuggestAPIs)"
          :key="name"
          :label="searchSuggestAPIs[name].name"
          :value="name"
        />
      </el-select>
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.search.open_in_new_tab') }}</div>
      <el-switch v-model="settingsStore.search.searchInNewTab" />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.search.record_history') }}</div>
      <el-switch v-model="settingsStore.search.recordSearchHistory" />
    </div>
  </div>
</template>
