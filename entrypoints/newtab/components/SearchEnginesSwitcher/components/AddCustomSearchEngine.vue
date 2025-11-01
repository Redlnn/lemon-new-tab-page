<script setup lang="ts">
import { Plus } from '@vicons/fa'
import type { FormInstance, UploadRequestOptions } from 'element-plus'
import { useTranslation } from 'i18next-vue'

import { saveCustomSearchEngine, useCustomSearchEngineStore } from '@/shared/customSearchEngine'

import { useFaviconUpload } from '@newtab/components/Shortcut/composables/useFaviconUpload'

const { t } = useTranslation()

const customSearchEngineStore = useCustomSearchEngineStore()
const modelForm = ref<FormInstance>()

const showDialog = ref(false)
const editingIndex = ref<number | null>(null)
const data: {
  name: string
  url: string
  icon?: string
} = reactive({
  name: '',
  url: '',
  icon: undefined
})

const { beforeFaviconUpload, httpRequest } = useFaviconUpload({ maxKB: 100 })

const isEditing = computed(() => editingIndex.value !== null)
const dialogTitle = computed(() =>
  t(isEditing.value ? 'customSearchEngine.edit' : 'customSearchEngine.add')
)
const confirmLabel = computed(() => t(isEditing.value ? 'common.save' : 'common.confirm'))

function resetFields() {
  modelForm.value?.resetFields()
  Object.assign(data, { name: '', url: '', icon: '' })
  editingIndex.value = null
}

function openAddDialog() {
  resetFields()
  showDialog.value = true
}

function openEditDialog(index: number) {
  const target = customSearchEngineStore.items[index]
  if (!target) return
  modelForm.value?.resetFields()
  editingIndex.value = index
  Object.assign(data, {
    name: target.name,
    url: target.url,
    icon: target.icon ?? ''
  })
  showDialog.value = true
}

function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return url.includes('%s')
  } catch {
    return false
  }
}

async function submit() {
  if (!data.name.trim()) {
    ElMessage.error(t('customSearchEngine.addDialog.nameRequiredError'))
    return
  }

  if (!validateUrl(data.url)) {
    ElMessage.error(t('customSearchEngine.addDialog.invalidUrlError'))
    return
  }

  const engine = {
    id: isEditing.value
      ? customSearchEngineStore.items[editingIndex.value!]!.id
      : crypto.randomUUID(),
    name: data.name.trim(),
    url: data.url.trim(),
    icon: data.icon || undefined
  }

  if (isEditing.value && editingIndex.value !== null) {
    customSearchEngineStore.items.splice(editingIndex.value, 1, engine)
  } else {
    customSearchEngineStore.items.push(engine)
  }

  await saveCustomSearchEngine(customSearchEngineStore.$state)
  showDialog.value = false
  resetFields()
}

async function cancel() {
  showDialog.value = false
  resetFields()
}

defineExpose({
  openAddDialog,
  openEditDialog
})
</script>

<template>
  <el-dialog
    v-model="showDialog"
    :title="dialogTitle"
    class="add-custom-search-engine-dialog base-dialog--blur base-dialog--opacity noselect"
    width="500px"
    append-to-body
    destroy-on-close
  >
    <el-form ref="modelForm" :model="data">
      <el-form-item :label="t('common.name')">
        <el-input v-model="data.name" />
      </el-form-item>
      <el-form-item :label="t('common.url')">
        <el-input
          v-model="data.url"
          placeholder="https://example.com/?q=%s"
          @keyup.enter="submit"
        />
      </el-form-item>
      <el-form-item :label="t('common.icon')">
        <el-upload
          class="search-engine-icon-uploader"
          :show-file-list="false"
          :http-request="
            (option: UploadRequestOptions) => httpRequest(option, (b64) => (data.icon = b64))
          "
          :before-upload="beforeFaviconUpload"
          accept="image/*"
        >
          <img v-if="data.icon" :src="data.icon" class="search-engine-icon-uploader-img" />
          <el-icon v-else class="search-engine-icon-uploader-icon"><plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
    <el-alert
      type="info"
      show-icon
      :closable="false"
      :title="t('customSearchEngine.addDialog.urlHelp')"
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
.add-custom-search-engine-dialog {
  padding: 30px 50px;

  html.colorful:not(.dialog-transparent) & {
    background-color: var(--el-color-primary-light-9);
  }

  --el-dialog-border-radius: 10px;
}

// 上传图标和图片
.search-engine-icon-uploader-img,
.search-engine-icon-uploader-icon {
  width: 50px;
  height: 50px;
}

.search-engine-icon-uploader-img {
  object-fit: cover;
}

.search-engine-icon-uploader-icon {
  font-size: 20px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  transition: var(--el-transition-duration-fast);
}

.search-engine-icon-uploader .el-upload {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px dashed var(--el-text-color-placeholder);
  border-radius: 6px;
  transition: var(--el-transition-duration-fast);

  &:hover {
    border-color: var(--el-color-primary);

    .search-engine-icon-uploader-icon {
      color: var(--el-color-primary);
    }
  }
}
</style>
