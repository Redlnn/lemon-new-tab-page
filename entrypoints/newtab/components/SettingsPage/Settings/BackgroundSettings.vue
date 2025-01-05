<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { PictureOutlined } from '@vicons/antd'
import { Plus } from '@vicons/fa'
import { type UploadProps, type UploadRequestOptions, type ElInput } from 'element-plus'

import { i18n } from '@/.wxt/i18n'
import { isImageFile } from '@/newtab/scripts/img'
import { uploadBackgroundImage, useSettingsStore } from '@/newtab/scripts/store'
import { BgType } from '@/newtab/scripts/storages/settingsStorage'

const settingsStore = useSettingsStore()
const isChrome = import.meta.env.CHROME || import.meta.env.EDGE
const tmpUrl = ref('')
const onlineUrlInput = ref<InstanceType<typeof ElInput>>()

onMounted(() => {
  if (settingsStore.background.onlineUrl) {
    tmpUrl.value = settingsStore.background.onlineUrl
  }
})

const beforeBackgroundUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!isImageFile(rawFile)) {
    ElMessage.error(i18n.t('newtab.settings.background.error.fileIsNotImage'))
    return false
  }
  return true
}

function changeOnlineBg(e: Event) {
  onlineUrlInput.value?.blur()
  const _url = (e.target as HTMLInputElement).value
  if (!_url) {
    settingsStore.background.bgType = BgType.None
    settingsStore.background.onlineUrl = ''
    tmpUrl.value = ''
    return
  }
  const hostname = new URL(_url).hostname

  if (!isChrome) {
    settingsStore.background.onlineUrl = _url
    return
  }

  const permissions = {
    origins: [`*://${hostname}/*`]
  }
  chrome.permissions.contains(permissions, (granted) => {
    if (granted) {
      settingsStore.background.onlineUrl = _url
      return
    }
    ElMessageBox.confirm(
      `由于 Google 的安全策略，需要授予 ${hostname} 的访问权限才能获取背景，是否允许扩展申请访问该地址的权限`
    )
      .then(() => {
        chrome.permissions.request(permissions, (granted) => {
          if (granted) {
            ElMessage.success('已授予访问权限')
            settingsStore.background.onlineUrl = _url
            return
          }
          ElMessage.error('未授予权限，无法访问该地址')
          settingsStore.background.bgType = BgType.None
          tmpUrl.value = ''
        })
      })
      .catch(() => {
        settingsStore.background.bgType = BgType.None
        tmpUrl.value = ''
      })
  })
}

function onlineImageWarn() {
  if (settingsStore.background.onlineUrl) return
  ElMessageBox.confirm('使用未知来源的图片作为背景可能会使你的设备遭到攻击，是否继续？', '警告', {
    type: 'warning'
  }).catch(() => {
    settingsStore.background.bgType = BgType.None
  })
}
</script>

<template>
  <div class="settings-title">
    <el-icon><picture-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.background.title') }}</span>
  </div>
  <div class="setting-items-container">
    <div class="settings-item">
      <div class="settings-label">{{ i18n.t('newtab.settings.background.type.title') }}</div>
      <el-radio-group v-model="settingsStore.background.bgType">
        <el-radio :value="BgType.None">{{
          i18n.t('newtab.settings.background.type.none')
        }}</el-radio>
        <el-radio :value="BgType.Local">{{
          i18n.t('newtab.settings.background.type.local')
        }}</el-radio>
        <el-radio :value="BgType.Bing">{{
          i18n.t('newtab.settings.background.type.bing')
        }}</el-radio>
        <el-radio :value="BgType.Online" @change="onlineImageWarn">{{
          i18n.t('newtab.settings.background.type.online')
        }}</el-radio>
      </el-radio-group>
    </div>
    <el-input
      v-if="settingsStore.background.bgType === BgType.Online"
      ref="onlineUrlInput"
      v-model="tmpUrl"
      @blur="changeOnlineBg"
      @keydown.enter="changeOnlineBg"
      placeholder="https://example.com/image.jpg"
    ></el-input>
    <ul v-if="settingsStore.background.bgType === BgType.Online" class="online-bg-tips">
      <li>{{ i18n.t('newtab.settings.background.onlineTips.a') }}</li>
      <li>{{ i18n.t('newtab.settings.background.onlineTips.b') }}</li>
      <li>{{ i18n.t('newtab.settings.background.onlineTips.c') }}</li>
      <li>{{ i18n.t('newtab.settings.background.onlineTips.d') }}</li>
    </ul>
    <el-upload
      v-if="settingsStore.background.bgType === BgType.Local"
      class="bg-uploader"
      :show-file-list="false"
      :http-request="(option: UploadRequestOptions) => uploadBackgroundImage(option.file)"
      :before-upload="beforeBackgroundUpload"
      accept="image/*"
    >
      <img
        v-if="settingsStore.localBackground.bgUrl"
        :src="settingsStore.localBackground.bgUrl"
        class="bg-uploader__img"
      />
      <el-icon v-else class="bg-uploader__icon"><plus /></el-icon>
    </el-upload>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.background.vignette') }}</div>
      <el-switch v-model="settingsStore.background.bgDarkCorners" />
    </div>
    <div v-if="settingsStore.background.bgType !== BgType.None" class="settings-item">
      <div class="settings-label">{{ i18n.t('newtab.settings.background.blur') }}</div>
      <el-slider v-model="settingsStore.background.bgBlur" :show-tooltip="false" />
    </div>
    <div class="settings-item">
      <div class="settings-label">{{ i18n.t('newtab.settings.background.mask_opacity') }}</div>
      <el-slider v-model="settingsStore.background.bgMaskPpacity" :show-tooltip="false" />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.background.mask_color') }}</div>
      <el-color-picker
        v-model="settingsStore.background.maskColor"
        :predefine="['#fff', '#000']"
        @change="
          () => {
            if (settingsStore.background.maskColor === null) {
              settingsStore.background.maskColor = '#000'
            }
          }
        "
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.bg-uploader__img {
  max-width: 100%;
  object-fit: cover;
}

.bg-uploader:deep() .el-upload {
  border: 1px dashed var(--el-border-color-darker);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);

  &:hover {
    border-color: var(--el-color-primary);

    .el-icon.bg-uploader__icon {
      color: var(--el-color-primary);
    }
  }
}

.el-icon.bg-uploader__icon {
  font-size: 28px;
  color: var(--el-text-color-placeholder);
  width: 350px;
  height: 200px;
  text-align: center;
  transition: var(--el-transition-duration-fast);
}

:deep().el-color-picker__trigger {
  padding: 0;
  overflow: hidden;
  border-radius: 8px;

  .el-color-picker__color {
    border: none;
    border-radius: none;
  }
}

.online-bg-tips {
  font-size: 12px;
  margin-top: 5px;
  color: var(--el-text-color-placeholder);
  padding: 5px 15px 0;

  li {
    margin: 3px 0;
  }
}
</style>
