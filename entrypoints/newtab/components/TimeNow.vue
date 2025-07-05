<script lang="ts" setup>
import { browser } from 'wxt/browser'
import { type ComputedRef, ref, watch } from 'vue'
import { useDateFormat, useElementHover, useNow } from '@vueuse/core'

import { useSettingsStore } from '@/shared/settings'

const settingsStore = useSettingsStore()
const time = ref()
const isTimeHovered = useElementHover(time)

watch(isTimeHovered, (isTimeHovered) => {
  time.value.style.transform = isTimeHovered ? 'scale(1.1)' : null
})

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
  <div
    ref="time"
    class="clock"
    :class="[
      settingsStore.time.enableShadow ? 'clock--shadow' : undefined,
      settingsStore.time.invertColor.light ? ['clock--invert', 'clock--light'] : undefined,
      settingsStore.time.invertColor.night ? ['clock--invert', 'clock--night'] : undefined
    ]"
  >
    <div class="clock__time">
      <span
        v-if="settingsStore.time.showMeridiem && isChinese"
        class="clock__meridiem"
        style="margin-right: 5px"
        >{{ timeNowMeridiemZH }}</span
      >
      <span style="font-variant-numeric: tabular-nums">
        <span class="clock__hour">{{
          settingsStore.time.isMeridiem ? timeNowHourMeridiem : timeNowHour
        }}</span>
        <span class="clock__colon">:</span>
        <span class="clock__minute">{{ timeNowMinute }}</span>
      </span>
      <span
        v-if="settingsStore.time.showMeridiem && !isChinese"
        class="clock__meridiem"
        style="margin-left: 5px"
      >
        {{ timeNowMeridiem }}
      </span>
    </div>
    <div v-if="settingsStore.time.showDate" class="clock__date">
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

<style lang="scss">
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

@keyframes delayedFadeIn {
  0%,
  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.clock {
  color: var(--el-fill-color-blank);
  text-align: center;
  transition:
    font-size 0.25s cubic-bezier(0.5, 0, 0.5, 2),
    transform 0.25s cubic-bezier(0.5, 0, 0.5, 2),
    text-shadow var(--el-transition-duration-fast) ease,
    color var(--el-transition-duration-fast) ease;
  animation: delayedFadeIn 0.5s;

  &--shadow {
    text-shadow: 0 6px 16px rgb(0 0 0 / 40%);
  }

  &__time {
    font-size: 60px;
  }

  &__date {
    margin-bottom: 5px;
  }

  &--invert.clock--light,
  html.dark & {
    color: var(--el-text-color-primary);
  }

  html.dark &.clock--invert.clock--night {
    color: var(--el-fill-color-extra-light);
  }

  &__meridiem {
    font-size: 40px;
  }

  &__colon {
    animation: twinkle 1s ease infinite;
  }
}

@media screen and (width <= 600px) {
  .clock {
    &__time {
      font-size: 50px;
    }

    &__meridiem {
      font-size: 35px;
    }

    &__date {
      font-size: 13px;
    }
  }
}
</style>
