<script lang="ts" setup>
import { BookmarkTwotone } from '@vicons/material'

defineProps<{
  btnClass: Record<string, boolean>
}>()

const emit = defineEmits<{
  (e: 'open-bookmark-sidebar'): void
}>()
</script>

<template>
  <div class="action-btn bookmark-btn" :class="btnClass" @click="emit('open-bookmark-sidebar')">
    <el-icon><bookmark-twotone /></el-icon>
  </div>
</template>
