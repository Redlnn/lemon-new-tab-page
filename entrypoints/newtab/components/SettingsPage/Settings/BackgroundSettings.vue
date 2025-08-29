<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { PictureOutlined } from '@vicons/antd'
import { Plus } from '@vicons/fa'
import { CloudOffRound } from '@vicons/material'
import { type UploadProps, type UploadRequestOptions, type ElInput } from 'element-plus'

import { i18n } from '@/.wxt/i18n'
import { isImageFile } from '@/shared/image'
import { uploadBackgroundImage, useSettingsStore, BgType } from '@/shared/settings'

const settingsStore = useSettingsStore()
const isChrome = import.meta.env.CHROME || import.meta.env.EDGE
const tmpUrl = ref('')
const onlineUrlInput = ref<InstanceType<typeof ElInput>>()

const predefineMaskColor = ['#f2f3f5', '#000']

onMounted(() => {
  if (settingsStore.background.onlineUrl) {
    tmpUrl.value = settingsStore.background.onlineUrl
  }
})

const beforeBackgroundUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!isImageFile(rawFile)) {
    ElMessage.error(i18n.t('newtab.settings.background.warning.fileIsNotImage'))
    return false
  }
  return true
}

function handlePermissions(_url: string, hostname: string) {
  const permissions = { origins: [`*://${hostname}/*`] }
  chrome.permissions.contains(permissions, (granted) => {
    if (granted) {
      settingsStore.background.onlineUrl = _url
      return
    }
    ElMessageBox.confirm(i18n.t('newtab.settings.background.warning.securityPolicy', [hostname]))
      .then(() => {
        chrome.permissions.request(permissions, (granted) => {
          if (granted) {
            ElMessage.success(i18n.t('newtab.settings.background.warning.granted'))
            settingsStore.background.onlineUrl = _url
            return
          }
          ElMessage.error(i18n.t('newtab.settings.background.warning.notGranted'))
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

  handlePermissions(_url, hostname)
}

function onlineImageWarn() {
  if (settingsStore.background.onlineUrl) return
  ElMessageBox.confirm(
    i18n.t('newtab.settings.background.warning.unknownSource'),
    i18n.t('newtab.settings.background.warning.title'),
    {
      type: 'warning'
    }
  ).catch(() => {
    settingsStore.background.bgType = BgType.None
  })
}
</script>

<template>
  <div class="settings__title">
    <el-icon><picture-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.background.title') }}</span>
  </div>
  <div class="settings__items-container">
    <div class="settings__item">
      <div class="settings__label">
        {{ i18n.t('newtab.settings.background.type.title') }}
        <cloud-off-round />
      </div>
      <el-radio-group v-model="settingsStore.background.bgType">
        <el-radio :value="BgType.None">
          {{ i18n.t('newtab.settings.background.type.none') }}
        </el-radio>
        <el-radio :value="BgType.Local">
          {{ i18n.t('newtab.settings.background.type.local') }}
        </el-radio>
        <el-radio :value="BgType.Bing">
          {{ i18n.t('newtab.settings.background.type.bing') }}
        </el-radio>
        <el-radio :value="BgType.Online" @change="onlineImageWarn">
          {{ i18n.t('newtab.settings.background.type.online') }}
        </el-radio>
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
    <ul v-if="settingsStore.background.bgType === BgType.Online" class="settings__online-bg-tips">
      <li>{{ i18n.t('newtab.settings.background.onlineTips.a') }}</li>
      <li>{{ i18n.t('newtab.settings.background.onlineTips.b') }}</li>
      <li>{{ i18n.t('newtab.settings.background.onlineTips.c') }}</li>
      <li>{{ i18n.t('newtab.settings.background.onlineTips.d') }}</li>
    </ul>
    <el-upload
      v-if="settingsStore.background.bgType === BgType.Local"
      class="settings__bg-uploader"
      :show-file-list="false"
      :http-request="(option: UploadRequestOptions) => uploadBackgroundImage(option.file)"
      :before-upload="beforeBackgroundUpload"
      accept="image/*"
    >
      <img
        v-if="settingsStore.localBackground.url"
        :src="settingsStore.localBackground.url"
        class="settings__bg-uploader-img"
      />
      <el-icon v-else class="settings__bg-uploader-icon"><plus /></el-icon>
    </el-upload>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.background.enableVignetting') }}</div>
      <el-switch v-model="settingsStore.background.enableVignetting" />
    </div>
    <div v-if="settingsStore.background.bgType !== BgType.None" class="settings__item">
      <div class="settings__label">{{ i18n.t('newtab.settings.background.blur') }}</div>
      <el-slider v-model="settingsStore.background.blurIntensity" :show-tooltip="false" />
    </div>
    <div class="settings__item">
      <div class="settings__label">{{ i18n.t('newtab.settings.background.maskOpacity') }}</div>
      <el-slider v-model="settingsStore.background.bgMaskOpacity" :show-tooltip="false" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.background.maskColor') }}</div>
      <span>
        <span>{{ i18n.t('newtab.settings.theme.lightMode') }}:&ensp;</span>
        <el-color-picker
          v-model="settingsStore.background.lightMaskColor"
          :predefine="predefineMaskColor"
          @change="
            () => {
              if (settingsStore.background.lightMaskColor === null) {
                settingsStore.background.lightMaskColor = '#f2f3f5'
              }
            }
          "
        />
        <span style="margin-left: 1em">{{ i18n.t('newtab.settings.theme.darkMode') }}:&ensp;</span>
        <el-color-picker
          v-model="settingsStore.background.nightMaskColor"
          :predefine="predefineMaskColor"
          @change="
            () => {
              if (settingsStore.background.nightMaskColor === null) {
                settingsStore.background.nightMaskColor = '#000'
              }
            }
          "
        />
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings__bg-uploader-img {
  max-width: 100%;
  object-fit: cover;
}

.settings__bg-uploader {
  & .settings__bg-uploader-icon {
    width: 350px;
    height: 200px;
    font-size: 28px;
    color: var(--el-text-color-placeholder);
    text-align: center;
    transition: var(--el-transition-duration-fast);
  }

  &:deep() .el-upload {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border: 1px dashed var(--el-border-color-darker);
    border-radius: 6px;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);

      .settings__bg-uploader-icon {
        color: var(--el-color-primary);
      }
    }
  }
}

.settings__online-bg-tips {
  padding: 5px 15px 0;
  margin-top: 5px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);

  li {
    margin: 3px 0;
  }
}

:deep() .el-radio__label {
  display: flex;
  align-items: center;

  svg {
    width: 1em;
    height: 1em;
    margin-left: 0.5em;
    opacity: 0.5;
  }
}
</style>
