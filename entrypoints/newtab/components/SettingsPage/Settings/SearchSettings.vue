<script setup lang="ts">
import { inject } from 'vue'

import { BubbleChartRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

import { searchSuggestAPIs } from '@newtab/shared/api/search'
import { OPEN_SEARCH_ENGINE_PREFERENCE } from '@newtab/shared/keys'

const { t } = useTranslation('settings')

const settings = useSettingsStore()

const openSearchEnginePreference = inject(OPEN_SEARCH_ENGINE_PREFERENCE)
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:common.enable') }}</div>
      <el-switch v-model="settings.search.enabled" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('search.defaultSearchEngine') }}</div>
      <el-button
        :icon="BubbleChartRound"
        @click="openSearchEnginePreference && openSearchEnginePreference()"
      >
        {{ t('search.clickToChange') }}
      </el-button>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('search.searchSuggestionProvider') }}
      </div>
      <el-select
        v-model="settings.search.selectedSearchSuggestionAPI"
        style="width: 150px"
        fit-input-width
        :show-arrow="false"
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
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('search.launchAnim') }}</div>
      <el-switch v-model="settings.search.launchAnim" />
    </div>
  </div>
</template>
