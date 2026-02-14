import { promiseTimeout } from '@vueuse/core'

import i18next from 'i18next'

import { browser, storage } from '#imports'

async function downloadBackup() {
  const { downloadJSON } = await import('@/shared/getJson')

  const settings = await browser.storage.local.get('settings')
  const pinedShortcut = await browser.storage.local.get('bookmark')
  const customSearchEngine = await browser.storage.local.get('customSearchEngine')

  downloadJSON(
    { ...settings, ...pinedShortcut, ...customSearchEngine },
    `lemon-new-tab-backup-${new Date().toISOString()}.json`
  )
}

export async function handleInvaildSettings() {
  const { DownloadRound } = await import('@vicons/material')
  const { ElButton } = await import('element-plus')
  const localForage = await import('localforage')

  await ElMessageBox.alert(
    () =>
      h('div', null, [
        h('p', { style: 'margin-bootom:.5em' }, i18next.t('bootstrap.invalidVer.msg')),
        h('p', { style: 'margin:.5em 0' }, [i18next.t('bootstrap.invalidVer.bak')]),
        h(
          ElButton,
          {
            type: 'primary',
            icon: DownloadRound,
            onClick: downloadBackup
          },
          'Download'
        )
      ]),
    i18next.t('bootstrap.invalidVer.title'),
    {
      confirmButtonText: i18next.t('bootstrap.invalidVer.btn'),
      type: 'warning',
      showClose: false,
      closeOnPressEscape: false,
      closeOnClickModal: false,
      roundButton: true
    }
  )

  ElLoading.service({
    lock: true,
    text: i18next.t('settings:other.confirmPurgeData.purging'),
    body: true,
    background: 'var(--el-overlay-color-light)'
  })

  try {
    await Promise.all([
      localStorage.clear,
      sessionStorage.clear,
      localForage.dropInstance({ name: '柠檬起始页' }),
      storage.clear('local'),
      storage.clear('session')
    ])
  } catch (e) {
    console.error('Failed to clear data:', e)
    ElMessageBox.alert(
      h('div', null, [h('h5', null, (e as Error).name), h('p', null, (e as Error).message)]),
      {
        title: 'Failed to clear data'
      }
    )
    return false
  }
  await promiseTimeout(1000)
  location.reload()
}
