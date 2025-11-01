<script setup lang="ts">
import { CheckmarkCircle12Filled, Delete16Regular, Edit16Regular } from '@vicons/fluent'
import type { DropdownInstance } from 'element-plus'
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

import { getPerfClasses } from '@newtab/composables/perfClasses'

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
  (e: 'opened'): void
}>()

const dropdownRef = ref<DropdownInstance | null>(null)
const position = ref<DOMRect | null>(null)

const triggerRef = {
  getBoundingClientRect: () => position.value ?? new DOMRect()
}

function handleClick() {
  emit('select', props.engine.id)
}

function handleContextmenu(e: MouseEvent) {
  e.preventDefault()
  const rect = DOMRect.fromRect({ x: e.clientX, y: e.clientY })
  position.value = rect
  dropdownRef.value?.handleOpen()
  emit('opened')
}

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
    class="se-switcher-item se-switcher-item--custom"
    :class="{ 'is-active': isActive }"
    @click="handleClick"
    @contextmenu="handleContextmenu"
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
      :popper-class="
        getPerfClasses(
          {
            transparentOff: settings.perf.disableDialogTransparent,
            blurOff: settings.perf.disableDialogBlur
          },
          'se-switcher-item__menu-popper'
        )
      "
    >
      <template #dropdown>
        <el-dropdown-menu>
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
