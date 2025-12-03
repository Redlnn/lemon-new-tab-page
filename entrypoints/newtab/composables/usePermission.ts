import { ref } from 'vue'

import { browser } from 'wxt/browser'

export enum PermissionResult {
  GrantedAll = 'granted-all',
  GrantedCurrent = 'granted-current',
  DeniedByUser = 'denied-by-user',
  DeniedByBrowser = 'denied-by-browser',
  AlreadyOpen = 'already-open'
}

const permissionDialogVisible = ref(false)
const currentHostname = ref('')
let permissionResolve: ((value: PermissionResult) => void) | null = null

export function usePermission() {
  const onPermissionDialogResult = (result: PermissionResult) => {
    permissionDialogVisible.value = false
    if (permissionResolve) {
      permissionResolve(result)
      permissionResolve = null
    }
  }

  const checkAndRequestPermission = async (
    hostname: string,
    onlyAll: boolean = false
  ): Promise<PermissionResult> => {
    const allPermissions = { origins: [`*://*/*`] }
    const allGranted = await browser.permissions.contains(allPermissions)
    const permissions = { origins: [`*://${hostname}/*`] }
    const granted = await browser.permissions.contains(permissions)

    if (allGranted) return PermissionResult.GrantedAll
    if (!onlyAll && granted) return PermissionResult.GrantedCurrent

    if (permissionDialogVisible.value) return PermissionResult.AlreadyOpen

    currentHostname.value = hostname
    permissionDialogVisible.value = true

    return new Promise<PermissionResult>((resolve) => {
      permissionResolve = resolve
    })
  }

  return {
    permissionDialogVisible,
    currentHostname,
    onPermissionDialogResult,
    checkAndRequestPermission
  }
}
