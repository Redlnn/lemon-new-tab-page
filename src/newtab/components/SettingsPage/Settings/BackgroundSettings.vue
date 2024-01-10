<script setup lang="ts">
import { ref } from 'vue'
import { PictureOutlined } from '@vicons/antd'
import { Plus } from '@vicons/fa'
import { ElMessage, type UploadProps } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'

import { isImageFile } from '@/newtab/js/utils/img'
import { useSettingsStore, BgType } from '@/newtab/js/store'

const settingsStore = useSettingsStore()
const imageUrl = ref(settingsStore.bgUrl)

const handleBackgroundSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
}

const beforeBackgroundUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!isImageFile(rawFile)) {
    ElMessage.error('所选文件不是图片!')
    return false
  }
  return true
}
</script>

<template>
  <h3 class="settings-title">
    <el-icon><picture-outlined /></el-icon>
    <span>背景设置</span>
  </h3>
  <div class="settings-item">
    <div class="settings-label">背景类型</div>
    <el-radio-group v-model="settingsStore.bgType">
      <el-radio :label="BgType.None">无</el-radio>
      <el-radio :label="BgType.Local">本地图片</el-radio>
      <el-radio :label="BgType.Bing">Bing每日一图</el-radio>
    </el-radio-group>
  </div>
  <el-upload
    v-if="settingsStore.bgType === BgType.Local"
    class="bg-uploader"
    :show-file-list="false"
    :http-request="(option) => settingsStore.uploadBackgroundImage(option.file)"
    :on-success="handleBackgroundSuccess"
    :before-upload="beforeBackgroundUpload"
  >
    <img v-if="imageUrl" :src="imageUrl" class="bg-uploader-img" />
    <el-icon v-else class="bg-uploader-icon"><plus /></el-icon>
  </el-upload>
  <div class="settings-item horizontal">
    <div class="settings-label">暗角</div>
    <el-switch v-model="settingsStore.bgDarkCorners" size="large" />
  </div>
  <div class="settings-item" v-if="settingsStore.bgType !== BgType.None">
    <div class="settings-label">模糊强度</div>
    <el-slider v-model="settingsStore.bgBlur" :show-tooltip="false" />
  </div>
  <div class="settings-item" v-if="settingsStore.bgType !== BgType.None">
    <div class="settings-label">遮罩不透明度</div>
    <el-slider v-model="settingsStore.bgMaskPpacity" :show-tooltip="false" />
  </div>
</template>

<style scoped lang="scss">
.bg-uploader .bg {
  width: 178px;
  height: 178px;
  display: block;
}
.bg-uploader-img {
  max-width: 100%;
  object-fit: cover;
}

.bg-uploader:deep() .el-upload {
  border: 1px dashed var(--el-border-color-darker);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);

  &:hover {
    .el-icon.bg-uploader-icon {
      color: var(--el-color-primary);
    }
    border-color: var(--el-color-primary);
  }
}

.el-icon.bg-uploader-icon {
  font-size: 28px;
  color: var(--el-text-color-placeholder);
  width: 350px;
  height: 200px;
  text-align: center;
  transition: var(--el-transition-duration-fast);
}
</style>
