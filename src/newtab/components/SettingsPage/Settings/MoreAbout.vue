<script setup lang="ts">
import { version } from '@/../package.json'

import { useDateFormat, useNow } from '@vueuse/core'
import { InfoCircleOutlined } from '@vicons/antd'

const year = useDateFormat(useNow(), 'YYYY')
</script>

<template>
  <h3 class="settings-title">
    <el-icon><info-circle-outlined /></el-icon>
    <span>关于</span>
  </h3>
  <div class="about">
    <div class="ext-info">
      <p class="ext-name">柠檬启动页（Lemon New Tab）</p>
      <p class="ext-desc">版本 {{ version }}</p>
    </div>
    <div class="ext-links">
      <a href="https://github.com/Redlnn/lemon-new-tab-page/" target="_blank">项目地址</a>
      <!-- <a>商店地址</a> -->
    </div>
    <div class="ext-license">
      <a>遵循 MIT 开源协议</a>
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
      display: block;
    }
  }

  .ext-links {
    color: var(--el-color-primary);
  }

  .ext-license {
    color: var(--el-text-color-regular);
    font-size: 12px;
  }
}
</style>
