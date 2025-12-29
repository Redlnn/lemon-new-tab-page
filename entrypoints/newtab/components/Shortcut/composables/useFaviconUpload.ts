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
            const clean = DOMPurify.sanitize(convertBase64Svg(res), {
              USE_PROFILES: { svg: true, svgFilters: true }
            })
            // 使用 TextEncoder 将 UTF-8 字符串转为字节，再进行 base64 编码
            const encoder = new TextEncoder()
            const bytes = encoder.encode(clean)
            const CHUNK = 0x8000
            let binary = ''
            for (let i = 0; i < bytes.length; i += CHUNK) {
              const slice = bytes.subarray(i, i + CHUNK)
              // Array.prototype.slice.call 转为普通数组以兼容 apply
              const nums = Array.prototype.slice.call(slice) as number[]
              binary += String.fromCharCode.apply(null, nums)
            }
            res = `data:image/svg+xml;base64,${btoa(binary)}`
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
