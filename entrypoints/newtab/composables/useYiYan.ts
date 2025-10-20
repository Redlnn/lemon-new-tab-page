import { useWindowSize } from '@vueuse/core'

import { useSettingsStore } from '@/shared/settings'
import { getYiyanCache, isCacheFresh, setYiyanCache } from '@/shared/yiyan'
import { yiyanProviders } from '@/shared/yiyan/providers'

import { useFocusStore } from '@newtab/scripts/store'

export function useYiYan() {
  const focusStore = useFocusStore()
  const settings = useSettingsStore()
  const { height } = useWindowSize()

  const yiyan = ref<string>()
  const yiyanOrigin = ref<string>()

  const load = async () => {
    try {
      const cache = await getYiyanCache()
      if (isCacheFresh(cache) && cache?.provider === settings.yiyan.provider) {
        const { res } = cache
        yiyan.value = res?.yiyan
        yiyanOrigin.value = res?.yiyanOrigin
      } else {
        const res = await yiyanProviders[settings.yiyan.provider].load()
        yiyan.value = res.yiyan
        yiyanOrigin.value = res.yiyanOrigin
        await setYiyanCache(settings.yiyan.provider, res)
      }
    } catch (err) {
      console.error('YiYan load error', err)
    }
  }

  const isEnabled = () =>
    Boolean(
      yiyan.value && height.value >= 800 && (focusStore.isFocused || settings.yiyan.alwaysShow)
    )

  return { yiyan, yiyanOrigin, load, isEnabled }
}
