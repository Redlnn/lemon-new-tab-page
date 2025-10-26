<script setup lang="ts">
import { useColorMode, useDark, usePreferredDark, useTimeoutFn } from '@vueuse/core'

import { CloudOffRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { defaultSettings, useSettingsStore } from '@/shared/settings'

const { t } = useTranslation('settings')

const settings = useSettingsStore()
const { store } = useColorMode()

const predefineColorsMapClassic = [
  { value: '#d75455', labelKey: 'theme.colorNames.classic.crimson' },
  { value: '#ec6800', labelKey: 'theme.colorNames.classic.orangeRed' },
  { value: defaultSettings.primaryColor, labelKey: 'theme.colorNames.classic.yamabuki' },
  { value: '#aacf53', labelKey: 'theme.colorNames.classic.yellowGreen' },
  { value: '#008899', labelKey: 'theme.colorNames.classic.teal' },
  { value: '#1677ff', labelKey: 'theme.colorNames.classic.antDesign' }, // Ant Design Primary
  { value: '#1e50a2', labelKey: 'theme.colorNames.classic.lapis' },
  { value: '#4d5aaf', labelKey: 'theme.colorNames.classic.bellflower' }
]

const predefineColorsMapAnime = [
  { value: '#39C5BB', labelKey: 'theme.colorNames.anime.miku' },
  { value: '#66CCFF', labelKey: 'theme.colorNames.anime.luo' },
  { value: '#3388bb', labelKey: 'theme.colorNames.anime.mygo' },
  { value: '#730f40', labelKey: 'theme.colorNames.anime.aveMujica' },
  { value: '#f7b3c2', labelKey: 'theme.colorNames.anime.bocchi' },
  { value: '#ff2291', labelKey: 'theme.colorNames.anime.kessoku' },
  { value: '#d90e2c', labelKey: 'theme.colorNames.anime.togeari' }
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
        {{ t('theme.darkMode') }}
        <cloud-off-round />
      </div>
      <el-switch v-model="isDarkUI" @change="toggleDark" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('theme.systemMode') }}
        <cloud-off-round />
      </div>
      <el-switch v-model="isAutoUI" @change="toggleAuto" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('theme.primaryColor') }}</div>
      <div class="settings__theme">
        <el-select
          v-model="settings.primaryColor"
          style="width: 183px"
          popper-class="settings-item-popper"
        >
          <el-option-group
            v-for="group in predefineColorsMap"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="item in group.options"
              :key="item.value"
              :label="t(item.labelKey)"
              :value="item.value"
            >
              <div class="settings__theme-item">
                <el-tag :color="item.value" style="margin-right: 8px" size="small" />
                <span :style="{ color: item.value }">{{ t(item.labelKey) }}</span>
              </div>
            </el-option>
          </el-option-group>
        </el-select>
        <el-color-picker v-model="settings.primaryColor" :predefine="predefineColors" />
      </div>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('theme.colorfulMode') }}
      </div>
      <el-switch v-model="settings.colorfulMode" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.invertColorLight') }}</div>
      <el-switch v-model="settings.time.invertColor.light" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.invertColorDark') }}</div>
      <el-switch v-model="settings.time.invertColor.night" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('shortcut.whiteTextInLightMode') }}
      </div>
      <el-switch v-model="settings.shortcut.whiteTextInLightMode" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('yiyan.invertColorLight') }}</div>
      <el-switch v-model="settings.yiyan.invertColor.light" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('yiyan.invertColorDark') }}</div>
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

.settings__theme-item {
  .el-tag {
    aspect-ratio: 1;
    border: none;
  }
}
</style>
