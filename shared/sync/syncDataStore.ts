import { useDebounceFn } from '@vueuse/core'
import { defineStore, MutationType } from 'pinia'
import { toRaw } from 'vue'

import { browser } from 'wxt/browser'

import { useCustomSearchEngineStore } from '@newtab/shared/customSearchEngine'

import { BgType } from '../enums'
import type { CURRENT_CONFIG_SCHEMA, SettingsSchemaV7, SettingsSchemaV8 } from '../settings'
import {
  CURRENT_CONFIG_VERSION,
  defaultSettings,
  migrateFromVer7To8,
  migrateFromVer8To9,
  useSettingsStore,
} from '../settings'
import { defaultShortcuts, useShortcutStore } from '../shortcut'
import type { Shortcuts } from '../shortcut/shortcutStorage'

import { createDeviceId, detectDeviceName } from './device'
import { localSyncMetaStorage, syncDataStorage } from './syncDataStorage'
import { defaultSyncedCustomSearchEngines, isSyncEnvelopeV1 } from './types'
import type {
  LocalSyncMeta,
  SyncEnvelopeV1,
  SyncEventPayloadMap,
  SyncEventType,
  SyncMessage,
  SyncRequestMessage,
  SyncedCustomSearchEngineStorage,
} from './types'

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const hasStringType = (value: unknown): value is { type: string } =>
  isObjectRecord(value) && typeof value.type === 'string'

const toError = (err: unknown): Error => (err instanceof Error ? err : new Error(String(err)))

const debouncedSend = useDebounceFn(async (data: SyncEnvelopeV1) => {
  try {
    const syncRequestMessage: SyncRequestMessage = {
      type: 'SYNC_REQUEST',
      data,
    }
    await browser.runtime.sendMessage(syncRequestMessage)
  } catch (err) {
    console.error('Sync to cloud failed:', toError(err))
  }
}, 2000)

const isSyncUpdateMessage = (msg: unknown): msg is SyncMessage =>
  hasStringType(msg) && msg.type === 'SYNC_UPDATE'

async function handleSyncStorageUpdateMessage(message: unknown) {
  if (isSyncUpdateMessage(message)) {
    const syncDataStore = useSyncDataStore()
    await syncDataStore.checkCloudSync()
  }
}

// 静默同步标志
// 防止初始化过程中触发 subChange
// 防止 applyCloudData 期间触发 subChange
let isProcessing = false

// 已初始化标志及清理句柄，防止重复 init
let initialized = false
let cleanupFns: (() => void)[] = []

// 事件回调，用于通知 UI 层
export type SyncEventCallback = <T extends SyncEventType>(
  type: T,
  payload: SyncEventPayloadMap[T],
) => void
let syncEventCallback: SyncEventCallback | null = null
export function setSyncEventCallback(cb: SyncEventCallback | null) {
  syncEventCallback = cb
}

const emitSyncEvent = <T extends SyncEventType>(type: T, payload: SyncEventPayloadMap[T]) => {
  syncEventCallback?.(type, payload)
}

const emitSyncError = (err: unknown) => {
  emitSyncEvent('sync-error', toError(err))
}

type MigratableSettings = SettingsSchemaV7 | SettingsSchemaV8 | CURRENT_CONFIG_SCHEMA

const migrations: Partial<
  Record<
    MigratableSettings['version'],
    (s: MigratableSettings) => Promise<MigratableSettings> | MigratableSettings
  >
> = {
  7: (s) => (s.version === 7 ? migrateFromVer7To8(s) : s),
  8: (s) => (s.version === 8 ? migrateFromVer8To9(s) : s),
}

const BUILTIN_SEARCH_ENGINES = new Set(['google', 'baidu', 'bing', 'yandex', 'duckduckgo'])

const normalizeCustomSearchEngines = (
  input: SyncedCustomSearchEngineStorage,
): SyncedCustomSearchEngineStorage => {
  const seenIds = new Set<string>()
  const items = input.items.filter((item) => {
    if (seenIds.has(item.id)) return false
    if (!item.id.trim() || !item.name.trim() || !item.url.trim()) return false
    seenIds.add(item.id)
    return true
  })
  return { items }
}

const createDefaultEnvelope = (meta: LocalSyncMeta): SyncEnvelopeV1 => ({
  _v: 1,
  configVersion: CURRENT_CONFIG_VERSION,
  fromDeviceId: meta.deviceId,
  fromDeviceName: meta.deviceName,
  lastUpdate: 0,
  settings: structuredClone(defaultSettings),
  bookmarks: structuredClone(defaultShortcuts),
  customSearchEngines: structuredClone(defaultSyncedCustomSearchEngines),
})

export const useSyncDataStore = defineStore('sync', () => {
  const settings = ref<CURRENT_CONFIG_SCHEMA>(structuredClone(defaultSettings))
  const bookmarks = ref<Shortcuts>(structuredClone(defaultShortcuts))
  const lastUpdate = ref(0)

  const legacyDialogVisible = ref(false)
  const conflictDialogVisible = ref(false)
  const conflictPayload = ref<SyncEventPayloadMap['conflict'] | null>(null)

  const ensureDeviceMeta = async (): Promise<LocalSyncMeta> => {
    const current = await localSyncMetaStorage.getValue()
    const next: LocalSyncMeta = {
      ...current,
      deviceId: current.deviceId || createDeviceId(),
      deviceName: current.deviceName || detectDeviceName(),
    }

    if (next.deviceId !== current.deviceId || next.deviceName !== current.deviceName) {
      await localSyncMetaStorage.setValue(next)
    }

    return next
  }

  const setLocalSyncMeta = async (patch: Partial<LocalSyncMeta>): Promise<LocalSyncMeta> => {
    const current = await ensureDeviceMeta()
    const next = { ...current, ...patch }
    await localSyncMetaStorage.setValue(next)
    return next
  }

  const sanitizeSettingsForCloud = (input: CURRENT_CONFIG_SCHEMA): CURRENT_CONFIG_SCHEMA => {
    const sanitized = structuredClone(input)
    if (
      sanitized.background.bgType === BgType.Local ||
      sanitized.background.bgType === BgType.Online
    ) {
      sanitized.background.bgType = BgType.Bing
    }
    sanitized.background.local = structuredClone(defaultSettings.background.local)
    sanitized.background.localDark = structuredClone(defaultSettings.background.localDark)
    sanitized.background.bing = structuredClone(defaultSettings.background.bing)
    sanitized.background.online.url = defaultSettings.background.online.url
    sanitized.pluginVersion = defaultSettings.pluginVersion
    sanitized.readChangeLog = defaultSettings.readChangeLog
    return sanitized
  }

  const restoreDeviceLocalFields = (
    cloudSettings: CURRENT_CONFIG_SCHEMA,
    localSettings: CURRENT_CONFIG_SCHEMA,
  ): CURRENT_CONFIG_SCHEMA => {
    const merged = structuredClone(cloudSettings)
    merged.background.bgType = localSettings.background.bgType
    merged.background.local = structuredClone(localSettings.background.local)
    merged.background.localDark = structuredClone(localSettings.background.localDark)
    merged.background.bing = structuredClone(localSettings.background.bing)
    merged.background.online.url = localSettings.background.online.url
    merged.pluginVersion = localSettings.pluginVersion
    merged.readChangeLog = localSettings.readChangeLog
    return merged
  }

  const ensureSearchEngineAvailable = (
    localSettings: ReturnType<typeof useSettingsStore>,
    customSearchEngines: SyncedCustomSearchEngineStorage,
  ) => {
    const { engine } = localSettings.search
    if (BUILTIN_SEARCH_ENGINES.has(engine)) return
    if (customSearchEngines.items.some((item) => item.id === engine)) return
    localSettings.search.engine = defaultSettings.search.engine
  }

  const migrateCloudSettings = async (settings: MigratableSettings) => {
    let current = settings
    let migrated = false

    while (current.version < CURRENT_CONFIG_VERSION) {
      const migrate = migrations[current.version]
      if (!migrate) {
        throw new Error(`Unsupported cloud config version: ${current.version}`)
      }

      const next = await migrate(current)
      if (next.version <= current.version || next.version > CURRENT_CONFIG_VERSION) {
        throw new Error(`Invalid migration result: ${current.version} -> ${next.version}`)
      }

      current = next
      migrated = true
    }

    if (current.version !== CURRENT_CONFIG_VERSION) {
      throw new Error(`Unexpected cloud config version after migration: ${current.version}`)
    }

    return {
      settings: current as CURRENT_CONFIG_SCHEMA,
      migrated,
    }
  }

  const buildPayload = (timestamp: number, meta: LocalSyncMeta): SyncEnvelopeV1 => {
    const localSettings = useSettingsStore()
    const shortcutStore = useShortcutStore()
    const customSearchEngineStore = useCustomSearchEngineStore()

    const settingsSnapshot = structuredClone(localSettings.getRawState())
    const bookmarksSnapshot: Shortcuts = { items: structuredClone(toRaw(shortcutStore.items)) }
    const customSearchEngineSnapshot = normalizeCustomSearchEngines({
      items: structuredClone(toRaw(customSearchEngineStore.items)),
    })

    return {
      _v: 1,
      configVersion: settingsSnapshot.version,
      fromDeviceId: meta.deviceId,
      fromDeviceName: meta.deviceName,
      lastUpdate: timestamp,
      settings: sanitizeSettingsForCloud(settingsSnapshot),
      bookmarks: bookmarksSnapshot,
      customSearchEngines: customSearchEngineSnapshot,
    }
  }

  const pushLocalSnapshot = async (timestamp: number) => {
    const localSettings = useSettingsStore()
    if (!localSettings.sync.enabled) {
      return
    }

    const meta = await setLocalSyncMeta({ localModifiedAt: timestamp })
    const payload = buildPayload(timestamp, meta)
    lastUpdate.value = payload.lastUpdate
    debouncedSend(payload)
  }

  const handleLegacyDetected = () => {
    const localSettings = useSettingsStore()
    localSettings.sync.enabled = false
    legacyDialogVisible.value = true
    emitSyncEvent('legacy-detected', undefined)
  }

  const init = async () => {
    // 幂等：如已初始化，先清理再重新初始化
    if (initialized) {
      deinit()
    }

    const localSettings = useSettingsStore()
    isProcessing = true
    try {
      await ensureDeviceMeta()

      const cloudData = await syncDataStorage.getValue()
      if (isSyncEnvelopeV1(cloudData)) {
        settings.value = cloudData.settings
        bookmarks.value = cloudData.bookmarks
        lastUpdate.value = cloudData.lastUpdate
      } else {
        settings.value = structuredClone(localSettings.getRawState())
        bookmarks.value = structuredClone(defaultShortcuts)
        lastUpdate.value = 0
      }

      const syncInitedMessage: SyncMessage = {
        type: 'SYNC_INITED',
      }
      browser.runtime.sendMessage(syncInitedMessage)

      // 监听同步储存更新消息
      browser.runtime.onMessage.addListener(handleSyncStorageUpdateMessage)

      // 监听变化触发同步
      // 追踪上一次的 sync.enabled 状态，避免用户手动开启云同步时立刻把
      // local lastUpdate 推新（导致本地覆盖云端）。当检测到由 false -> true
      // 的切换时，只执行一次 checkCloudSync()，不更新 lastUpdate。
      let prevSyncEnabled = localSettings.sync.enabled

      const subChange = async () => {
        const nowEnabled = localSettings.sync.enabled

        // 如果正在处理（静默中），先同步 prevSyncEnabled 再早退，避免状态滞后
        if (isProcessing) {
          prevSyncEnabled = nowEnabled
          return
        }

        if (!nowEnabled) {
          return
        }

        // 刚刚从未启用变为启用：不更新 lastUpdate，仅检查云端
        if (!prevSyncEnabled && nowEnabled) {
          prevSyncEnabled = true
          await checkCloudSync()
          return
        }

        prevSyncEnabled = nowEnabled

        await setLocalSyncMeta({
          localModifiedAt: Date.now(),
        })
        await checkCloudSync()
      }

      const unsubSettings = localSettings.$subscribe(subChange)
      const shortcutStore = useShortcutStore()
      const customSearchEngineStore = useCustomSearchEngineStore()

      const onStateMutation = async (mutation: { type: MutationType }) => {
        if (mutation.type !== MutationType.direct) {
          // 防止刚开就认为数据过旧，只有 init 会整个替换 state
          return
        }
        await subChange()
      }

      const unsubShortcut = shortcutStore.$subscribe(onStateMutation)
      const unsubCustomSearchEngine = customSearchEngineStore.$subscribe(onStateMutation)

      cleanupFns = [
        () => browser.runtime.onMessage.removeListener(handleSyncStorageUpdateMessage),
        unsubSettings,
        unsubShortcut,
        unsubCustomSearchEngine,
      ]
      initialized = true

      // 初始化时进行一次同步检查
      await checkCloudSync()
    } catch (err) {
      emitSyncError(err)
    } finally {
      isProcessing = false
    }
  }

  const deinit = () => {
    cleanupFns.forEach((fn) => fn())
    cleanupFns = []
    conflictDialogVisible.value = false
    conflictPayload.value = null
    legacyDialogVisible.value = false
    initialized = false
  }

  const checkCloudSync = async () => {
    try {
      const localSettings = useSettingsStore()
      if (!localSettings.sync.enabled) {
        return false
      }

      const cloudData = await syncDataStorage.getValue()
      if (!isSyncEnvelopeV1(cloudData)) {
        handleLegacyDetected()
        return false
      }

      // 检查版本
      if (cloudData.configVersion > CURRENT_CONFIG_VERSION) {
        localSettings.sync.enabled = false
        emitSyncEvent('version-too-new', {
          cloud: cloudData.configVersion,
          local: CURRENT_CONFIG_VERSION,
        })
        return false
      }

      const localSyncMeta = await ensureDeviceMeta()
      const S = localSyncMeta.lastSyncedAt
      const M = localSyncMeta.localModifiedAt
      const C = cloudData.lastUpdate

      // 首次完全初始化：S=0, M=0, C=0 → 推送本地（初始化）
      if (S === 0 && M === 0 && C === 0) {
        await pushLocalSnapshot(Date.now())
        return true
      }

      // 云端为空，推送本地
      if (C === 0) {
        await pushLocalSnapshot(M > 0 ? M : Date.now())
        return true
      }

      // 如果本地从未同步过（S=0 但 M>0 或 M=0），使用当前时间戳作为 M
      // 这样首次连接有云端数据时会触发冲突检测
      let localModifiedAt = M
      if (S === 0 && M === 0) {
        localModifiedAt = Date.now()
        await setLocalSyncMeta({ localModifiedAt })
      }

      const hasLocalChanges = localModifiedAt > S
      const hasCloudChanges = C > S

      if (!hasLocalChanges && !hasCloudChanges) {
        return true
      }

      if (hasLocalChanges && hasCloudChanges) {
        if (C === localModifiedAt) {
          await setLocalSyncMeta({ lastSyncedAt: C })
          return true
        }

        const conflict: SyncEventPayloadMap['conflict'] = {
          cloud: {
            lastUpdate: cloudData.lastUpdate,
            fromDeviceName: cloudData.fromDeviceName,
            fromDeviceId: cloudData.fromDeviceId,
          },
          local: {
            localModifiedAt: localModifiedAt,
          },
        }
        conflictPayload.value = conflict
        conflictDialogVisible.value = true
        emitSyncEvent('conflict', conflict)
        return false
      }

      if (hasLocalChanges) {
        await pushLocalSnapshot(localModifiedAt > 0 ? localModifiedAt : Date.now())
        return true
      }

      if (hasCloudChanges) {
        await applyCloudData(cloudData, { pushBackAfterMigration: true })
        return true
      }
    } catch (err) {
      emitSyncError(err)
    }

    return false
  }

  const syncToCloud = async () => {
    try {
      await pushLocalSnapshot(Date.now())
    } catch (err) {
      emitSyncError(err)
    }
  }

  const applyCloudData = async (
    cloudInput?: SyncEnvelopeV1,
    options: { pushBackAfterMigration?: boolean } = {},
  ) => {
    isProcessing = true
    try {
      const localSettings = useSettingsStore()
      const cloudData = cloudInput ?? (await syncDataStorage.getValue())
      if (!isSyncEnvelopeV1(cloudData)) {
        handleLegacyDetected()
        return
      }
      const shortcutStore = useShortcutStore()
      const customSearchEngineStore = useCustomSearchEngineStore()

      if (cloudData.configVersion > CURRENT_CONFIG_VERSION) {
        localSettings.sync.enabled = false
        emitSyncEvent('version-too-new', {
          cloud: cloudData.configVersion,
          local: CURRENT_CONFIG_VERSION,
        })
        return
      }

      const localState = structuredClone(localSettings.getRawState())
      const { settings: migratedSettings, migrated } = await migrateCloudSettings(
        cloudData.settings as MigratableSettings,
      )
      const mergedSettings = restoreDeviceLocalFields(migratedSettings, localState)

      localSettings.$patch(mergedSettings)
      await shortcutStore.save(cloudData.bookmarks)
      const normalizedCustomSearchEngines = normalizeCustomSearchEngines(
        cloudData.customSearchEngines,
      )
      await customSearchEngineStore.save(normalizedCustomSearchEngines)
      ensureSearchEngineAvailable(localSettings, normalizedCustomSearchEngines)

      await setLocalSyncMeta({
        lastSyncedAt: cloudData.lastUpdate,
        localModifiedAt: cloudData.lastUpdate,
      })
      lastUpdate.value = cloudData.lastUpdate

      if (options.pushBackAfterMigration && migrated) {
        await pushLocalSnapshot(Date.now())
      }
    } catch (err) {
      emitSyncError(err)
    } finally {
      isProcessing = false
    }
  }

  const clearLegacyAndReinitialize = async () => {
    const localSettings = useSettingsStore()
    isProcessing = true
    try {
      const meta = await ensureDeviceMeta()
      await syncDataStorage.setValue(createDefaultEnvelope(meta))
      localSettings.sync.enabled = true
      legacyDialogVisible.value = false
      await pushLocalSnapshot(Date.now())
      await checkCloudSync()
    } catch (err) {
      emitSyncError(err)
    } finally {
      isProcessing = false
    }
  }

  const dismissLegacyDialog = () => {
    legacyDialogVisible.value = false
  }

  const useCloudConflictData = async () => {
    conflictDialogVisible.value = false
    conflictPayload.value = null
    await applyCloudData(undefined, { pushBackAfterMigration: true })
  }

  const useLocalConflictData = async () => {
    conflictDialogVisible.value = false
    conflictPayload.value = null
    await pushLocalSnapshot(Date.now())
    await checkCloudSync()
  }

  const disableSyncAndDismissConflict = () => {
    const localSettings = useSettingsStore()
    localSettings.sync.enabled = false
    conflictDialogVisible.value = false
    conflictPayload.value = null
  }

  return {
    settings,
    bookmarks,
    lastUpdate,
    legacyDialogVisible,
    conflictDialogVisible,
    conflictPayload,
    init,
    deinit,
    checkCloudSync,
    syncToCloud,
    applyCloudData,
    clearLegacyAndReinitialize,
    dismissLegacyDialog,
    useCloudConflictData,
    useLocalConflictData,
    disableSyncAndDismissConflict,
  }
})
