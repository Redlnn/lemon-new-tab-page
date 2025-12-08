<script setup lang="ts">
import { useTranslation } from 'i18next-vue'
import { browser } from 'wxt/browser'

import { PermissionResult } from '@newtab/composables/usePermission'

const props = defineProps<{
  modelValue: boolean
  hostname: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  result: [result: PermissionResult]
}>()

const { t } = useTranslation('settings')

async function requestPermission(isAll: boolean) {
  if (import.meta.env.FIREFOX && !isAll) {
    // Firefox MV2 不需要请求当前网站权限，直接视为已授权
    return emit('result', PermissionResult.GrantedCurrent)
  }
  const permissions = { origins: isAll ? [`*://*/*`] : [`*://${props.hostname}/*`] }
  try {
    const granted = await browser.permissions.request(permissions)
    emit(
      'result',
      granted
        ? isAll
          ? PermissionResult.GrantedAll
          : PermissionResult.GrantedCurrent
        : PermissionResult.DeniedByBrowser
    )
  } catch (error) {
    console.error(`Failed to request ${isAll ? 'all' : 'current'} permissions:`, error)
    emit('result', PermissionResult.DeniedByBrowser)
  }
}

function onDeny() {
  emit('result', PermissionResult.DeniedByUser)
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="t('background.permission.request.title')"
    width="400px"
    class="permission-dialog base-dialog--blur base-dialog--opacity noselect"
    @update:model-value="(val) => emit('update:modelValue', val)"
  >
    <div class="permission-dialog-content">
      <p>{{ t('background.permission.request.message') }}</p>
      <ul>
        <li>
          <strong>{{ t('background.permission.request.subA.label') }}</strong>
          {{ t('background.permission.request.subA.content') }}
        </li>
        <li>
          <strong>{{ t('background.permission.request.subB.label') }}</strong>
          {{ t('background.permission.request.subB.content') }}
        </li>
      </ul>
      <div class="permission-dialog-actions">
        <el-button type="primary" plain @click="requestPermission(true)" class="permission-btn">
          {{ t('background.permission.allowAll') }}
        </el-button>
        <el-button @click="requestPermission(false)" class="permission-btn">
          {{ t('background.permission.allowCurrent') }}
        </el-button>
        <el-button
          type="danger"
          plain
          @click="onDeny"
          class="permission-btn"
          style="grid-area: deny"
        >
          {{ t('background.permission.deny') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss">
.permission-dialog.el-dialog {
  padding: 25px;
}

.permission-dialog-content {
  ul {
    padding-left: 1em;
  }

  li {
    margin-bottom: 0.3em;
    line-height: 1.25em;

    &:last-of-type {
      margin-bottom: 0;
    }
  }
}

.permission-dialog-actions {
  display: grid;
  grid-template: '. .' 1fr 'deny deny' 1fr / 1fr 1fr;
  gap: 10px;
}

.permission-btn.el-button {
  width: 100%;
  margin-left: 0;
}
</style>
