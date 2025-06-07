<script setup lang="ts">
import { version } from '@/package.json'

import { InfoCircleOutlined } from '@vicons/antd'
import { useDateFormat, useNow } from '@vueuse/core'

import { i18n } from '@/.wxt/i18n'

const year = useDateFormat(useNow(), 'YYYY')
</script>

<template>
  <div class="settings__title">
    <el-icon><info-circle-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.about.title') }}</span>
  </div>
  <div class="settings__items-container">
    <div class="settings__ext-info">
      <p class="settings__ext-name">{{ i18n.t('extension.name') }}</p>
      <p class="settings__ext-desc">{{ i18n.t('newtab.settings.about.version') }} {{ version }}</p>
    </div>
    <div class="settings__ext-links">
      <a
        class="settings__ext-link"
        href="https://github.com/Redlnn/lemon-new-tab-page/"
        target="_blank"
        >{{ i18n.t('newtab.settings.about.projectLink') }}</a
      >
      <a
        class="settings__ext-link"
        href="https://chromewebstore.google.com/detail/bhbpmpflnpnkjanfgbjjhldccbckjohb"
        target="_blank"
        >{{ i18n.t('newtab.settings.about.chromeExtensionLink') }}</a
      >
      <a
        class="settings__ext-link"
        href="https://microsoftedge.microsoft.com/addons/detail/keikkgfgidagjlicckkangkfgnbdjdnh"
        target="_blank"
        >{{ i18n.t('newtab.settings.about.edgeExtensionLink') }}</a
      >
      <a
        class="settings__ext-link"
        href="https://addons.mozilla.org/zh-CN/firefox/addon/%E6%9F%A0%E6%AA%AC%E8%B5%B7%E5%A7%8B%E9%A1%B5/"
        target="_blank"
        >{{ i18n.t('newtab.settings.about.firefoxExtensionLink') }}</a
      >
    </div>
    <div class="settings__ext-links">
      <span>
        {{ i18n.t('newtab.settings.about.yiyanApiProvider') }}
        <a class="settings__ext-link" href="https://www.jinrishici.com" target="_blank">
          今日诗词
        </a>
      </span>
    </div>
    <div class="settings__ext-license">
      <a>{{ i18n.t('newtab.settings.about.license') }}</a>
      <a>Copyright © {{ year }} Red_lnn. All rights reserved.</a>
    </div>
  </div>
</template>

<style lang="scss">
.settings {
  &__ext-name {
    margin-bottom: 0;
  }

  &__ext-desc {
    margin-top: 3px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  &__ext-links,
  &__ext-license {
    margin: 1em 0;

    a {
      display: table-row;
    }
  }

  &__ext-link {
    color: var(--el-color-primary);
    text-decoration: none;
  }

  &__ext-license {
    font-size: 12px;
    color: var(--el-text-color-regular);
  }
}
</style>
