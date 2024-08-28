<script setup lang="ts">
import { AddRound } from '@vicons/material'
import { ElMessage, type FormInstance } from 'element-plus'
import { reactive, ref } from 'vue'

import { saveBookmark, useBookmarkStore, useSettingsStore } from '@/entrypoints/newtab/js/store'

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
    ElMessage.error('无效的网址，请重新输入~')
    data.url = ''
    return
  }
  bookmarkStore.items.push({
    url: data.url,
    title: data.title
  })
  await saveBookmark(bookmarkStore)
  modelForm.value?.resetFields()
  await props.reload()
  showDialog.value = false
}
</script>

<template>
  <div
    class="quickstart-item add-bookmark"
    :style="{
      flexBasis: getQuickStartItemWidth(quickStartSize(), settingsStore.quickStartColumns),
      width: `${settingsStore.quickStartItemWidth}px`
    }"
  >
    <div class="quickstart-item-link" style="cursor: pointer" @click="showDialog = true">
      <div class="quickstart-icon">
        <add-round />
      </div>
      <div
        class="quickstart-title"
        style="font-size: 0.9em"
        v-if="settingsStore.showQuickStartTitle"
      >
        添加快速访问
      </div>
    </div>
  </div>
  <el-dialog
    v-model="showDialog"
    title="添加快速访问"
    width="400px"
    append-to-body
    destroy-on-close
  >
    <el-form :inline="true" ref="modelForm" :model="data">
      <el-form-item label="标题" label-width="70px" prop="userNameCn">
        <el-input v-model="data.title" style="width: 250px" />
      </el-form-item>
      <el-form-item label="地址" label-width="70px" prop="userCode">
        <el-input v-model="data.url" style="width: 250px" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showDialog = false">不好</el-button>
        <el-button type="primary" @click="add">好了</el-button>
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
