<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useWindowSize } from '@vueuse/core'

import { useSettingsStore } from '@/shared/settings'
import { getYiyanCache, isCacheFresh, setYiyanCache } from '@/shared/yiyan'
import { yiyanProviders } from '@/shared/yiyan/providers'

import { useFocusStore } from '@newtab/scripts/store'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const { height } = useWindowSize()

const yiyan = ref<string>()
const yiyanOrigin = ref<string>()

onMounted(async () => {
  try {
    const cache = await getYiyanCache()
    if (isCacheFresh(cache) && cache?.provider === settingsStore.yiyan.provider) {
      // use cached response (keeps original raw in cache.raw)
      const res = cache.res
      yiyan.value = res?.yiyan
      yiyanOrigin.value = res?.yiyanOrigin
    } else {
      const res = await yiyanProviders[settingsStore.yiyan.provider].load()
      yiyan.value = res.yiyan
      yiyanOrigin.value = res.yiyanOrigin
      // store provider name and original response
      await setYiyanCache(settingsStore.yiyan.provider, res)
    }
  } catch (err) {
    console.error('YiYan load error', err)
  }
})

const isYiyanEnabled = computed(
  () =>
    yiyan.value &&
    settingsStore.yiyan.enabled &&
    height.value >= 800 &&
    (focusStore.isFocused || settingsStore.yiyan.alwaysShow)
)
</script>

<template>
  <Transition>
    <div v-if="isYiyanEnabled" class="yiyan">
      <div
        class="yiyan__main"
        :class="{
          'yiyan--shadow': settingsStore.yiyan.enableShadow,
          'yiyan--invert yiyan--light': settingsStore.yiyan.invertColor.light,
          'yiyan--invert yiyan--night': settingsStore.yiyan.invertColor.night,
          'yiyan--blur': !settingsStore.perf.disableYiyanBlur
        }"
      >
        <p class="yiyan__content">「 {{ yiyan }} 」</p>
        <p v-if="yiyanOrigin" class="yiyan__extra">—— {{ yiyanOrigin }}</p>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
.yiyan {
  position: absolute;
  bottom: 100px;
  display: flex;
  justify-content: center;
  width: 100%;

  &__main {
    width: 530px;
    padding: 6px 14px;
    color: var(--el-fill-color-darker);
    text-align: center;
    border-radius: 20px;
    transition:
      background-color var(--el-transition-duration-fast) ease,
      backdrop-filter var(--el-transition-duration-fast) ease,
      color var(--el-transition-duration-fast) ease;

    .yiyan__extra {
      margin-top: 8px;
      font-size: 0.95em;
      opacity: 0;
      transition: opacity var(--el-transition-duration-fast) ease;
    }

    &.yiyan--shadow {
      text-shadow: 1px 1px 3px rgb(0 0 0 / 40%);

      &:hover {
        text-shadow: 1px 1px 3px rgb(0 0 0 / 60%);
      }
    }

    &:hover {
      color: var(--el-fill-color-blank);
      background-color: var(--le-bg-color-overlay-opacity-60);

      &.yiyan--blur {
        backdrop-filter: blur(10px) saturate(1.4) brightness(1.1);
      }

      .yiyan__extra {
        opacity: 1;
      }
    }

    &.yiyan--invert.yiyan--light,
    html.dark & {
      color: var(--el-text-color-regular);

      &:hover {
        color: var(--el-text-color-primary);
      }
    }

    html.dark &.yiyan--invert.yiyan--night {
      color: var(--el-fill-color-extra-light);

      &:hover {
        color: var(--el-fill-color);
      }
    }

    @media screen and (width <= 600px) {
      width: 80%;
      font-size: 0.9em;
    }

    @media screen and (width <= 400px) {
      width: 80%;
    }
  }
}

.v-enter-active,
.v-leave-active {
  transition: all var(--el-transition-duration-fast) ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
