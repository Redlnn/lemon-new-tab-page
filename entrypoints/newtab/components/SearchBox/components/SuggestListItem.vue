<script setup lang="ts">
const props = defineProps<{
  text: string
  active: boolean
}>()

const emit = defineEmits<{
  click: []
  hover: []
  leave: []
}>()
</script>

<template>
  <div
    class="search-suggestion-area__item noselect"
    :class="{ 'search-suggestion-area__item--active': active }"
    @click="emit('click')"
    @mouseover="emit('hover')"
    @mouseout="emit('leave')"
  >
    {{ props.text }}
  </div>
</template>
