<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  goto: [page: number]
}>()
</script>

<template>
  <div v-if="totalPages > 1" class="shortcut__pagination">
    <button
      v-for="page in totalPages"
      :key="page"
      class="shortcut__pagination-dot"
      :class="{ 'shortcut__pagination-dot--active': currentPage === page - 1 }"
      :aria-label="`Go to page ${page}`"
      @click="emit('goto', page - 1)"
    />
  </div>
</template>
