<script setup lang="ts">
import { ColorLensOutlined } from '@vicons/material'
import { ref } from 'vue'
import { useColorMode, useDark, useTimeoutFn } from '@vueuse/core'

import changeTheme from '@/newtab/scripts/use-element-plus-theme'
import { i18n } from '@/.wxt/i18n'
import { useSettingsStore } from '@/newtab/scripts/store/settingsStore'

const settingsStore = useSettingsStore()

const { store } = useColorMode()

const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585'
])

const isDark = useDark()
const isDarkLocal = ref(isDark.value)

const isAuto = ref(store.value === 'auto')

function toggleDark() {
  const doc: HTMLHtmlElement | null = document.querySelector('html')
  if (!doc) return
  if (isDark.value) {
    doc.classList.remove('dark')
    doc.classList.add('light')
    useTimeoutFn(() => {
      isDark.value = false
      if (isDarkLocal.value) {
        isDarkLocal.value = false
      }
    }, 300)
  } else {
    doc.classList.add('dark')
    doc.classList.remove('light')
    useTimeoutFn(() => {
      isDark.value = true
      if (!isDarkLocal.value) {
        isDarkLocal.value = true
      }
    }, 300)
  }
  if (store.value === 'auto') {
    isAuto.value = false
  }
}
</script>

<template>
  <div class="settings-title">
    <el-icon><color-lens-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.theme.title') }}</span>
  </div>
  <div class="setting-items-container">
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.theme.darkMode') }}</div>
      <el-switch v-model="isDarkLocal" @change="toggleDark" />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.theme.systemMode') }}</div>
      <el-switch
        v-model="isAuto"
        @change="
          () => {
            if (isAuto) {
              store = 'auto'
            }
          }
        "
      />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.theme.primaryColor') }}</div>
      <div class="color-mode">
        <el-color-picker
          v-model="settingsStore.primaryColor"
          :predefine="predefineColors"
          @change="
            () => {
              if (settingsStore.primaryColor === null) {
                settingsStore.primaryColor = '#409eff'
              }
              changeTheme(settingsStore.primaryColor)
            }
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.theme-mode {
  display: flex;
  column-gap: 8px;

  .theme-item {
    position: relative;
    cursor: pointer;

    & .selected {
      display: none;
    }
    &.active .selected {
      display: block;
      position: absolute;
      right: 8px;
      bottom: 8px;
      color: var(--el-color-primary);
    }
  }
}

:deep().el-color-picker__trigger {
  padding: 0;
  border: none;
  overflow: hidden;
  border-radius: 8px;

  .el-color-picker__color {
    border: none;
    border-radius: none;
  }
}
</style>
