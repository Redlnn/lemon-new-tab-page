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

<style lang="scss" scoped>
.yiyan {
  position: absolute;
  bottom: 100px;
  width: 100%;
  display: flex;
  justify-content: center;

  &__main {
    width: 530px;
    text-align: center;
    color: var(--el-fill-color-darker);
    border-radius: 20px;
    padding: 6px 14px;
    transition:
      background-color var(--el-transition-duration-fast) ease,
      backdrop-filter var(--el-transition-duration-fast) ease,
      color var(--el-transition-duration-fast) ease;

    .yiyan__extra {
      opacity: 0;
      transition: opacity var(--el-transition-duration-fast) ease;
      margin-top: 8px;
      font-size: 0.95em;
    }

    &.yiyan--shadow {
      text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
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

    &:hover {
      background-color: color-mix(in oklab, var(--el-bg-color), transparent 90%);
      backdrop-filter: blur(10px) saturate(1.2);
      color: var(--el-fill-color-blank);

      .yiyan__extra {
        opacity: 1;
      }
    }

    @media screen and (max-width: 600px) {
      width: 80%;
      font-size: 0.9em;
    }

    @media screen and (max-width: 400px) {
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
