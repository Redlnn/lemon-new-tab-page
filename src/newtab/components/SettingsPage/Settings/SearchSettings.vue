<script setup lang="ts">
import { SearchOutlined } from '@vicons/antd'

import { useSettingsStore } from '@/newtab/js/store'
import { searchSuggestAPIs, searchEngines } from '@/newtab/js/api/search'

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
      v-model="settingsStore.selectedSearchEngine"
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
      v-model="settingsStore.selectedSearchSuggestionAPI"
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
    <el-switch v-model="settingsStore.searchInNewTab" size="large" />
  </div>
</template>
