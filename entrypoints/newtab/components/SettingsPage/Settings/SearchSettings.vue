<script setup lang="ts">
import { SearchOutlined } from '@vicons/antd'

import { useSettingsStore } from '@/entrypoints/newtab/js/store/settingsStore'
import { searchEngines, searchSuggestAPIs } from '@/entrypoints/newtab/js/api/search'

const settingsStore = useSettingsStore()
</script>

<template>
  <h3 class="settings-title">
    <el-icon><search-outlined /></el-icon>
    <span>搜索设置</span>
  </h3>
  <div class="settings-item horizontal">
    <div class="settings-label">默认搜索引擎</div>
    <el-select
      v-model="settingsStore.search.selectedSearchEngine"
      style="width: 100px"
      placeholder="Select"
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
    <div class="settings-label">搜索建议API</div>
    <el-select
      v-model="settingsStore.search.selectedSearchSuggestionAPI"
      style="width: 100px"
      placeholder="Select"
    >
      <el-option
        v-for="name in Object.keys(searchSuggestAPIs)"
        :key="name"
        :label="name"
        :value="name"
      />
    </el-select>
  </div>
  <div class="settings-item horizontal">
    <div class="settings-label">在新标签页打开结果</div>
    <el-switch v-model="settingsStore.search.searchInNewTab" size="large" />
  </div>
  <div class="settings-item horizontal">
    <div class="settings-label">记录搜索历史</div>
    <el-switch v-model="settingsStore.search.recordSearchHistory" size="large" />
  </div>
</template>
