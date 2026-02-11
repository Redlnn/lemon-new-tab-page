<script lang="ts" setup>
import { RefreshRound } from '@vicons/material'

defineProps<{
  btnClass: Record<string, boolean>
}>()

const emit = defineEmits<{
  (e: 'refresh-background'): void
}>()
</script>

<template>
  <div class="action-btn refresh-btn" :class="btnClass" @click="emit('refresh-background')">
    <el-icon><refresh-round /></el-icon>
  </div>
</template>
