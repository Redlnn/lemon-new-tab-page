<script setup lang="ts">
import { load } from 'jinrishici'
import { useWindowSize } from '@vueuse/core'
import { onMounted, ref } from 'vue'

import { useFocusStore, useSettingsStore } from '@/newtab/js/store'

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
    (err) => {
      yiyan.value = err.errMessage
    }
  )
})
</script>

<template>
  <Transition>
    <div
      class="yiyan-wrapper"
      v-if="settingsStore.enableYiyan && focusStore.isFocused && height >= 800"
    >
      <div class="yiyan">
        <p class="yiyan-content">「 {{ yiyan }} 」</p>
        <p class="yiyan-extra">—— 《{{ yiyanOrigin }}》</p>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.yiyan-wrapper {
  position: absolute;
  bottom: 100px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.yiyan {
  width: 530px;
  text-align: center;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
  color: var(--el-fill-color-blank);
  border-radius: 20px;
  padding: 6px 14px;
  transition: all 0.25s ease-in-out;

  .yiyan-content {
    transition: all 0.25s ease-in-out;
  }

  .yiyan-extra {
    opacity: 0;
    transition: all 0.25s ease-in-out;
    margin-top: 8px;
    font-size: 0.95em;
  }

  html.dark & {
    color: var(--el-text-color-primary);
  }

  &:hover {
    background-color: color-mix(in oklab, var(--el-bg-color), transparent 90%);
    backdrop-filter: blur(10px);

    .yiyan-extra {
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

.v-enter-active,
.v-leave-active {
  transition: all 0.25s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
