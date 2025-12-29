<script setup lang="ts">
import { Add12Filled, Pin12Regular } from '@vicons/fluent'
import { CheckRound, CloseRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'
import { browser } from 'wxt/browser'

import { getFaviconURL } from '@/shared/media'
import { saveShortcut, useShortcutStore } from '@/shared/shortcut'
import { initShortcut } from '@/shared/shortcut/shortcutStore'

const { t } = useTranslation('popup')
const shortcutStore = useShortcutStore()

/**
 * 规范化 URL 用于比较
 * 移除协议 (http/https)、末尾斜杠、www 前缀，统一转为小写
 */
function normalizeUrlForCompare(url: string): string {
  let normalized = url.trim().toLowerCase()
  // 移除协议
  normalized = normalized.replace(/^https?:\/\//, '')
  // 移除末尾斜杠
  normalized = normalized.replace(/\/+$/, '')
  return normalized
}

const currentTab = ref<{
  url: string
  title: string
  favIconUrl?: string
} | null>(null)

const isLoading = ref(true)
const isAdded = ref(false)
const isAlreadyExists = ref(false)

onMounted(async () => {
  await initShortcut()

  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const tab = tabs[0]
    if (tab && tab.url) {
      currentTab.value = {
        url: tab.url,
        title: tab.title || tab.url,
        favIconUrl: tab.favIconUrl
      }

      // 检查是否已经存在（规范化 URL 后比较）
      const normalizedTabUrl = normalizeUrlForCompare(tab.url)
      isAlreadyExists.value = shortcutStore.items.some(
        (item) => normalizeUrlForCompare(item.url) === normalizedTabUrl
      )
    }
  } catch (error) {
    console.error('Failed to get current tab:', error)
  } finally {
    isLoading.value = false
  }
})

async function addCurrentPage() {
  if (!currentTab.value) return

  const favicon = currentTab.value.favIconUrl || getFaviconURL(currentTab.value.url).value

  shortcutStore.items.push({
    url: currentTab.value.url,
    title: currentTab.value.title,
    favicon
  })

  await saveShortcut(shortcutStore.$state)
  isAdded.value = true
}
</script>

<template>
  <div class="popup">
    <div class="popup__header">
      <el-icon size="20" color="var(--el-color-primary)">
        <pin12-regular />
      </el-icon>
      <span class="popup__title">{{ t('popup.title') }}</span>
    </div>
    <template v-if="isLoading">
      <div v-loading="true" class="popup__loading"></div>
    </template>
    <template v-else-if="currentTab">
      <div v-if="isAdded" class="popup__success">
        <el-icon size="48" color="var(--el-color-success)">
          <check-round />
        </el-icon>
        <span>{{ t('popup.addSuccess') }}</span>
      </div>
      <template v-else>
        <div class="popup__content">
          <div class="popup__site-info">
            <el-image
              :src="currentTab.favIconUrl || getFaviconURL(currentTab.url).value"
              class="popup__favicon"
              fit="cover"
            />
            <div class="popup__site-text">
              <el-text class="popup__site-title" line-clamp="1">{{ currentTab.title }}</el-text>
              <el-text class="popup__site-url" type="info" size="small" line-clamp="1">{{
                currentTab.url
              }}</el-text>
            </div>
          </div>
        </div>

        <div class="popup__footer">
          <el-alert
            v-if="isAlreadyExists"
            type="warning"
            :title="t('popup.alreadyExists')"
            :closable="false"
            show-icon
          />
          <el-button
            v-else
            type="primary"
            @click="addCurrentPage"
            round
            :disabled="isAlreadyExists"
            :icon="Add12Filled"
          >
            {{ t('popup.addToShortcut') }}
          </el-button>
        </div>
      </template>
    </template>

    <div v-else class="popup__error">
      <el-icon size="48" color="var(--el-color-danger)">
        <close-round />
      </el-icon>
      <span>{{ t('popup.cannotAdd') }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.popup {
  width: 360px;
  padding: 20px;
  margin: 20px;
  background: var(--el-bg-color);
  border-radius: var(--el-border-radius-round);
  box-shadow: var(--el-box-shadow-light);
}

.popup__header {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 12px;
  margin-left: 3px;
}

.popup__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.popup__loading {
  height: 104px;
}

.popup__success,
.popup__error {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  min-height: 104px;
  color: var(--el-text-color-regular);
}

.popup__content {
  margin-bottom: 12px;
}

.popup__site-info {
  display: flex;
  gap: 12px;
  align-items: center;
  height: 60px;
  padding: 12px 17px;
  margin-bottom: 12px;
  background: var(--el-fill-color-light);
  border-radius: 15px;
}

.popup__favicon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 6px;

  &--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-7);
  }
}

.popup__site-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  .el-text {
    align-self: auto;
  }
}

.popup__site-title {
  font-weight: 500;
}

.popup__footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
