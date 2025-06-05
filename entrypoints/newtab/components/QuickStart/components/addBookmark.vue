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
import { useSettingsStore, saveBookmark, useBookmarkStore } from '@/newtab/scripts/store'
import { convertBase64Svg, isImageFile } from '@/newtab/scripts/img'

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
    ElMessage.error(i18n.t('newtab.quickstart.addDialog.invalidUrlError'))
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
      i18n.t('newtab.quickstart.addDialog.confirmSvgDesc'),
      i18n.t('newtab.quickstart.addDialog.confirmSvgTitle'),
      {
        confirmButtonText: i18n.t('newtab.quickstart.addDialog.confirmSvgOKBtn'),
        cancelButtonText: i18n.t('newtab.quickstart.addDialog.confirmSvgCancelBtn'),
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
    ElMessage.error(i18n.t('newtab.quickstart.addDialog.tooLargeImageError'))
    return false
  }
  return true
}

function isSvg(file: Blob) {
  return file.type.endsWith('svg+xml')
}
</script>

<template>
  <div class="quickstart-item add-bookmark">
    <div class="quickstart-item-link" style="cursor: pointer" @click="showDialog = true">
      <div class="quickstart-icon-container">
        <div class="quickstart-icon">
          <add-round />
        </div>
      </div>
      <div v-if="settingsStore.quickStart.showQuickStartTitle" class="quickstart-title">
        {{ i18n.t('newtab.quickstart.addNewQuickstart') }}
      </div>
    </div>
  </div>
  <el-dialog
    v-model="showDialog"
    :title="i18n.t('newtab.quickstart.addDialog.dialogTitle')"
    :style="{
      padding: '30px 50px'
    }"
    width="500px"
    append-to-body
    destroy-on-close
  >
    <el-form ref="modelForm" :model="data">
      <el-form-item :label="i18n.t('newtab.quickstart.addDialog.title')">
        <el-input v-model="data.title" />
      </el-form-item>
      <el-form-item :label="i18n.t('newtab.quickstart.addDialog.url')">
        <el-input v-model="data.url" @keyup.enter="add" />
      </el-form-item>
      <el-form-item :label="i18n.t('newtab.quickstart.addDialog.autoFetchFavicon')">
        <el-switch v-model="getFaviconAuto" />
      </el-form-item>
      <el-form-item v-if="!getFaviconAuto" :label="i18n.t('newtab.quickstart.addDialog.favicon')">
        <el-upload
          class="favicon-uploader"
          :show-file-list="false"
          :http-request="(option: UploadRequestOptions) => uploadFavicon(option.file)"
          :before-upload="beforeFaviconUpload"
          accept="image/*"
        >
          <img v-if="data.favicon" :src="data.favicon" class="favicon-uploader__img" />
          <el-icon v-else class="favicon-uploader__icon"><plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
    <el-alert
      v-if="!getFaviconAuto"
      type="info"
      show-icon
      :closable="false"
      :title="i18n.t('newtab.quickstart.addDialog.uploadFaviconAlert')"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">{{ i18n.t('newtab.quickstart.addDialog.cancel') }}</el-button>
        <el-button type="primary" @click="add">{{
          i18n.t('newtab.quickstart.addDialog.confirm')
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.add-bookmark {
  opacity: 0.7;
  color: var(--el-text-color-primary);
  transition:
    color var(--el-transition-duration-fast) ease,
    opacity var(--el-transition-duration-fast) ease;

  &:hover,
  &:hover .quickstart-title {
    opacity: 1;
  }

  .white-text-light &,
  .white-text-light & .quickstart-icon {
    color: var(--el-bg-color);
  }

  &:hover .quickstart-icon {
    transition: color var(--el-transition-duration-fast) ease;
    color: var(--el-color-primary);
  }

  .quickstart-icon {
    & svg {
      width: 70%;
    }
  }
}

.favicon-uploader__img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.favicon-uploader:deep() .el-upload {
  border: 1px dashed var(--el-border-color-darker);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);

  &:hover {
    border-color: var(--el-color-primary);

    .el-icon.favicon-uploader__icon {
      color: var(--el-color-primary);
    }
  }
}

.el-icon.favicon-uploader__icon {
  font-size: 28px;
  color: var(--el-text-color-placeholder);
  width: 100px;
  height: 100px;
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
</style>
