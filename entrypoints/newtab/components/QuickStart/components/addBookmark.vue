<script setup lang="ts">
import { AddRound } from '@vicons/material'
import _ from 'lodash'
import { ElMessage, type FormInstance } from 'element-plus'
import { reactive, ref } from 'vue'

import { i18n } from '@/.wxt/i18n'
import { useSettingsStore } from '@/entrypoints/newtab/js/store/settingsStore'
import { saveBookmark, useBookmarkStore } from '@/entrypoints/newtab/js/store/bookmarkStore'

import { getQuickStartItemWidth } from '../utils/index'

const settingsStore = useSettingsStore()
const bookmarkStore = useBookmarkStore()
const modelForm = ref<FormInstance>()

const props = defineProps<{
  quickStartSize: () => number
  reload: () => Promise<void>
}>()

const showDialog = ref(false)
const data: {
  url: string
  title: string
} = reactive({
  url: '',
  title: ''
})

async function add() {
  try {
    new URL(data.url)
  } catch (e) {
    ElMessage.error(i18n.t('newtab.quickstart.addDialog.invalidUrlError'))
    data.url = ''
    return
  }
  bookmarkStore.items.push({
    url: data.url,
    title: data.title
  })
  await saveBookmark(_.cloneDeep(bookmarkStore))
  await props.reload()
  showDialog.value = false
  modelForm.value?.resetFields()
  data.title = ''
  data.url = ''
}

async function cancel() {
  showDialog.value = false
  modelForm.value?.resetFields()
  data.title = ''
  data.url = ''
}
</script>

<template>
  <div
    class="quickstart-item add-bookmark"
    :style="{
      flexBasis: getQuickStartItemWidth(
        quickStartSize(),
        settingsStore.quickStart.quickStartColumns
      ),
      width: `${settingsStore.quickStart.quickStartItemWidth}px`
    }"
  >
    <div class="quickstart-item-link" style="cursor: pointer" @click="showDialog = true">
      <div class="quickstart-icon">
        <add-round />
      </div>
      <div class="quickstart-title" v-if="settingsStore.quickStart.showQuickStartTitle">
        {{ i18n.t('newtab.quickstart.addNewQuickstart') }}
      </div>
    </div>
  </div>
  <el-dialog
    v-model="showDialog"
    :title="i18n.t('newtab.quickstart.addDialog.dialogTitle')"
    width="400px"
    append-to-body
    destroy-on-close
  >
    <el-form :inline="true" ref="modelForm" :model="data">
      <el-form-item
        :label="i18n.t('newtab.quickstart.addDialog.title')"
        label-width="70px"
        prop="userNameCn"
      >
        <el-input v-model="data.title" style="width: 250px" />
      </el-form-item>
      <el-form-item
        :label="i18n.t('newtab.quickstart.addDialog.url')"
        label-width="70px"
        prop="userCode"
      >
        <el-input v-model="data.url" style="width: 250px" />
      </el-form-item>
    </el-form>
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
.add-bookmark .quickstart-icon {
  color: var(--el-text-color-regular);

  & svg {
    width: 80%;
  }
}

.add-bookmark:hover .quickstart-icon,
.add-bookmark:hover .quickstart-title {
  color: var(--el-color-primary);
}
</style>
