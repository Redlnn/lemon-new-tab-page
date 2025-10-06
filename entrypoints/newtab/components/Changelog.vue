<script setup lang="ts">
import { defineAsyncComponent, onMounted } from 'vue'

import { useTranslation } from 'i18next-vue'

import { version } from '@/package.json'

import { isChinese } from '@/shared/lang'
import { useSettingsStore } from '@/shared/settings'

import BaseDialog from '@newtab/components/BaseDialog.vue'
import { useDialog } from '@newtab/composables/useDialog'

const { t } = useTranslation()

const settingsStore = useSettingsStore()

const { opened, show, hide, toggle } = useDialog()
defineExpose({ show, hide, toggle })

const ChangelogZh = defineAsyncComponent(() => import('@/CHANGELOG.md'))
const ChangelogEn = defineAsyncComponent(() => import('@/CHANGELOg_En.md'))

onMounted(async () => {
  await import('@newtab/styles/github-markdown.css')
})
</script>

<template>
  <base-dialog
    v-model="opened"
    :title="t('newtab:changelog.title')"
    container-class="changelog__dialog"
    @closed="() => (settingsStore.pluginVersion = version)"
    acrylic
    opacity
  >
    <div class="changelog-wrapper">
      <component :is="isChinese ? ChangelogZh : ChangelogEn" />
    </div>
  </base-dialog>
</template>
