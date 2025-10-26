import DOMPurify from 'dompurify'
import type { UploadProps, UploadRequestOptions } from 'element-plus'
import { useTranslation } from 'i18next-vue'

import { convertBase64Svg, isImageFile } from '@/shared/media'

export function useFaviconUpload(options?: { maxKB?: number }) {
  const { t } = useTranslation()
  const maxKB = options?.maxKB ?? 100

  const isSvg = (file: Blob) => file.type.endsWith('svg+xml')

  const confirmSvgUpload = async () => {
    try {
      await ElMessageBox.confirm(
        t('shortcut.addDialog.confirmSvgDesc'),
        t('shortcut.addDialog.confirmSvgTitle'),
        {
          confirmButtonText: t('shortcut.addDialog.confirmSvgOKBtn'),
          cancelButtonText: t('shortcut.addDialog.confirmSvgCancelBtn'),
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false,
          type: 'warning'
        }
      )
      return true
    } catch {
      return false
    }
  }

  const beforeFaviconUpload: UploadProps['beforeUpload'] = async (rawFile) => {
    if (!isImageFile(rawFile, ['image/x-icon', 'image/svg+xml'])) {
      ElMessage.error(t('settings:background.warning.fileIsNotImage'))
      return false
    }
    if (isSvg(rawFile)) {
      return await confirmSvgUpload()
    }
    if (rawFile.size / 1024 > maxKB) {
      ElMessage.error(t('shortcut.addDialog.tooLargeImageError'))
      return false
    }
    return true
  }

  const fileToBase64 = async (file: File): Promise<string> => {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        try {
          let res = reader.result as string
          if (res.startsWith('data:image/svg+xml')) {
            res = DOMPurify.sanitize(convertBase64Svg(res), {
              USE_PROFILES: { svg: true, svgFilters: true }
            })
            // 处理非 ASCII 字符，确保 UTF-8 安全
            const utf8 = encodeURIComponent(res).replace(/%([0-9A-F]{2})/g, (_, p1) =>
              String.fromCharCode(parseInt(p1, 16))
            )
            res = `data:image/svg+xml;base64,${btoa(utf8)}`
          }
          resolve(res)
        } catch (e) {
          reject(e)
        }
      }
      reader.onerror = reject
    })
  }

  const httpRequest = async (option: UploadRequestOptions, onDone: (base64: string) => void) => {
    const base64 = await fileToBase64(option.file as File)
    onDone(base64)
  }

  return { beforeFaviconUpload, fileToBase64, httpRequest, isSvg }
}
