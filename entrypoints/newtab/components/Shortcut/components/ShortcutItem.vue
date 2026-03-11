<script setup lang="ts">
import { toRef } from 'vue'
import { OnLongPress } from '@vueuse/components'

import { Pin12Regular } from '@vicons/fluent'

import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import usePerfClasses from '@newtab/composables/usePerfClasses'
import { isHasTouchDevice, isTouchEvent } from '@newtab/shared/touch'

const settings = useSettingsStore()

const props = defineProps<{
  url: string
  title: string
  pined?: boolean
  favicon?: string
  onContextMenu?: (event: MouseEvent | PointerEvent) => void
}>()

// 使用 Ref 传递 url，让 getFaviconURL 内部监听变化
const faviconRef = getFaviconURL(toRef(props, 'url'))
const iconUrl = computed(() => props.favicon || faviconRef.value)

const perf = usePerfClasses(() => ({
  transparent: settings.perf.enableShortcutTransparent,
  blur: settings.perf.enableShortcutBlur
}))

const iconClass = perf('shortcut__icon')
const pinIconClass = perf('shortcut__pin-icon')

const itemRef = useTemplateRef('itemRef')
</script>

<template>
  <div role="button" class="shortcut__item noselect" :class="[{ pined: pined }]">
    <OnLongPress
      as="a"
      ref="itemRef"
      class="shortcut__item-link"
      tabindex="-1"
      :href="url"
      :target="settings.shortcut.openInNewTab ? '_blank' : '_self'"
      @contextmenu.stop.prevent="onContextMenu"
      @trigger="
        (e: PointerEvent) => {
          if (isHasTouchDevice && isTouchEvent(e)) onContextMenu?.(e)
        }
      "
    >
      <div
        class="shortcut__icon-container"
        :style="{ marginBottom: `${settings.shortcut.iconMarginBottom}px` }"
      >
        <div
          v-if="pined && settings.shortcut.showPinnedIcon && settings.shortcut.enableTopSites"
          :class="['shortcut__pin-icon', pinIconClass]"
        >
          <el-icon size="11">
            <pin12-regular />
          </el-icon>
        </div>
        <div class="shortcut__icon" :class="iconClass">
          <span
            class="span"
            :style="{
              backgroundImage: `url(${iconUrl})`
            }"
          ></span>
        </div>
      </div>
      <el-text
        :data-content="title"
        v-if="settings.shortcut.showShortcutTitle"
        class="shortcut__title"
        :style="{ width: `calc(var(--icon_size) + ${settings.shortcut.titleExtraWidth}px)` }"
        truncated
      >
        {{ title }}
      </el-text>
    </OnLongPress>
  </div>
</template>
