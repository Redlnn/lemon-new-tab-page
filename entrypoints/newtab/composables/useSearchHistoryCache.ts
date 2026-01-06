import { searchHistoriesStorage } from '@newtab/shared/storages/searchHistoriesStorage'

const historiesRef: Ref<string[]> = ref([])
let loaded = false
let loadingPromise: Promise<void> | null = null
let watching = false
let suppressNextWatch = false

async function loadFromStorage() {
  const list = await searchHistoriesStorage.getValue()
  historiesRef.value = list
}

async function ensureLoaded(force = false) {
  if (force) {
    loaded = false
  }
  if (loaded) {
    return
  }
  if (!loadingPromise) {
    loadingPromise = loadFromStorage().finally(() => {
      loadingPromise = null
      loaded = true
    })
  }
  await loadingPromise
}

function ensureWatching() {
  if (watching) {
    return
  }
  watching = true
  searchHistoriesStorage.watch(async () => {
    if (suppressNextWatch) {
      suppressNextWatch = false
      return
    }
    await loadFromStorage()
    loaded = true
  })
}

async function updateStorage(list: string[]) {
  suppressNextWatch = true
  historiesRef.value = list
  await searchHistoriesStorage.setValue(list)
  loaded = true
}

async function addHistory(text: string, limit = 15) {
  if (!text) {
    return
  }
  await ensureLoaded()

  const current = historiesRef.value
  const next: string[] = [text]
  for (let i = 0, len = current.length; i < len && next.length < limit; i++) {
    if (current[i] !== text) {
      next.push(current[i]!)
    }
  }
  await updateStorage(next)
}

async function clearHistories() {
  await ensureLoaded()
  if (historiesRef.value.length === 0) {
    return
  }
  await updateStorage([])
}

export function useSearchHistoryCache() {
  ensureWatching()

  return {
    histories: readonly(historiesRef),
    ensureLoaded,
    addHistory,
    clearHistories
  }
}
