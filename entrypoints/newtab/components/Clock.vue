<script lang="ts" setup>
import { useNow, useTimeoutFn } from '@vueuse/core'

import dayjs from 'dayjs/esm'
import { useTranslation } from 'i18next-vue'

import { isChinese } from '@/shared/lang'
import { useSettingsStore } from '@/shared/settings'

const { t, i18next } = useTranslation('newtab')
const settings = useSettingsStore()
const time = ref()

const currentLang = ref(i18next.language)

i18next.on('languageChanged', (lng) => {
  useTimeoutFn(() => {
    currentLang.value = lng
  }, 100)
})

function customMeridiem(hours: number) {
  if (hours < 2) return t('time.lateNight')
  if (hours < 7) return t('time.dawn')
  if (hours < 11) return t('time.morning')
  if (hours < 14) return t('time.noon')
  if (hours < 17) return t('time.afternoon')
  if (hours < 19) return t('time.dusk')
  if (hours < 23) return t('time.evening')
  return t('time.lateNight')
}

const timeNow = useNow({ interval: 1000 })
const dateNow = useNow({ interval: 60 * 1000 })

const formattedTime = computed(() => {
  void currentLang.value // 作为响应式依赖，确保语言切换时重新计算
  const now = dayjs(timeNow.value)
  return {
    hour: now.format('HH'),
    hourMeridiem: now.format('h'),
    minute: now.format('mm'),
    meridiem: now.format('A'),
    lunar: now.format('LhLK')
  }
})

const formattedDate = computed(() => {
  void currentLang.value // 作为响应式依赖，确保语言切换时重新计算
  const now = dayjs(dateNow.value)
  return {
    meridiemZH: customMeridiem(now.hour()),
    weekday: now.format('dddd'),
    date: now.format('LL'),
    lunar: now.format('LMLD')
  }
})
</script>

<template>
  <div
    ref="time"
    class="clock noselect"
    :class="[
      settings.time.enableShadow ? 'clock--shadow' : undefined,
      settings.time.invertColor.light ? ['clock--invert', 'clock--light'] : undefined,
      settings.time.invertColor.night ? ['clock--invert', 'clock--night'] : undefined
    ]"
  >
    <div
      class="clock__time-container"
      :class="[settings.time.small ? 'clock__time-container-small' : undefined]"
    >
      <span v-if="settings.time.showMeridiem && isChinese" class="clock__meridiem">
        {{ formattedDate.meridiemZH }}
      </span>
      <span class="clock__time">
        <span class="clock__hour">
          {{ settings.time.isMeridiem ? formattedTime.hourMeridiem : formattedTime.hour }}
        </span>
        <span
          class="clock__colon"
          :class="{ 'clock__colon--blinking': settings.time.blinkingColon }"
          >:</span
        >
        <span class="clock__minute">{{ formattedTime.minute }}</span>
      </span>
      <span
        v-if="settings.time.showMeridiem && !isChinese"
        class="clock__meridiem"
        style="margin-left: 5px"
      >
        {{ formattedTime.meridiem }}
      </span>
    </div>
    <div v-if="settings.time.showDate" class="clock__date">
      <span>
        {{ formattedDate.date }}
        {{ formattedDate.weekday }}
      </span>
      <span v-if="settings.time.showLunar && isChinese">{{ ` ${formattedDate.lunar}` }}</span>
    </div>
  </div>
</template>
