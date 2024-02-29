<script setup lang="ts">
import { AddRound } from '@vicons/material'
import { ElMessage, type FormInstance } from 'element-plus'
import { reactive, ref } from 'vue'

import { useBookmarkStore, useSettingsStore } from '@/newtab/js/store'

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
  const bookmarkKeys = Object.keys(bookmarkStore.items)
  let newIndex = 0
  if (bookmarkKeys.length > 0) {
    newIndex = parseInt(bookmarkKeys[bookmarkKeys.length - 1]) + 1
  }
  try {
    new URL(data.url)
  } catch (e) {
    ElMessage.error('无效的网址，请重新输入~')
    data.url = ''
    return
  }
  bookmarkStore.items[newIndex] = {
    url: data.url,
    title: data.title
  }
  modelForm.value?.resetFields()
  await props.reload()
  showDialog.value = false
}
</script>

<template>
  <div
    class="quickstart-item"
    :style="{
      flexBasis: getQuickStartItemWidth(quickStartSize(), settingsStore.QuickStartColumns),
      width: `${settingsStore.QuickStartItemWidth}px`
    }"
  >
    <div class="quickstart-item-link" style="cursor: pointer" @click="showDialog = true">
      <div class="quickstart-icon" style="color: var(--el-text-color-regular)">
        <AddRound />
      </div>
      <div class="quickstart-title">添加快速访问</div>
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
