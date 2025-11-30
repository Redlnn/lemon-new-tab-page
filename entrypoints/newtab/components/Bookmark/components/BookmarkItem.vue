<script setup lang="ts">
import { FolderOpenRound } from '@vicons/material'
import type { Browser } from 'wxt/browser'

import { getFaviconURL } from '@/shared/media'

const props = withDefaults(
  defineProps<{
    node: Browser.bookmarks.BookmarkTreeNode
    depth?: number
  }>(),
  {
    depth: 1
  }
)

const faviconRef = props.node.url ? getFaviconURL(props.node.url) : ref('')

// 注入共享的 activeMap（按深度索引），用于跨层级控制折叠展开
const activeMap = inject('bookmarkActiveMap') as Ref<Record<number, string | string[]>> | undefined

// 本层嵌套 collapse 对应的深度键（children 的深度）
const childDepthKey = props.depth + 1

const model = computed({
  get: () => activeMap?.value?.[childDepthKey] ?? '',
  set: (v: string | string[]) => {
    if (!activeMap) return
    const prev = activeMap.value || {}
    activeMap.value = {
      ...prev,
      [childDepthKey]: v
    }
  }
})

// 懒加载优化：判断当前节点是否展开
const isExpanded = computed(() => {
  const active = activeMap?.value?.[props.depth]
  if (Array.isArray(active)) {
    return active.includes(props.node.id)
  }
  return active === props.node.id
})

const hasBeenExpanded = ref(false)

watch(
  isExpanded,
  (val) => {
    if (val) {
      hasBeenExpanded.value = true
    }
  },
  { immediate: true }
)

const shouldRenderChildren = computed(() => hasBeenExpanded.value || isExpanded.value)
</script>

<template>
  <el-collapse-item v-if="node.children" :name="node.id" :style="{ '--depth': `${depth * 20}px` }">
    <template #title>
      <el-icon color="var(--el-color-primary)"><folder-open-round /></el-icon>
      <span>{{ node.title || '(未命名)' }}</span>
    </template>
    <template v-if="shouldRenderChildren">
      <el-collapse v-model="model" expand-icon-position="left" accordion v-if="node.children">
        <bookmark-item
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :depth="depth + 1"
        />
      </el-collapse>
    </template>
  </el-collapse-item>
  <a
    v-else
    class="bookmark-link-item"
    :href="node.url"
    :style="{ paddingLeft: `${(depth + 1) * 20}px` }"
  >
    <img :src="faviconRef" />
    <el-text line-clamp="2">
      {{ node.title }}
    </el-text>
  </a>
</template>
