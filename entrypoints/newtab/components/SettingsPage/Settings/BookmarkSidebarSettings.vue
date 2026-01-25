<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'
import { DrawerDirection, SortMode } from '@/shared/settings/types'

const { t } = useTranslation('settings')
const { t: tt } = useTranslation()

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

const sortModeOptions = [
  {
    label: 'bookmarkSidebar.sortMode.origin',
    value: SortMode.Original
  },
  {
    label: 'bookmarkSidebar.sortMode.nameAsc',
    value: SortMode.NameAsc
  },
  {
    label: 'bookmarkSidebar.sortMode.nameDesc',
    value: SortMode.NameDesc
  },
  {
    label: 'bookmarkSidebar.sortMode.createdAsc',
    value: SortMode.CreatedAsc
  },
  {
    label: 'bookmarkSidebar.sortMode.createdDesc',
    value: SortMode.CreatedDesc
  }
]
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('bookmarkSidebar.direction.title') }}</div>
      <el-select v-model="settings.bookmark.direction" placeholder="Select" style="width: 150px">
        <el-option
          v-for="item in directionOptions"
          :key="item.value"
          :label="t(item.label)"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('bookmarkSidebar.defaultSort.title') }}</div>
      <el-select
        v-model="settings.bookmark.defaultSortMode"
        placeholder="Select"
        style="width: 150px"
      >
        <el-option
          v-for="item in sortModeOptions"
          :key="item.value"
          :label="tt(item.label)"
          :value="item.value"
        />
      </el-select>
    </div>
    <p class="settings__item--note">{{ t('bookmarkSidebar.defaultSort.desc') }}</p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('bookmarkSidebar.rightClickToOpen') }}</div>
      <el-switch v-model="settings.bookmark.rightClickToOpen" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('bookmarkSidebar.hideBtn') }}</div>
      <el-switch v-model="settings.bookmark.hideBtn" />
    </div>
  </div>
</template>
