<script setup lang="ts">
import { useColorMode, useDark, usePreferredDark, useTimeoutFn } from '@vueuse/core'

import { CloudOffRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { defaultSettings, useSettingsStore } from '@/shared/settings'

const { t } = useTranslation()

const settings = useSettingsStore()
const { store } = useColorMode()

const predefineColorsMapClassic = [
  { value: '#d75455', label: '深緋' },
  { value: '#ec6800', label: '黄赤' },
  { value: defaultSettings.primaryColor, label: '山吹' },
  { value: '#aacf53', label: '萌黄' },
  { value: '#008899', label: '納戸' },
  { value: '#1677ff', label: 'Ant Design' }, // Ant Design Primary
  { value: '#1e50a2', label: '瑠璃' },
  { value: '#4d5aaf', label: '紺桔梗' }
]

const predefineColorsMapAnime = [
  { value: '#39C5BB', label: '初音ミク' },
  { value: '#66CCFF', label: '洛天依' },
  { value: '#3388bb', label: 'MyGO!!!!!' },
  { value: '#730f40', label: 'Ave Mujica' },
  { value: '#f7b3c2', label: '後藤ひとり' },
  { value: '#ff2291', label: '結束バンド' },
  { value: '#d90e2c', label: 'TOGENASHI TOGEARI' }
]

const predefineColorsMap = [
  { label: 'Classic', options: predefineColorsMapClassic },
  { label: 'ACGN', options: predefineColorsMapAnime }
]

const predefineColors = predefineColorsMapClassic
  .concat(predefineColorsMapAnime)
  .map((i) => i.value)

const isDark = useDark()
const isDarkUI = ref(isDark.value)
const preferredDark = usePreferredDark()

const isAuto = computed(() => store.value === 'auto')
const isAutoUI = ref(isAuto.value)

function changeByPreferred() {
  if (preferredDark.value) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
    isDarkUI.value = true
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
    isDarkUI.value = false
  }
}

function changeByUser() {
  if (isDarkUI.value) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
    isAutoUI.value = false
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
    isAutoUI.value = false
  }
}

function toggleDark() {
  if (isDark.value) {
    // 先切换CSS，等待动画结束后，再切换store
    changeByUser()
    useTimeoutFn(() => {
      store.value = 'light'
    }, 300)
  } else {
    changeByUser()
    useTimeoutFn(() => {
      store.value = 'dark'
    }, 300)
  }
}

function toggleAuto() {
  if (!isAutoUI.value) {
    store.value = isDarkUI.value ? 'dark' : 'light'
    return
  }

  if (isDarkUI.value !== preferredDark.value) {
    // 先切换CSS，等待动画结束后，再切换store
    changeByPreferred()
    useTimeoutFn(() => {
      store.value = 'auto'
    }, 300)
  } else {
    store.value = 'auto'
  }
}

watch(isDark, (newVal) => {
  if (isAuto.value) {
    isDarkUI.value = newVal
  }
})
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('newtab:settings.theme.darkMode') }}
        <cloud-off-round />
      </div>
      <el-switch v-model="isDarkUI" @change="toggleDark" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('newtab:settings.theme.systemMode') }}
        <cloud-off-round />
      </div>
      <el-switch v-model="isAutoUI" @change="toggleAuto" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.theme.primaryColor') }}</div>
      <div class="settings__theme">
        <el-select
          v-model="settings.primaryColor"
          style="width: 183px"
          popper-class="settings__theme-popper"
        >
          <el-option-group
            v-for="group in predefineColorsMap"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="item in group.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="settings__theme-item">
                <el-tag :color="item.value" style="margin-right: 8px" size="small" />
                <span :style="{ color: item.value }">{{ item.label }}</span>
              </div>
            </el-option>
          </el-option-group>
        </el-select>
        <el-color-picker v-model="settings.primaryColor" :predefine="predefineColors" />
      </div>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.theme.colorfulMode') }}</div>
      <el-switch v-model="settings.colorfulMode" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.clock.invertColorLight') }}</div>
      <el-switch v-model="settings.time.invertColor.light" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.clock.invertColorDark') }}</div>
      <el-switch v-model="settings.time.invertColor.night" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('newtab:settings.shortcut.whiteTextInLightMode') }}
      </div>
      <el-switch v-model="settings.shortcut.whiteTextInLightMode" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.yiyan.invertColorLight') }}</div>
      <el-switch v-model="settings.yiyan.invertColor.light" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.yiyan.invertColorDark') }}</div>
      <el-switch v-model="settings.yiyan.invertColor.night" />
    </div>
  </div>
</template>

<style lang="scss">
.settings__theme {
  display: flex;
  column-gap: 8px;
  align-items: center;
}

.settings__theme-popper {
  padding: 6px 0;
  overflow: hidden;

  .el-select-dropdown__list {
    padding: 2px 0;
  }
}

.settings__theme-item {
  .el-tag {
    aspect-ratio: 1;
    border: none;
  }
}
</style>
