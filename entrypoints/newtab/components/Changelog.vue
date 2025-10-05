<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue'

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

const a = ref(false)

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
      <div class="changelog-no-popup">
        <div style="margin-right: 5px">{{ t('newtab:changelog.noPopup') }}</div>
        <el-switch v-model="a" />
      </div>
      <component :is="isChinese ? ChangelogZh : ChangelogEn" />
    </div>
  </base-dialog>
</template>

<style lang="scss" scoped>
.changelog-wrapper {
  position: relative;
}

.changelog-no-popup {
  position: absolute;
  top: -32px;
  right: 5px;
  display: flex;
  align-items: center;
}
</style>
