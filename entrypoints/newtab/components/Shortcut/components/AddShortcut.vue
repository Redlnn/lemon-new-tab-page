<script setup lang="ts">
import { AddRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

import usePerfClasses from '@newtab/composables/usePerfClasses'

const { t } = useTranslation()

const settings = useSettingsStore()

withDefaults(
  defineProps<{
    showButton?: boolean
    tabindex?: boolean
    onOpen?: () => void
  }>(),
  {
    showButton: true,
    tabindex: true
  }
)

const perf = usePerfClasses(() => ({
  transparent: settings.perf.shortcut.transparent,
  blur: settings.perf.shortcut.blur
}))

const iconPerfClass = perf('shortcut__icon')
</script>

<template>
  <div
    v-if="showButton"
    role="button"
    :tabindex="tabindex ? '0' : '-1'"
    class="shortcut__item shortcut__item--add-shortcut noselect"
  >
    <div
      class="shortcut__item-link"
      style="cursor: pointer"
      @click="onOpen?.()"
      @keydown.enter="onOpen?.()"
    >
      <div
        class="shortcut__icon-container"
        :style="{ marginBottom: `${settings.shortcut.spacing.iconTitleGap}px` }"
      >
        <div
          class="shortcut__icon"
          :class="[iconPerfClass, { border: settings.shortcut.style.border }]"
        >
          <add-round />
        </div>
      </div>
      <el-text
        v-if="settings.shortcut.title.show"
        class="shortcut__title"
        :style="{ width: `calc(var(--icon_size) + ${settings.shortcut.title.extraWidth}px)` }"
        truncated
      >
        {{ t('shortcut.addShortcut') }}
      </el-text>
    </div>
  </div>
</template>

<style lang="scss">
.shortcut__item--add-shortcut .shortcut__item-link {
  .shortcut__title,
  .shortcut__icon {
    color: var(--le-text-color-primary-opacity-65);
  }

  .shortcut__icon {
    svg {
      width: 70%;
    }
  }

  &:hover {
    .shortcut__title,
    .shortcut__icon {
      color: var(--el-text-color-primary);
    }
  }

  .shortcut__container--item-shadow &:not(:hover) .shortcut__title {
    text-shadow: 1px 1px 4px rgb(0 0 0 / 50%);
  }

  // 白色文本容器特化
  html.light .shortcut__container--white-in-light & {
    .shortcut__title,
    .shortcut__icon {
      color: rgb(255 255 255 / 70%);

      &:not(.shortcut__icon--opacity) {
        svg {
          color: var(--le-text-color-primary-opacity-65);
        }
      }
    }

    &:hover {
      .shortcut__title,
      .shortcut__icon {
        color: var(--el-color-white);

        &:not(.shortcut__icon--opacity) {
          svg {
            color: var(--el-text-color-regular);
          }
        }
      }
    }
  }
}
</style>
