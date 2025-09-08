<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { PictureOutlined } from '@vicons/antd'
import { Plus } from '@vicons/fa'
import { CloseRound, CloudOffRound } from '@vicons/material'
import {
  type ElInput,
  ElMessage,
  ElMessageBox,
  type UploadProps,
  type UploadRequestOptions
} from 'element-plus'
import { browser } from 'wxt/browser'

import { i18n } from '@/.wxt/i18n'
import { isImageFile } from '@/shared/image'
import {
  BgType,
  uploadBackgroundImage,
  useDarkWallpaperStore,
  useSettingsStore,
  useWallpaperStore
} from '@/shared/settings'

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

async function handlePermissions(_url: string, hostname: string) {
  const permissions = { origins: [`*://${hostname}/*`] }
  try {
    const granted = await browser.permissions.contains(permissions)
    if (granted) {
      settingsStore.background.onlineUrl = _url
      return
    }

    const confirmed = await ElMessageBox.confirm(
      i18n.t('newtab.settings.background.warning.securityPolicy', [hostname])
    )

    if (confirmed) {
      const requested = await browser.permissions.request(permissions)
      if (requested) {
        ElMessage.success(i18n.t('newtab.settings.background.warning.granted'))
        settingsStore.background.onlineUrl = _url
      } else {
        ElMessage.error(i18n.t('newtab.settings.background.warning.notGranted'))
        settingsStore.background.bgType = BgType.None
        tmpUrl.value = ''
      }
    }
  } catch {
    // User clicked cancel on the confirmation dialog
    settingsStore.background.bgType = BgType.None
    tmpUrl.value = ''
  }
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

async function deleteLocalBg(isDark = false) {
  if (isDark) {
    settingsStore.localDarkBackground = { id: '', url: '' }
    useDarkWallpaperStore.clear()
  } else {
    settingsStore.localBackground = { id: '', url: '' }
    useWallpaperStore.clear()
  }
}
</script>

<template>
  <div class="settings__title">
    <el-icon><picture-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.background.title') }}</span>
  </div>
  <div class="settings__items-container">
    <div class="settings__item settings__item--vertical">
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
    <p v-if="settingsStore.background.bgType === BgType.Local" class="settings__item--note">
      {{ i18n.t('newtab.settings.background.tip') }}
    </p>
    <div
      v-if="settingsStore.background.bgType === BgType.Local"
      class="settings__bg-uploader-container"
    >
      <div class="settings__bg-uploader-wrapper">
        <el-upload
          class="settings__bg-uploader"
          :show-file-list="false"
          :http-request="(option: UploadRequestOptions) => uploadBackgroundImage(option.file)"
          :before-upload="beforeBackgroundUpload"
          accept="image/*"
        >
          <img
            v-if="settingsStore.localBackground.id"
            :src="settingsStore.localBackground.url"
            class="settings__bg-uploader-img"
          />
          <el-icon v-else class="settings__bg-uploader-icon"><plus /></el-icon>
        </el-upload>
        <div
          v-if="settingsStore.localBackground.id"
          class="settings__bg-uploader-delete"
          @click="deleteLocalBg()"
        >
          <el-icon><CloseRound /></el-icon>
        </div>
        <div class="settings__bg-uploader-title">
          {{ i18n.t('newtab.settings.theme.lightMode') }}
        </div>
      </div>
      <div class="settings__bg-uploader-wrapper">
        <el-upload
          class="settings__bg-uploader"
          :show-file-list="false"
          :http-request="(option: UploadRequestOptions) => uploadBackgroundImage(option.file, true)"
          :before-upload="beforeBackgroundUpload"
          accept="image/*"
        >
          <img
            v-if="settingsStore.localDarkBackground.id"
            :src="settingsStore.localDarkBackground.url"
            class="settings__bg-uploader-img"
          />
          <el-icon v-else class="settings__bg-uploader-icon"><plus /></el-icon>
        </el-upload>
        <div
          v-if="settingsStore.localDarkBackground.id"
          class="settings__bg-uploader-delete"
          @click="deleteLocalBg(true)"
        >
          <el-icon><CloseRound /></el-icon>
        </div>
        <div class="settings__bg-uploader-title">
          {{ i18n.t('newtab.settings.theme.darkMode') }}
        </div>
      </div>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.background.enableVignetting') }}</div>
      <el-switch v-model="settingsStore.background.enableVignetting" />
    </div>
    <div
      v-if="settingsStore.background.bgType !== BgType.None"
      class="settings__item settings__item--vertical"
    >
      <div class="settings__label">{{ i18n.t('newtab.settings.background.blur') }}</div>
      <el-slider v-model="settingsStore.background.blurIntensity" :show-tooltip="false" />
    </div>
    <div class="settings__item">
      <div class="settings__label settings__item--vertical">
        {{ i18n.t('newtab.settings.background.maskOpacity') }}
      </div>
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
.settings__bg-uploader-container {
  display: flex;
  gap: 15px;
  margin-top: -6px;
}

.settings__bg-uploader-delete {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--el-color-white);
  cursor: pointer;
  background-color: var(--el-color-danger);
  border-radius: 50%;
  box-shadow: var(--el-box-shadow-lighter);
}

.settings__bg-uploader-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.settings__bg-uploader-wrapper {
  position: relative;
  width: 100%;
}

.settings__bg-uploader-title {
  margin-top: 8px;
  font-size: var(--el-font-size-small);
  color: var(--el-text-color-secondary);
  text-align: center;
}

.settings__bg-uploader {
  flex: 1;
  height: 150px;

  & .settings__bg-uploader-icon {
    font-size: 28px;
    color: var(--el-text-color-placeholder);
    text-align: center;
    transition: var(--el-transition-duration-fast);
  }

  &:deep() .el-upload {
    position: relative;
    width: 100%;
    height: 100%;
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
  font-size: var(--el-font-size-extra-small);
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
