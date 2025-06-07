<script setup lang="ts">
import { load } from 'jinrishici'
import { useWindowSize } from '@vueuse/core'
import { onMounted, ref } from 'vue'

import { useFocusStore, useSettingsStore } from '@/newtab/scripts/store'

const focusStore = useFocusStore()
const settingsStore = useSettingsStore()
const { height } = useWindowSize()

const yiyan = ref('')
const yiyanOrigin = ref('')

onMounted(() => {
  load(
    (res) => {
      yiyan.value = res.data.content
      yiyanOrigin.value = res.data.origin.title
    },
    () => {
      // 这里不会触发，但不写又不行
    }
  )
})
</script>

<template>
  <Transition>
    <div
      v-if="settingsStore.search.enableYiyan && focusStore.isFocused && height >= 800 && yiyan"
      class="yiyan"
    >
      <div
        class="yiyan__main"
        :class="[
          settingsStore.time.enableShadow ? 'yiyan--shadow' : undefined,
          settingsStore.time.invertColor.light ? ['yiyan--invert', 'yiyan--light'] : undefined,
          settingsStore.time.invertColor.night ? ['yiyan--invert', 'yiyan--night'] : undefined
        ]"
      >
        <p class="yiyan__content">「 {{ yiyan }} 」</p>
        <p class="yiyan__extra">—— 《{{ yiyanOrigin }}》</p>
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
      text-shadow: 0 0 20px rgb(0 0 0 / 80%);
    }

    &:hover {
      color: var(--el-fill-color-blank);
      background-color: color-mix(in srgb, var(--el-bg-color), transparent 90%);
      backdrop-filter: blur(10px) saturate(1.2);

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
