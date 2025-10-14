<script setup lang="ts">
import '@newtab/styles/github-markdown.css'

import { useTranslation } from 'i18next-vue'

import { version } from '@/package.json'

import { useDialog } from '@/entrypoints/newtab/composables/useDialog'
import { isChinese } from '@/shared/lang'
import { useSettingsStore } from '@/shared/settings'

import BaseDialog from '@newtab/components/BaseDialog.vue'

const { t } = useTranslation()
const settings = useSettingsStore()

const { opened, show, hide, toggle } = useDialog()
defineExpose({ show, hide, toggle })

const ChangelogZh = defineAsyncComponent(() => import('@/CHANGELOG.md'))
const ChangelogEn = defineAsyncComponent(() => import('@/CHANGELOG_en.md'))

function handleClose() {
  settings.pluginVersion = version
  settings.readChangeLog = true
}
</script>

<template>
  <base-dialog
    v-model="opened"
    :title="t('newtab:changelog.title')"
    container-class="changelog__dialog"
    @closed="handleClose"
    acrylic
    opacity
  >
    <div class="changelog-wrapper">
      <div class="changelog-hide-major">
        <span>{{ t('newtab:changelog.hideMajorChangelog') }}</span>
        <el-switch v-model="settings.hideMajorChangelog" />
      </div>
      <component :is="isChinese ? ChangelogZh : ChangelogEn" />
    </div>
  </base-dialog>
</template>

<style lang="scss" scoped>
.changelog-wrapper {
  position: relative;
}

.changelog-hide-major {
  position: absolute;
  top: -32px;
  right: 5px;
  display: flex;
  align-items: center;

  span {
    margin-right: 5px;
    font-size: 12px;
    color: var(--el-text-color-regular);
  }

  .el-switch {
    transform: scale(0.95);
  }
}
</style>
