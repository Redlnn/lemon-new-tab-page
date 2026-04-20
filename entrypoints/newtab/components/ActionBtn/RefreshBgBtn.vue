<script lang="ts" setup>
import RefreshRound from '~icons/ic/round-refresh'

const emit = defineEmits<{
  (e: 'refresh-background'): void
}>()
</script>

<template>
  <div
    role="button"
    tabindex="0"
    class="action-btn refresh-btn"
    @click="emit('refresh-background')"
    @keydown.enter="emit('refresh-background')"
  >
    <el-icon><refresh-round /></el-icon>
  </div>
</template>
