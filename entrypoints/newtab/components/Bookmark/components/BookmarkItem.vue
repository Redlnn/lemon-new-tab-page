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
</script>

<template>
  <el-collapse-item v-if="node.children" :style="{ '--depth': `${depth * 20}px` }">
    <template #title>
      <el-icon color="var(--el-color-primary)"><folder-open-round /></el-icon>
      <span>{{ node.title || '(未命名)' }}</span>
    </template>
    <el-collapse expand-icon-position="left" accordion v-if="node.children">
      <bookmark-item
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
      />
    </el-collapse>
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
