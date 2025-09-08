<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useColorMode, useDark, usePreferredDark, useTimeoutFn } from '@vueuse/core'

import { CloudOffRound, ColorLensOutlined } from '@vicons/material'

import { t } from '@/shared/i18n'
import { useSettingsStore } from '@/shared/settings'

const isGoogleChrome = import.meta.env.CHROME && !import.meta.env.EDGE
const settingsStore = useSettingsStore()
const { store } = useColorMode()

const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  '#1677ff',
  '#FFBB00'
])

const isDark = useDark()
const isDarkLocal = ref(isDark.value)
const preferredDark = usePreferredDark()

const isAuto = computed(() => store.value === 'auto')
const isAutoLocal = ref(isAuto.value)

function changeByPreferred(htmlElement: HTMLHtmlElement) {
  if (preferredDark.value) {
    htmlElement.classList.add('dark')
    htmlElement.classList.remove('light')
    isDarkLocal.value = true
  } else {
    htmlElement.classList.add('light')
    htmlElement.classList.remove('dark')
    isDarkLocal.value = false
  }
}

function changeByUser(htmlElement: HTMLHtmlElement) {
  if (isDarkLocal.value) {
    htmlElement.classList.add('dark')
    htmlElement.classList.remove('light')
    isAutoLocal.value = false
  } else {
    htmlElement.classList.add('light')
    htmlElement.classList.remove('dark')
    isAutoLocal.value = false
  }
}

function toggleDark() {
  const htmlElement: HTMLHtmlElement | null = document.querySelector('html')
  if (!htmlElement) return
  if (isDark.value) {
    // 先切换CSS，等待动画结束后，再切换store
    changeByUser(htmlElement)
    useTimeoutFn(() => {
      store.value = 'light'
    }, 300)
  } else {
    changeByUser(htmlElement)
    useTimeoutFn(() => {
      store.value = 'dark'
    }, 300)
  }
}

function toggleAuto() {
  const htmlElement: HTMLHtmlElement | null = document.querySelector('html')
  if (!htmlElement) return
  if (!isAutoLocal.value) {
    store.value = isDarkLocal.value ? 'dark' : 'light'
    return
  }

  if (isDarkLocal.value !== preferredDark.value) {
    // 先切换CSS，等待动画结束后，再切换store
    changeByPreferred(htmlElement)
    useTimeoutFn(() => {
      store.value = 'auto'
    }, 300)
  } else {
    store.value = 'auto'
  }
}

watch(preferredDark, () => {
  const doc: HTMLHtmlElement | null = document.querySelector('html')
  if (!doc) return

  if (isAuto.value) {
    if (isDarkLocal.value !== preferredDark.value) {
      changeByPreferred(doc)
    }
  }
})
</script>

<template>
  <div class="settings__title">
    <el-icon><color-lens-outlined /></el-icon>
    <span>{{ t('newtab.settings.theme.title') }}</span>
  </div>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('newtab.settings.theme.darkMode') }}
        <cloud-off-round />
      </div>
      <el-switch v-model="isDarkLocal" @change="toggleDark" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('newtab.settings.theme.systemMode') }}
        <cloud-off-round />
      </div>
      <el-switch v-model="isAutoLocal" @change="toggleAuto" />
    </div>
    <p v-if="isGoogleChrome" class="settings__item--note">
      {{ t('newtab.settings.theme.chromeTip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.theme.primaryColor') }}</div>
      <div class="settings__theme-mode">
        <el-color-picker v-model="settingsStore.primaryColor" :predefine="predefineColors" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.settings__theme-mode {
  display: flex;
  column-gap: 8px;

  .settings__theme-item {
    position: relative;
    cursor: pointer;

    & .settings__theme-selected {
      display: none;
    }

    &.settings__theme-item--active .settings__theme-selected {
      position: absolute;
      right: 8px;
      bottom: 8px;
      display: block;
      color: var(--el-color-primary);
    }
  }
}
</style>
