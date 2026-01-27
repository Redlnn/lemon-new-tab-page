<script setup lang="ts">
import { onLongPress } from '@vueuse/core'

import { CheckmarkCircle12Filled, Delete16Regular, Edit16Regular } from '@vicons/fluent'
import type { DropdownInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

import { getPerfClasses } from '@newtab/composables/perfClasses'
import { CUSTOM_ENGINE_OPENED_MENU_CLOSE_FN } from '@newtab/shared/keys'
import { isHasTouchDevice, isTouchEvent } from '@newtab/shared/touch'

const { t } = useTranslation()

const settings = useSettingsStore()

const props = defineProps<{
  engine: { id: string; url: string; name: string; icon?: string }
  iconUrl?: string
  isActive?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()

// 缓存 getPerfClasses 结果
const perfClassesPopper = computed(() =>
  getPerfClasses(
    {
      transparentOff: settings.perf.disableDialogTransparent,
      blurOff: settings.perf.disableDialogBlur
    },
    'se-switcher-item__menu-popper'
  )
)

const openedMenuCloseFn = inject(CUSTOM_ENGINE_OPENED_MENU_CLOSE_FN)
const dropdownRef = ref<DropdownInstance | null>(null)
const position = ref<DOMRect | null>(null)
const itemRef = useTemplateRef('itemRef')

const triggerRef = {
  getBoundingClientRect: () => position.value ?? new DOMRect()
}

function handleClick() {
  emit('select', props.engine.id)
}

function handleContextmenu(e: MouseEvent | TouchEvent | PointerEvent) {
  // 打开新菜单前关闭旧菜单
  if (openedMenuCloseFn?.value) {
    openedMenuCloseFn.value()
  }

  let clientX = 0
  let clientY = 0

  if ('clientX' in e) {
    clientX = e.clientX
    clientY = e.clientY
  } else if ('touches' in e && e.touches[0]) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  }

  const rect = DOMRect.fromRect({ x: clientX, y: clientY })
  position.value = rect
  dropdownRef.value?.handleOpen()

  // 记录当前菜单的关闭函数
  if (openedMenuCloseFn) {
    openedMenuCloseFn.value = () => dropdownRef.value?.handleClose()
  }
}

onLongPress(itemRef, (event) => {
  if (isHasTouchDevice.value && isTouchEvent(event)) {
    handleContextmenu(event)
  }
})

function open() {
  dropdownRef.value?.handleOpen()
}

function close() {
  dropdownRef.value?.handleClose()
}

defineExpose({ open, close })
</script>

<template>
  <div
    ref="itemRef"
    class="se-switcher-item se-switcher-item--custom"
    :class="{ 'is-active': isActive }"
    @click="handleClick"
    @contextmenu.stop.prevent="handleContextmenu"
  >
    <div class="se-switcher-item__icon">
      <img :src="iconUrl" />
    </div>
    <div class="se-switcher-item__content">
      <div class="se-switcher-item__label">{{ engine.name }}</div>
      <el-text truncated class="se-switcher-item__url">{{ engine.url }}</el-text>
    </div>
    <el-icon size="16" class="se-switcher-item__checked">
      <CheckmarkCircle12Filled />
    </el-icon>

    <el-dropdown
      ref="dropdownRef"
      :virtual-ref="triggerRef"
      :show-arrow="false"
      virtual-triggering
      trigger="contextmenu"
      placement="bottom-start"
      :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [0, 0] } }] }"
      :popper-class="perfClassesPopper"
    >
      <template #dropdown>
        <el-dropdown-menu class="noselect">
          <el-dropdown-item :icon="Edit16Regular" @click="$emit('edit')">
            <span>{{ t('common.edit') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :icon="Delete16Regular" @click="$emit('delete')">
            <span>{{ t('common.delete') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
