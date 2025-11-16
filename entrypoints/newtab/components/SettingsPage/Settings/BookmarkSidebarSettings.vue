<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'
import { DrawerDirection } from '@/shared/settings/types'

const { t } = useTranslation('settings')

const settings = useSettingsStore()

const directionOptions = [
  {
    label: 'bookmarkSidebar.direction.rtl',
    value: DrawerDirection.rtl
  },
  {
    label: 'bookmarkSidebar.direction.ltr',
    value: DrawerDirection.ltr
  }
]
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('bookmarkSidebar.direction.title') }}</div>
      <el-select
        v-model="settings.bookmarkSidebar.direction"
        placeholder="Select"
        style="width: 150px"
      >
        <el-option
          v-for="item in directionOptions"
          :key="item.value"
          :label="t(item.label)"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('bookmarkSidebar.rightClickToOpen') }}</div>
      <el-switch v-model="settings.bookmarkSidebar.rightClickToOpen" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('bookmarkSidebar.hideBtn') }}</div>
      <el-switch v-model="settings.bookmarkSidebar.hideBtn" />
    </div>
  </div>
</template>
