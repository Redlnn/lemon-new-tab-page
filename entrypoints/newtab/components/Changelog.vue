<script setup lang="ts">
import { defineAsyncComponent, onMounted } from 'vue'

import { useTranslation } from 'i18next-vue'

import { isChinese } from '@/shared/lang'
import { useSettingsStore } from '@/shared/settings'

import BaseDialog from '@newtab/components/BaseDialog.vue'
import { useDialog } from '@newtab/composables/useDialog'

const { t } = useTranslation()

const { opened, show, hide, toggle } = useDialog()
defineExpose({ show, hide, toggle })

const ChangelogZh = defineAsyncComponent(() => import('@/CHANGELOG.md'))
const ChangelogEn = defineAsyncComponent(() => import('@/CHANGELOG_en.md'))

onMounted(async () => {
  await import('@newtab/styles/github-markdown.css')
})

function handleClose() {
  // useSettingsStore().pluginVersion = version
  useSettingsStore().readChangeLog = true
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
      <component :is="isChinese ? ChangelogZh : ChangelogEn" />
    </div>
  </base-dialog>
</template>
