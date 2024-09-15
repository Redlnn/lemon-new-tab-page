<script setup lang="ts">
import { version } from '@/package.json'

import { InfoCircleOutlined } from '@vicons/antd'
import { useDateFormat, useNow } from '@vueuse/core'

import { i18n } from '@/.wxt/i18n'

const year = useDateFormat(useNow(), 'YYYY')
</script>

<template>
  <div class="settings-title">
    <el-icon><info-circle-outlined /></el-icon>
    <span>关于</span>
  </div>
  <div class="setting-items-container about">
    <div class="ext-info">
      <p class="ext-name">{{ i18n.t('extension.name') }}</p>
      <p class="ext-desc">{{ i18n.t('newtab.settings.about.version') }} {{ version }}</p>
    </div>
    <div class="ext-links">
      <a href="https://github.com/Redlnn/lemon-new-tab-page/" target="_blank">{{
        i18n.t('newtab.settings.about.project_url')
      }}</a>
      <a
        href="https://chromewebstore.google.com/detail/bhbpmpflnpnkjanfgbjjhldccbckjohb"
        target="_blank"
        >{{ i18n.t('newtab.settings.about.chrome_extension_url') }}</a
      >
      <a
        href="https://microsoftedge.microsoft.com/addons/detail/keikkgfgidagjlicckkangkfgnbdjdnh"
        target="_blank"
        >{{ i18n.t('newtab.settings.about.edge_extension_url') }}</a
      >
      <a
        href="https://addons.mozilla.org/zh-CN/firefox/addon/%E6%9F%A0%E6%AA%AC%E8%B5%B7%E5%A7%8B%E9%A1%B5/"
        target="_blank"
        >{{ i18n.t('newtab.settings.about.firefox_extension_url') }}</a
      >
    </div>
    <div class="ext-links">
      <span>
        {{ i18n.t('newtab.settings.about.yiyan_api_provider') }}
        <a href="https://www.jinrishici.com" target="_blank"> 今日诗词 </a>
      </span>
    </div>
    <div class="ext-license">
      <a>{{ i18n.t('newtab.settings.about.license') }}</a>
      <a>Copyright © {{ year }} Red_lnn. All rights reserved.</a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.about {
  .ext-name {
    margin-bottom: 0;
  }
  .ext-desc {
    font-size: 13px;
    color: var(--el-text-color-regular);
    margin-top: 3px;
  }

  .ext-links,
  .ext-license {
    margin: 1em 0;

    a {
      display: table-row;
    }
  }

  .ext-links a {
    color: var(--el-color-primary);
    text-decoration: none;
  }

  .ext-license {
    color: var(--el-text-color-regular);
    font-size: 12px;
  }
}
</style>
