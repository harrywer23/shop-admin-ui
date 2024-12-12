<template>
  <div class="image-uploader">
    <div class="row q-gutter-sm">
      <!-- 已上传的图片 -->
      <template v-for="(pic, index) in modelValue" :key="index">
        <div class="col-4 col-sm-3">
          <q-img
            :src="pic"
            style="height: 100px"
            class="rounded-borders"
          >
            <div class="absolute-top-right">
              <q-btn
                round
                flat
                dense
                color="negative"
                icon="close"
                @click="removePicture(index)"
              />
            </div>
            <!-- 预览按钮 -->
            <div class="absolute-bottom text-center bg-transparent">
              <q-btn
                flat
                round
                dense
                color="white"
                icon="zoom_in"
                @click="previewImage(pic)"
              />
            </div>
          </q-img>
        </div>
      </template>

      <!-- 上传按钮 -->
      <div class="col-4 col-sm-3" v-if="modelValue.length < maxFiles">
        <q-file
          v-model="uploadFile"
          accept="image/*"
          style="display: none"
          @update:model-value="handleFileUpload"
          ref="fileInput"
          :multiple="true"
          :max-files="maxFiles - modelValue.length"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
        <div
          class="upload-box flex flex-center"
          style="height: 100px; border: 1px dashed #ddd; cursor: pointer"
          @click="() => fileInput?.pickFiles()"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <div class="text-center">
            <q-icon name="add_photo_alternate" size="32px" color="grey" />
            <div class="text-caption q-mt-sm text-grey">
              {{ t('common.uploadImage') }}
              <br>
              {{ modelValue.length }}/{{ maxFiles }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览对话框 -->
    <q-dialog v-model="previewDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t('common.preview') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-img :src="getImageUrl(previewUrl)" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { api } from '@/utils/axios'

const { t } = useI18n()
const $q = useQuasar()
const fileInput = ref<any>(null)
const uploadFile = ref(null)
const previewDialog = ref(false)
const previewUrl = ref('')

const props = withDefaults(defineProps<{
  modelValue: string[]
  maxFiles?: number
}>(), {
  maxFiles: 6
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

// 处理文件上传
const handleFileUpload = async (files: FileList | null) => {
  if (!files) return

  try {
    // 检查文件大小和类型
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxSize) {
        $q.notify({
          type: 'warning',
          message: t('common.fileTooLarge', { size: '5MB' })
        })
        return false
      }
      if (!allowedTypes.includes(file.type)) {
        $q.notify({
          type: 'warning',
          message: t('common.invalidFileType')
        })
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // 显示上传进度
    $q.loading.show({
      message: t('common.uploading')
    })

    const uploads = validFiles.map(async (file) => {
      // 创建 FormData 对象
      const formData = new FormData()
      
      // 确保使用正确的字段名
      formData.append('file', file, file.name)

      // 设置请求头
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }

      try {
        const response = await api.post('/common/uploadImage', formData, config)
        const { code, data, msg } = response.data

        if (code === 200) {
          return data.sourceUrl
        } else {
          throw new Error(msg || t('common.uploadFailed'))
        }
      } catch (error) {
        console.error('Upload failed for file:', file.name, error)
        throw error
      }
    })

    const results = await Promise.all(uploads)
    
    // 过滤掉失败的上传
    const successfulUploads = results.filter(url => url)
    
    if (successfulUploads.length > 0) {
      emit('update:modelValue', [...props.modelValue, ...successfulUploads])
      
      $q.notify({
        type: 'positive',
        message: t('common.uploadSuccess', { count: successfulUploads.length })
      })
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('common.uploadFailed')
    })
  } finally {
    uploadFile.value = null
    $q.loading.hide()
  }
}

// 处理拖放上传
const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    // 检查是否超过最大文件数
    if (props.modelValue.length + files.length > props.maxFiles) {
      $q.notify({
        type: 'warning',
        message: t('common.tooManyFiles', { max: props.maxFiles })
      })
      return
    }
    handleFileUpload(files)
  }
}

// 移除图片
const removePicture = (index: number) => {
  const newPictures = [...props.modelValue]
  newPictures.splice(index, 1)
  emit('update:modelValue', newPictures)
}

// 预览图片
const previewImage = (url: string) => {
  previewUrl.value = url
  previewDialog.value = true
}
</script>

<style lang="scss" scoped>
.upload-box {
  border: 1px dashed #ddd;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--q-primary);
    color: var(--q-primary);
  }
}

.image-uploader {
  .q-img {
    border-radius: 4px;
    overflow: hidden;
  }
}
</style> 