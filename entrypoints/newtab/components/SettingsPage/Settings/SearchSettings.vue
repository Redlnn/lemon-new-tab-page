<script setup lang="ts">
import { SearchOutlined } from '@vicons/antd'

import { i18n } from '@/.wxt/i18n'
import { useSettingsStore } from '@/newtab/scripts/store/settingsStore'
import { searchEngines, searchSuggestAPIs } from '@/newtab/scripts/api/search'

const settingsStore = useSettingsStore()
</script>

<template>
  <div class="settings__title">
    <el-icon><search-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.search.title') }}</span>
  </div>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.search.defaultSearchEngine') }}</div>
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
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ i18n.t('newtab.settings.search.searchSuggestionProvider') }}
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
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.search.openInNewTab') }}</div>
      <el-switch v-model="settingsStore.search.searchInNewTab" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.search.autoFocus') }}</div>
      <el-switch v-model="settingsStore.search.autoFocus" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.search.enableShadow') }}</div>
      <el-switch v-model="settingsStore.search.enableShadow" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.search.recordSearchHistory') }}</div>
      <el-switch v-model="settingsStore.search.recordSearchHistory" />
    </div>
  </div>
</template>
