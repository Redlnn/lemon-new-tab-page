<script lang="ts" setup>
import { type ComputedRef, ref, watch } from 'vue'
import { useDateFormat, useElementHover, useNow } from '@vueuse/core'

import { browser } from 'wxt/browser'
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

const timeNowHour: ComputedRef<string> = useDateFormat(useNow(), 'HH')
const timeNowHourMeridiem: ComputedRef<string> = useDateFormat(useNow(), 'h')
const timeNowMinute = useDateFormat(useNow(), 'mm')
const timeNowMeridiemCN = useDateFormat(useNow(), 'aa', { customMeridiem })
const timeNowMeridiem = useDateFormat(useNow(), 'A')
</script>

<template>
  <div class="time" ref="time">
    <span
      v-if="
        settingsStore.time.showMeridiem && browser.i18n.getMessage('@@ui_locale').startsWith('zh')
      "
      class="meridiem"
      style="margin-right: 5px"
      >{{ timeNowMeridiemCN }}</span
    >
    <span>
      <span class="hour">{{
        settingsStore.time.isMeridiem ? timeNowHourMeridiem : timeNowHour
      }}</span>
      <span class="colon">:</span>
      <span class="minute">{{ timeNowMinute }}</span>
    </span>
    <span
      v-if="
        settingsStore.time.showMeridiem && !browser.i18n.getMessage('@@ui_locale').startsWith('zh')
      "
      class="meridiem"
      style="margin-left: 5px"
      >{{ timeNowMeridiem }}</span
    >
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

.time {
  text-align: center;
  color: var(--el-fill-color-blank);
  font-size: 60px;
  animation: delayedFadeIn 0.5s;
  transition: 0.25s cubic-bezier(0.5, 0, 0.5, 2);
  text-shadow: 0px 6px 16px rgba(0, 0, 0, 0.4);

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
