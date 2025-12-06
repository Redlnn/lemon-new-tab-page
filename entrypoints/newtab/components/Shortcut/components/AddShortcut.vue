<script setup lang="ts">
import { Plus } from '@vicons/fa'
import { AddRound } from '@vicons/material'
import type { FormInstance, UploadRequestOptions } from 'element-plus'
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'
import { saveShortcut, useShortcutStore } from '@/shared/shortcut'

import { getPerfClasses } from '@newtab/composables/perfClasses'

import { useFaviconUpload } from '../composables/useFaviconUpload'

const { t } = useTranslation()

const settings = useSettingsStore()
const shortcutStore = useShortcutStore()
const modelForm = ref<FormInstance>()

const props = defineProps<{
  reload: () => Promise<void>
}>()
const showDialog = ref(false)
const editingIndex = ref<number | null>(null)
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

const isEditing = computed(() => editingIndex.value !== null)
const dialogTitle = computed(() =>
  t(isEditing.value ? 'shortcut.editShortcut' : 'shortcut.addShortcut')
)
const confirmLabel = computed(() => t(isEditing.value ? 'common.save' : 'common.confirm'))

function resetFields() {
  modelForm.value?.resetFields()
  Object.assign(data, { url: '', title: '', favicon: '' })
  editingIndex.value = null
}

function openAddDialog() {
  resetFields()
  showDialog.value = true
}

function openEditDialog(index: number) {
  const target = shortcutStore.items[index]
  if (!target) return
  modelForm.value?.resetFields()
  editingIndex.value = index
  Object.assign(data, {
    url: target.url,
    title: target.title,
    favicon: target.favicon ?? ''
  })
  showDialog.value = true
}

function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

async function submit() {
  if (!isValidUrl(data.url)) {
    ElMessage.error(t('shortcut.addDialog.invalidUrlError'))
    return
  }
  const shortcut = {
    url: data.url.trim(),
    title: data.title.trim(),
    ...(!data.favicon ? {} : { favicon: data.favicon })
  }
  if (isEditing.value && editingIndex.value !== null) {
    shortcutStore.items.splice(editingIndex.value, 1, shortcut)
  } else {
    shortcutStore.items.push(shortcut)
  }
  await saveShortcut(shortcutStore.$state)
  await props.reload()
  showDialog.value = false
  resetFields()
}

async function cancel() {
  showDialog.value = false
  resetFields()
}

defineExpose({
  openEditDialog
})
</script>

<template>
  <div class="shortcut__item shortcut__item--add-shortcut noselect">
    <div class="shortcut__item-link" style="cursor: pointer" @click="openAddDialog">
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
        {{ t('shortcut.addShortcut') }}
      </div>
    </div>
  </div>
  <el-dialog
    v-model="showDialog"
    :title="dialogTitle"
    class="add-shortcut-dialog base-dialog--blur base-dialog--opacity noselect"
    width="500px"
    append-to-body
    destroy-on-close
  >
    <el-form ref="modelForm" :model="data">
      <el-form-item :label="t('common.name')">
        <el-input v-model="data.title" />
      </el-form-item>
      <el-form-item :label="t('common.url')">
        <el-input v-model="data.url" @keyup.enter="submit" />
      </el-form-item>
      <el-form-item :label="t('common.icon')">
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
      type="info"
      show-icon
      :closable="false"
      :title="t('shortcut.addDialog.uploadFaviconAlert')"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submit">{{ confirmLabel }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.add-shortcut-dialog {
  max-width: 93%;
  padding: 30px 50px;

  html.colorful:not(.dialog-transparent) & {
    background-color: var(--el-color-primary-light-9);
  }

  --el-dialog-border-radius: 10px;
}

.shortcut__item--add-shortcut .shortcut__item-link {
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
  html.light .shortcut__container--white-text-light & {
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
