<script setup lang="ts">
import { ArrowBackIosRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { useSettingsRouter } from '@newtab/composables/useSettingsRouter'

interface Props {
  title: string
}

defineProps<Props>()

const { t } = useTranslation()
const router = useSettingsRouter()

function handleBack() {
  router.back()
}
</script>

<template>
  <div class="settings-detail">
    <div class="settings-detail__header" @click="handleBack">
      <el-icon class="settings-detail__back-icon">
        <arrow-back-ios-round />
      </el-icon>
      <span class="settings-detail__back-text">{{ t('newtab:settings.menu.back') }}</span>
    </div>
    <div class="settings-detail__title">{{ title }}</div>
    <div class="settings-detail__content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 16px;

  &__header {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 8px 16px;
    margin-bottom: 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &:active {
      background-color: var(--el-fill-color);
    }
  }

  &__back-icon {
    font-size: 16px;
    color: var(--el-text-color-primary);
  }

  &__back-text {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  &__title {
    margin-bottom: 20px;
    padding: 0 10px;
    font-size: 28px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__content {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
