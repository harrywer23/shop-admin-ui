<template>
  <div class="image-uploader">
    <div class="upload-container">
      <!-- 图片预览区域 -->
      <div v-if="imageUrl" class="image-preview">
        <img :src="imageUrl" alt="预览图" />
        <div class="image-actions">
          <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="handleRemove"
          />
        </div>
      </div>

      <!-- 上传按钮 -->
      <q-btn
          v-else
          class="upload-btn"
          flat
          :loading="uploading"
      >
        <q-icon name="add_photo_alternate" size="2rem" />
        <div class="upload-text">点击上传</div>
        <input
            type="file"
            class="file-input"
            accept="image/*"
            @change="handleFileChange"
        />
      </q-btn>
    </div>

    <!-- 提示文本 -->
    <div class="upload-tip text-grey-6">
      支持 jpg、png 格式，大小不超过 2MB
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
// 从配置中获取图片基础URL
const IMAGE_BASE_URL = config.public.imageBaseUrl || 'https://image.aiavr.uk/xinshijie'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  maxSize: {
    type: Number,
    default: 2 * 1024 * 1024 // 2MB
  }
})

const emit = defineEmits(['update:modelValue'])
const $q = useQuasar()

const imageUrl = ref('')
const uploading = ref(false)

// 监听 modelValue 变化，使用配置的基础URL
watch(() => props.modelValue, (newVal) => {
  imageUrl.value = newVal ? `${IMAGE_BASE_URL}${newVal}` : ''
})

// 处理文件选择
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input?.files?.[0]

  if (!file) return

  // 验证文件类型
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    $q.notify({
      type: 'negative',
      message: '只支持 jpg、png 格式的图片',
      position: 'top'
    })
    return
  }

  // 验证文件大小
  if (file.size > props.maxSize) {
    $q.notify({
      type: 'negative',
      message: '图片大小不能超过 2MB',
      position: 'top'
    })
    return
  }

  try {
    uploading.value = true

    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/common/uploadImage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.code === 200) {
      // 使用配置的基础URL拼接完整路径
      const fullImageUrl = `${IMAGE_BASE_URL}${response.data.data.sourceUrl}`
      imageUrl.value = fullImageUrl
      emit('update:modelValue', response.data.data.sourceUrl) // 只保存相对路径

      $q.notify({
        type: 'positive',
        message: '上传成功',
        position: 'top'
      })
    } else {
      throw new Error(response.data.msg || '上传失败')
    }

  } catch (error) {
    console.error('上传失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '上传失败',
      position: 'top'
    })
  } finally {
    uploading.value = false
    if (input) input.value = ''
  }
}

// 删除图片
const handleRemove = () => {
  imageUrl.value = ''
  emit('update:modelValue', '')
}
</script>

<style lang="scss" scoped>
.image-uploader {
  .upload-container {
    width: 200px;
    height: 200px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    overflow: hidden;

    &:hover {
      border-color: var(--q-primary);
    }
  }

  .upload-btn {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;

    .upload-text {
      margin-top: 8px;
      font-size: 14px;
      color: #606266;
    }

    .file-input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }
  }

  .image-preview {
    width: 100%;
    height: 100%;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-actions {
      position: absolute;
      top: 0;
      right: 0;
      padding: 8px;
      background: rgba(0, 0, 0, 0.5);
      border-bottom-left-radius: 8px;
      opacity: 0;
      transition: opacity 0.3s;
    }

    &:hover .image-actions {
      opacity: 1;
    }
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.4;
  }
}
</style>
