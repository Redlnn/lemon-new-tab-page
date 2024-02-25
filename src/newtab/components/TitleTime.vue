<script lang="ts" setup>
import { type ComputedRef, ref, watch } from 'vue'
import { useDateFormat, useElementHover, useNow } from '@vueuse/core'

import { useSettingsStore } from '@/newtab/js/store'

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
    return '凌晨'
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
  } else {
    return '晚上'
  }
}

const timeNowHour: ComputedRef<string> = useDateFormat(useNow(), 'HH')
const timeNowHourMeridiem: ComputedRef<string> = useDateFormat(useNow(), 'h')
const timeNowMinute = useDateFormat(useNow(), 'mm')
const timeNowMeridiem = useDateFormat(useNow(), 'aa', { customMeridiem })
</script>

<template>
  <div class="time" ref="time">
    <span v-if="settingsStore.showMeridiem" class="meridiem">{{ timeNowMeridiem }}</span>
    <span>
      <span class="hour">{{ settingsStore.isMeridiem ? timeNowHourMeridiem : timeNowHour }}</span>
      <span class="colon">:</span>
      <span class="minute">{{ timeNowMinute }}</span>
    </span>
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
  color: var(--el-bg-color);
  font-size: 60px;
  animation: delayedFadeIn 0.5s;
  transition: 0.25s cubic-bezier(0.5, 0, 0.5, 2);
  text-shadow: 0px 6px 16px rgba(0, 0, 0, 0.4);

  .meridiem {
    font-size: 40px;
    margin-right: 5px;
  }

  .colon {
    animation: twinkle 1s ease infinite;
  }
}
</style>
