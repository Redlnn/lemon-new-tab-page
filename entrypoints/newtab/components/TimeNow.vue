<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useElementHover, useNow } from '@vueuse/core'

import dayjs from 'dayjs/esm'

import { isChinese } from '@/shared/lang'
import { useSettingsStore } from '@/shared/settings'

const settingsStore = useSettingsStore()
const time = ref()
const isTimeHovered = useElementHover(time)

function customMeridiem(hours: number) {
  if (hours < 2) return '深夜'
  if (hours < 7) return '凌晨'
  if (hours < 11) return '早上'
  if (hours < 14) return '中午'
  if (hours < 17) return '下午'
  if (hours < 19) return '傍晚'
  if (hours < 23) return '晚上'
  return '深夜'
}

const timeNow = useNow({ interval: 1000 })
// date doesn't need to update every second. update once per minute instead.
const dateNow = useNow({ interval: 60 * 1000 })

const formattedTime = computed(() => {
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
  const now = dayjs(dateNow.value)
  return {
    meridiemZH: customMeridiem(now.hour()),
    weekday: now.format('dddd'),
    date: now.format('LL'),
    lunar: now.format('LMLD')
  }
})

watch(isTimeHovered, (isTimeHovered) => {
  time.value.style.transform = isTimeHovered ? 'scale(1.1)' : null
})
</script>

<template>
  <div
    ref="time"
    class="clock"
    :class="[
      settingsStore.time.enableShadow ? 'clock--shadow' : undefined,
      settingsStore.time.invertColor.light ? ['clock--invert', 'clock--light'] : undefined,
      settingsStore.time.invertColor.night ? ['clock--invert', 'clock--night'] : undefined
    ]"
  >
    <div
      class="clock__time-container"
      :class="[settingsStore.time.small ? 'clock__time-container-small' : undefined]"
    >
      <span v-if="settingsStore.time.showMeridiem && isChinese" class="clock__meridiem">
        {{ formattedDate.meridiemZH }}
      </span>
      <span class="clock__time">
        <span class="clock__hour">{{
          settingsStore.time.isMeridiem ? formattedTime.hourMeridiem : formattedTime.hour
        }}</span>
        <span
          class="clock__colon"
          :class="{ 'clock__colon--blinking': settingsStore.time.blinkingColon }"
          >:</span
        >
        <span class="clock__minute">{{ formattedTime.minute }}</span>
      </span>
      <span
        v-if="settingsStore.time.showMeridiem && !isChinese"
        class="clock__meridiem"
        style="margin-left: 5px"
      >
        {{ formattedTime.meridiem }}
      </span>
    </div>
    <div v-if="settingsStore.time.showDate" class="clock__date">
      <span>
        {{ formattedDate.date }}
        {{ formattedDate.weekday }}
      </span>
      <span v-if="settingsStore.time.showLunar && isChinese">{{ ` ${formattedDate.lunar}` }}</span>
    </div>
  </div>
</template>
