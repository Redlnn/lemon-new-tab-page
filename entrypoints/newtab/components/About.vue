<script setup lang="ts">
import { version } from '@/package.json'

import { ref } from 'vue'
import { useDateFormat, useNow } from '@vueuse/core'
import { Edge, Chrome, Github, Firefox } from '@vicons/fa'

import { i18n } from '@/.wxt/i18n'
import BaseDialog from './BaseDialog.vue'

const opened = ref(true)
const year = useDateFormat(useNow(), 'YYYY')

function show() {
  opened.value = true
}
function hide() {
  opened.value = false
}
function toggleShow() {
  opened.value = !opened.value
}

defineExpose({ show, hide, toggleShow })
</script>

<template>
  <base-dialog v-model="opened" container-class="about__dialog">
    <section>
      <div class="ext-icon">
        <div class="ext-icon__container"></div>
      </div>
      <h1 class="ext-name">{{ i18n.t('extension.name') }}</h1>
      <div class="ext-version">{{ version }}</div>
      <el-link class="yiyan-links" :underline="'never'" href="https://www.jinrishici.com">
        {{ i18n.t('newtab.about.yiyanApiProvider', ['今日诗词']) }}
      </el-link>
      <div class="copyright">
        ©&nbsp;{{ year }}&nbsp;
        <el-link :underline="'never'" href="https://github.com/Redlnn"> Red_lnn </el-link>
      </div>
      <el-space class="ext-links" :size="12">
        <el-link :underline="'never'" href="https://github.com/Redlnn/lemon-new-tab-page/">
          <el-icon :size="20"><Github /></el-icon>
        </el-link>
        <el-link
          :underline="'never'"
          href="https://chromewebstore.google.com/detail/bhbpmpflnpnkjanfgbjjhldccbckjohb"
        >
          <el-icon :size="20"><Chrome /></el-icon>
        </el-link>
        <el-link
          :underline="'never'"
          class="ext-link"
          href="https://microsoftedge.microsoft.com/addons/detail/keikkgfgidagjlicckkangkfgnbdjdnh"
        >
          <el-icon :size="20"><Edge /></el-icon>
        </el-link>
        <el-link
          :underline="'never'"
          href="https://addons.mozilla.org/firefox/addon/lemon-new-tab/"
        >
          <el-icon :size="20"><Firefox /></el-icon>
        </el-link>
      </el-space>
    </section>
  </base-dialog>
</template>

<style lang="scss">
.about__dialog {
  .ext-icon {
    width: 100%;

    &__container {
      width: 55px;
      height: 55px;
      margin: 0 auto;
      background-color: var(--el-fill-color-extra-light);
      background-image: url('/icon.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      background-size: 80%;
      border: var(--el-border);
      border-radius: 15px;
    }
  }

  .ext-name {
    font-size: 18px;
    text-align: center;
  }

  .ext-version {
    width: min-content;
    padding: 3px 8px;
    margin: 0 auto;
    font-size: 13px;
    color: color-mix(in srgb, var(--el-color-primary-dark-2), var(--el-color-primary-light-3) 50%);
    background-color: color-mix(in srgb, var(--el-color-primary-light-7), transparent 30%);
    border-radius: 5px;
  }

  .ext-links {
    display: flex;
    justify-content: center;
    margin: 18px 0;
  }

  .yiyan-links {
    display: flex;
    margin: 18px 0 5px;
    color: var(--el-text-color-primary);
  }

  .copyright {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);

    .el-link {
      color: inherit;
    }
  }
}
</style>
