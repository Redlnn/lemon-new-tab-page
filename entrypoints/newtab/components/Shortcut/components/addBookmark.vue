<script setup lang="ts">
import { AddRound } from '@vicons/material'
import DOMPurify from 'dompurify'
import { Plus } from '@vicons/fa'
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type UploadProps,
  type UploadRequestOptions
} from 'element-plus'
import { reactive, ref } from 'vue'

import { i18n } from '@/.wxt/i18n'
import { saveBookmark, useBookmarkStore } from '@/shared/bookmark'
import { useSettingsStore } from '@/shared/settings'
import { convertBase64Svg, isImageFile } from '@/shared/image'

const settingsStore = useSettingsStore()
const bookmarkStore = useBookmarkStore()
const modelForm = ref<FormInstance>()

const props = defineProps<{
  reload: () => Promise<void>
}>()
const getFaviconAuto = ref(true)
const showDialog = ref(false)
const data: {
  url: string
  title: string
  favicon?: string
} = reactive({
  url: '',
  title: '',
  favicon: ''
})

function resetFields() {
  modelForm.value?.resetFields()
  Object.assign(data, { url: '', title: '', favicon: '' })
  getFaviconAuto.value = true
}

function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

async function add() {
  if (!isValidUrl(data.url)) {
    ElMessage.error(i18n.t('newtab.shortcut.addDialog.invalidUrlError'))
    data.url = ''
    return
  }
  bookmarkStore.items.push({ ...data })
  await saveBookmark(bookmarkStore)
  await props.reload()
  showDialog.value = false
  resetFields()
}

async function cancel() {
  showDialog.value = false
  resetFields()
}

async function uploadFavicon(file: File) {
  // 转为base64
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onloadend = () => {
    let res = reader.result as string
    if (res.startsWith('data:image/svg+xml')) {
      res = DOMPurify.sanitize(convertBase64Svg(res), {
        USE_PROFILES: { svg: true, svgFilters: true }
      })
      res = `data:image/svg+xml;base64,${btoa(res)}`
    }
    data.favicon = res
  }
}

async function confirmSvgUpload() {
  try {
    await ElMessageBox.confirm(
      i18n.t('newtab.shortcut.addDialog.confirmSvgDesc'),
      i18n.t('newtab.shortcut.addDialog.confirmSvgTitle'),
      {
        confirmButtonText: i18n.t('newtab.shortcut.addDialog.confirmSvgOKBtn'),
        cancelButtonText: i18n.t('newtab.shortcut.addDialog.confirmSvgCancelBtn'),
        closeOnClickModal: false,
        closeOnPressEscape: false,
        showClose: false,
        type: 'warning'
      }
    )
    return true
  } catch {
    return false
  }
}

const beforeFaviconUpload: UploadProps['beforeUpload'] = async (rawFile) => {
  if (!isImageFile(rawFile, ['x-icon', 'svg+xml'])) {
    ElMessage.error(i18n.t('newtab.settings.background.warning.fileIsNotImage'))
    return false
  }
  if (isSvg(rawFile)) {
    return await confirmSvgUpload()
  }
  if (rawFile.size / 1024 > 100) {
    ElMessage.error(i18n.t('newtab.shortcut.addDialog.tooLargeImageError'))
    return false
  }
  return true
}

function isSvg(file: Blob) {
  return file.type.endsWith('svg+xml')
}
</script>

<template>
  <div class="shortcut__item shortcut__item--add-bookmark">
    <div class="shortcut__item-link" style="cursor: pointer" @click="showDialog = true">
      <div class="shortcut__icon-container">
        <div class="shortcut__icon">
          <add-round />
        </div>
      </div>
      <div v-if="settingsStore.shortcut.showShortcutTitle" class="shortcut__title">
        {{ i18n.t('newtab.shortcut.addNewShortcut') }}
      </div>
    </div>
  </div>
  <el-dialog
    v-model="showDialog"
    :title="i18n.t('newtab.shortcut.addDialog.dialogTitle')"
    :style="{
      padding: '30px 50px'
    }"
    width="500px"
    append-to-body
    destroy-on-close
  >
    <el-form ref="modelForm" :model="data">
      <el-form-item :label="i18n.t('newtab.shortcut.addDialog.title')">
        <el-input v-model="data.title" />
      </el-form-item>
      <el-form-item :label="i18n.t('newtab.shortcut.addDialog.url')">
        <el-input v-model="data.url" @keyup.enter="add" />
      </el-form-item>
      <el-form-item :label="i18n.t('newtab.shortcut.addDialog.autoFetchFavicon')">
        <el-switch v-model="getFaviconAuto" />
      </el-form-item>
      <el-form-item v-if="!getFaviconAuto" :label="i18n.t('newtab.shortcut.addDialog.favicon')">
        <el-upload
          class="shortcut__favicon-uploader"
          :show-file-list="false"
          :http-request="(option: UploadRequestOptions) => uploadFavicon(option.file)"
          :before-upload="beforeFaviconUpload"
          accept="image/*"
        >
          <img v-if="data.favicon" :src="data.favicon" class="shortcut__favicon-uploader-img" />
          <el-icon v-else class="shortcut__favicon-uploader-icon"><plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
    <el-alert
      v-if="!getFaviconAuto"
      type="info"
      show-icon
      :closable="false"
      :title="i18n.t('newtab.shortcut.addDialog.uploadFaviconAlert')"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">{{ i18n.t('newtab.shortcut.addDialog.cancel') }}</el-button>
        <el-button type="primary" @click="add">{{
          i18n.t('newtab.shortcut.addDialog.confirm')
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.shortcut__item--add-bookmark {
  color: var(--el-text-color-primary);
  opacity: 0.7;
  transition:
    color var(--el-transition-duration-fast) ease,
    opacity var(--el-transition-duration-fast) ease;

  &:hover,
  &:hover .shortcut__title {
    opacity: 1;
  }

  .shortcut__container--white-text-light &,
  .shortcut__container--white-text-light & .shortcut__icon {
    color: var(--el-bg-color);
  }

  &:hover .shortcut__icon {
    color: var(--el-text-color-primary);
    transition: color var(--el-transition-duration-fast) ease;
  }

  .shortcut__icon {
    & svg {
      width: 70%;
    }
  }

  .shortcut__favicon-uploader-img {
    width: 100px;
    height: 100px;
    object-fit: cover;
  }

  .shortcut__favicon-uploader-icon {
    width: 100px;
    height: 100px;
    font-size: 28px;
    color: var(--el-text-color-placeholder);
    text-align: center;
    transition: var(--el-transition-duration-fast);
  }

  .shortcut__favicon-uploader .el-upload {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border: 1px dashed var(--el-border-color-darker);
    border-radius: 6px;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);

      .shortcut__favicon-uploader-icon {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
