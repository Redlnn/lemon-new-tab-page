<script lang="ts" setup>
import { browser } from 'wxt/browser';
import { type ComputedRef, ref, watch } from 'vue'
import { useDateFormat, useElementHover, useNow } from '@vueuse/core'

import { useSettingsStore } from '../js/store/settingsStore'

const settingsStore = useSettingsStore()
const time = ref()
const isTimeHovered = useElementHover(time)

watch(isTimeHovered, (isTimeHovered) => {
  if (isTimeHovered) {
    time.value.style.transform = 'scale(1.1)'
  } else {
    time.value.style.transform = null
  }
})

function customMeridiem(hours: number) {
  if (hours < 2) {
    return '深夜'
  } else if (hours < 7) {
    return '凌晨'
  } else if (hours < 11) {
    return '早上'
  } else if (hours < 14) {
    return '中午'
  } else if (hours < 17) {
    return '下午'
  } else if (hours < 19) {
    return '傍晚'
  } else if (hours < 23) {
    return '晚上'
  } else {
    return '深夜'
  }
}

const timeNow = useNow()
const lang = browser.i18n.getUILanguage()
const isChinese = lang.startsWith('zh')

const timeNowHour: ComputedRef<string> = useDateFormat(timeNow, 'HH')
const timeNowHourMeridiem: ComputedRef<string> = useDateFormat(timeNow, 'h')
const timeNowMinute = useDateFormat(timeNow, 'mm')
const timeNowMeridiemZH = useDateFormat(timeNow, 'aa', { customMeridiem })
const timeNowMeridiem = useDateFormat(timeNow, 'A', { locales: lang })
const timeNowWeekday = useDateFormat(timeNow, 'dddd')

function getlunarCalendar() {
  const lunarCalendarMatchRes = /([^年]{1,2}月.{2})/.exec(
    timeNow.value.toLocaleDateString(isChinese ? lang : 'zh', {
      dateStyle: 'long',
      calendar: 'chinese'
    })
  )
  return lunarCalendarMatchRes ? lunarCalendarMatchRes[0] : ''
}
</script>

<template>
  <div class="clock" ref="time">
    <div class="time">
      <span
        v-if="settingsStore.time.showMeridiem && isChinese"
        class="meridiem"
        style="margin-right: 5px"
        >{{ timeNowMeridiemZH }}</span
      >
      <span>
        <span class="hour">{{
          settingsStore.time.isMeridiem ? timeNowHourMeridiem : timeNowHour
        }}</span>
        <span class="colon">:</span>
        <span class="minute">{{ timeNowMinute }}</span>
      </span>
      <span
        v-if="settingsStore.time.showMeridiem && !isChinese"
        class="meridiem"
        style="margin-left: 5px"
      >
        {{ timeNowMeridiem }}
      </span>
    </div>
    <div class="date" v-if="settingsStore.time.showDate">
      <span>
        {{
          timeNow.toLocaleDateString(undefined, {
            dateStyle: 'long'
          })
        }}
        {{ timeNowWeekday }}
      </span>
      <span v-if="settingsStore.time.showLunar && isChinese">{{ ` ${getlunarCalendar()}` }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes twinkle {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
@keyframes delayedFadeIn {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.clock {
  text-align: center;
  color: var(--el-fill-color-blank);
  animation: delayedFadeIn 0.5s;
  transition: 0.25s cubic-bezier(0.5, 0, 0.5, 2);
  text-shadow: 0px 6px 16px rgba(0, 0, 0, 0.4);

  .time {
    font-size: 60px;
  }

  .date {
    margin-bottom: 5px;
  }

  html.dark & {
    color: var(--el-text-color-primary);
  }

  .meridiem {
    font-size: 40px;
  }

  .colon {
    animation: twinkle 1s ease infinite;
  }
}
</style>
