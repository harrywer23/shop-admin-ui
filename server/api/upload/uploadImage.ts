import { defineEventHandler, readMultipartFormData } from 'h3'
import {API_CONSTANTS} from "~/utils/constants"

interface UploadResponse {
  code: number
  msg: string
  data: Array<{
    id: number
    sourceUrl: string
    md5: string
    size: number
    title: string
  }>
  total: number
  succ: boolean
  fail: boolean
}

export default defineEventHandler(async (event) => {
  try {
    // 在事件处理函数内部获取运行时配置
    const config = useRuntimeConfig(event)
    const formData = await readMultipartFormData(event)

    if (!formData) {
      throw new Error('No files uploaded')
    }

    // 创建新的 FormData 对象发送到后端
    const backendFormData = new FormData()
    formData.forEach(file => {
      if (file.filename) {
        // 将文件添加到 FormData
        const blob = new Blob([file.data], { type: file.type })
        backendFormData.append('file', blob, file.filename)
      }
    })

    // 调用后端上传接口
    const response = await fetch(`${API_CONSTANTS.BASE_URL}/common/uploadImage`, {
      method: 'POST',
      body: backendFormData,
      headers: {
        // 不要设置 Content-Type，让浏览器自动设置正确的 boundary
      }
    })

    const result: UploadResponse = await response.json()

    if (result.code === 200 && result.succ) {
      // 处理返回的数据，添加完整的图片URL
      const processedData = result.data.map(item => ({
        ...item,
        url: `${item.sourceUrl}` // 添加完整的图片URL
      }))

      return {
        code: 200,
        msg: 'Upload successful',
        data: processedData
      }
    } else {
      throw new Error(result.msg || 'Upload failed')
    }

  } catch (error) {
    console.error('Upload error:', error)

    return {
      code: 500,
      msg: error instanceof Error ? error.message : 'Upload failed',
      data: null
    }
  }
})
