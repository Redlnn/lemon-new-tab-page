<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { isChinese } from '@/shared/lang'
import { useSettingsStore } from '@/shared/settings'
import { yiyanProviders } from '@/shared/yiyan'

const { t } = useTranslation('settings')

const settings = useSettingsStore()

const currentProviderNote = computed(() => yiyanProviders[settings.yiyan.provider]?.note)
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:common.enable') }}</div>
      <el-switch v-model="settings.yiyan.enabled" />
    </div>
    <p v-if="!isChinese" class="settings__item--note">
      {{ t('yiyan.description') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('yiyan.alwaysShow') }}</div>
      <el-switch v-model="settings.yiyan.alwaysShow" />
    </div>
    <p class="settings__item--note">
      {{ t('yiyan.normalyShowTip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('yiyan.title') }}</div>
      <el-select v-model="settings.yiyan.provider" style="width: 180px" fit-input-width>
        <el-option
          v-for="(provider, key) in yiyanProviders"
          :key="key"
          :label="t(provider.nameKey)"
          :value="key"
        />
      </el-select>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('yiyan.enableShadow') }}</div>
      <el-switch v-model="settings.yiyan.enableShadow" />
    </div>
    <p v-if="currentProviderNote" class="settings__item--note">
      {{ t(currentProviderNote) }}
    </p>
  </div>
</template>
