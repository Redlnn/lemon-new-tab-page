<script setup lang="ts">
import { reactive, ref } from 'vue'

import { Plus } from '@vicons/fa'
import { AddRound } from '@vicons/material'
import type { FormInstance, UploadRequestOptions } from 'element-plus'
import { useTranslation } from 'i18next-vue'

import { useFaviconUpload } from '@/entrypoints/newtab/components/Shortcut/composables/useFaviconUpload'
import { saveBookmark, useBookmarkStore } from '@/shared/bookmark'
import { getPerfClasses } from '@/shared/composables/perfClasses'
import { useSettingsStore } from '@/shared/settings'

const { t } = useTranslation()

const settings = useSettingsStore()
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

const { beforeFaviconUpload, httpRequest } = useFaviconUpload({ maxKB: 100 })

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
    ElMessage.error(t('newtab:shortcut.addDialog.invalidUrlError'))
    data.url = ''
    return
  }
  bookmarkStore.items.push({ ...data })
  await saveBookmark(bookmarkStore.$state)
  await props.reload()
  showDialog.value = false
  resetFields()
}

async function cancel() {
  showDialog.value = false
  resetFields()
}
</script>

<template>
  <div class="shortcut__item shortcut__item--add-bookmark">
    <div class="shortcut__item-link" style="cursor: pointer" @click="showDialog = true">
      <div class="shortcut__icon-container">
        <div
          class="shortcut__icon"
          :class="
            getPerfClasses(
              {
                transparentOff: settings.perf.disableShortcutTransparent,
                blurOff: settings.perf.disableShortcutBlur
              },
              'shortcut__icon'
            )
          "
        >
          <add-round />
        </div>
      </div>
      <div v-if="settings.shortcut.showShortcutTitle" class="shortcut__title">
        {{ t('newtab:shortcut.addNewShortcut') }}
      </div>
    </div>
  </div>
  <el-dialog
    v-model="showDialog"
    :title="t('newtab:shortcut.addDialog.dialogTitle')"
    class="base-dialog--blur base-dialog--opacity"
    :style="{
      padding: '30px 50px'
    }"
    width="500px"
    append-to-body
    destroy-on-close
  >
    <el-form ref="modelForm" :model="data">
      <el-form-item :label="t('newtab:shortcut.addDialog.title')">
        <el-input v-model="data.title" />
      </el-form-item>
      <el-form-item :label="t('newtab:shortcut.addDialog.url')">
        <el-input v-model="data.url" @keyup.enter="add" />
      </el-form-item>
      <el-form-item :label="t('newtab:shortcut.addDialog.autoFetchFavicon')">
        <el-switch v-model="getFaviconAuto" />
      </el-form-item>
      <el-form-item v-if="!getFaviconAuto" :label="t('newtab:shortcut.addDialog.favicon')">
        <el-upload
          class="shortcut__favicon-uploader"
          :show-file-list="false"
          :http-request="
            (option: UploadRequestOptions) => httpRequest(option, (b64) => (data.favicon = b64))
          "
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
      :title="t('newtab:shortcut.addDialog.uploadFaviconAlert')"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">{{ t('newtab:shortcut.addDialog.cancel') }}</el-button>
        <el-button type="primary" @click="add">{{
          t('newtab:shortcut.addDialog.confirm')
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.shortcut__item--add-bookmark {
  .shortcut__title,
  .shortcut__icon {
    color: var(--le-text-color-primary-opacity-65);
  }

  .shortcut__icon {
    svg {
      width: 70%;
    }
  }

  &:hover {
    .shortcut__title,
    .shortcut__icon {
      color: var(--el-text-color-primary);
    }
  }

  .shortcut__container--item-shadow &:not(:hover) .shortcut__title {
    text-shadow: 1px 1px 4px rgb(0 0 0 / 50%);
  }

  // 白色文本容器特化
  html:not(.dark) .shortcut__container--white-text-light & {
    .shortcut__title,
    .shortcut__icon {
      color: rgb(255 255 255 / 70%);

      &:not(.shortcut__icon--opacity) {
        svg {
          color: var(--le-text-color-primary-opacity-65);
        }
      }
    }

    &:hover {
      .shortcut__title,
      .shortcut__icon {
        color: var(--el-color-white);

        &:not(.shortcut__icon--opacity) {
          svg {
            color: var(--el-text-color-regular);
          }
        }
      }
    }
  }
}

// 上传图标和图片
.shortcut__favicon-uploader-img,
.shortcut__favicon-uploader-icon {
  width: 50px;
  height: 50px;
}

.shortcut__favicon-uploader-img {
  object-fit: cover;
}

.shortcut__favicon-uploader-icon {
  font-size: 20px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  transition: var(--el-transition-duration-fast);
}

.shortcut__favicon-uploader .el-upload {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px dashed var(--el-text-color-placeholder);
  border-radius: 6px;
  transition: var(--el-transition-duration-fast);

  &:hover {
    border-color: var(--el-color-primary);

    .shortcut__favicon-uploader-icon {
      color: var(--el-color-primary);
    }
  }
}
</style>
