<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'
import { DrawerDirection, SortMode } from '@/shared/settings/types'

const { t } = useTranslation('settings')
const { t: tt } = useTranslation()

const settings = useSettingsStore()

const directionOptions = [
  {
    label: 'bookmark.direction.rtl',
    value: DrawerDirection.rtl
  },
  {
    label: 'bookmark.direction.ltr',
    value: DrawerDirection.ltr
  }
]

const sortModeOptions = [
  {
    label: 'bookmark.sortMode.origin',
    value: SortMode.Original
  },
  {
    label: 'bookmark.sortMode.nameAsc',
    value: SortMode.NameAsc
  },
  {
    label: 'bookmark.sortMode.nameDesc',
    value: SortMode.NameDesc
  },
  {
    label: 'bookmark.sortMode.createdAsc',
    value: SortMode.CreatedAsc
  },
  {
    label: 'bookmark.sortMode.createdDesc',
    value: SortMode.CreatedDesc
  }
]
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('bookmark.direction.title') }}</div>
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
      <div class="settings__label">{{ t('bookmark.defaultSort.title') }}</div>
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
    <p class="settings__item--note">{{ t('bookmark.defaultSort.desc') }}</p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('bookmark.rightClickToOpen') }}</div>
      <el-switch v-model="settings.bookmark.rightClickToOpen" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('bookmark.hideBtn') }}</div>
      <el-switch v-model="settings.bookmark.hideBtn" />
    </div>
  </div>
</template>
