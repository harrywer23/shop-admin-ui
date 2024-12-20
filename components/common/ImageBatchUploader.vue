<template>
  <div class="image-uploader">
    <!-- 已上传图片列表 -->
    <div class="image-grid" v-if="modelValue.length">
      <div
          v-for="(img, index) in modelValue"
          :key="index"
          class="image-item"
      >
        <q-img :src="getImageUrl(img.url)" :ratio="1">
          <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
            <q-btn-group spread flat>
              <q-btn
                  color="negative"
                  icon="delete"
                  flat
                  dense
                  @click="removeImage(index)"
              >
                <q-tooltip>删除</q-tooltip>
              </q-btn>
              <q-btn
                  color="primary"
                  icon="visibility"
                  flat
                  dense
                  @click="previewImage(img.url)"
              >
                <q-tooltip>预览</q-tooltip>
              </q-btn>
            </q-btn-group>
          </div>
        </q-img>
      </div>
    </div>

    <!-- 上传按钮 -->
    <div class="upload-trigger" @click="triggerUpload">
      <q-icon name="add_photo_alternate" size="48px" color="grey-6" />
      <div class="upload-text">
        <div>点击上传图片</div>
        <div class="text-caption text-grey">{{ hint }}</div>
      </div>
    </div>

    <!-- 隐藏的文件输入框 -->
    <q-file
        v-model="uploadFiles"
        :multiple="multiple"
        accept=".jpg,.jpeg,.png"
        style="display: none"
        @update:model-value="handleFileUpload"
        ref="fileInput"
    />

    <!-- 图片预览对话框 -->
    <q-dialog v-model="previewDialog">
      <q-card class="preview-card">
        <q-card-section class="row items-center">
          <div class="text-h6">图片预览</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-img :src="previewUrl" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
// 从配置中获取图片基础URL
const IMAGE_BASE_URL = config.public.imageBaseUrl || 'https://image.aiavr.uk/xinshijie'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  hint: {
    type: String,
    default: '支持jpg、png格式'
  },
  multiple: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error'])

const $q = useQuasar()
const fileInput = ref<any>(null)
const uploadFiles = ref<File[]>([])

// 预览相关
const previewDialog = ref(false)
const previewUrl = ref('')

// 触发文件选择
function triggerUpload() {
  fileInput.value.$el.querySelector('input').click()
}

// 处理文件上传
async function handleFileUpload(files: File[]) {
  if (!files.length) return

  try {
    const formData = new FormData()
    formData.append('file', files[0])

    const response = await api.post('/common/uploadImage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.code === 200 && response.data.succ) {
      const fileData = response.data.data
      const newImage = {
        url: fileData.sourceUrl,
        sourceUrl: fileData.sourceUrl,
        id: fileData.id,
        title: fileData.title,
        size: fileData.size,
        md5: fileData.md5
      }

      const updatedImages = props.multiple
          ? [...props.modelValue, newImage]
          : [newImage]

      emit('update:modelValue', updatedImages)
      emit('upload-success', newImage)

      $q.notify({
        type: 'positive',
        message: '图片上传成功'
      })
    } else {
      throw new Error(response.data.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    emit('upload-error', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '图片上传失败'
    })
  } finally {
    uploadFiles.value = []
  }
}

// 删除图片
function removeImage(index: number) {
  const newImages = [...props.modelValue]
  newImages.splice(index, 1)
  emit('update:modelValue', newImages)
}

// 预览图片
function previewImage(url: string) {
  previewUrl.value = url
  previewDialog.value = true
}
</script>

<style lang="scss" scoped>
.image-uploader {
  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;

    .image-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      &:hover {
        .absolute-bottom {
          opacity: 1;
        }
      }

      .absolute-bottom {
        opacity: 0;
        transition: opacity 0.3s;
        background: rgba(0,0,0,0.6) !important;
        padding: 8px;
      }
    }
  }

  .upload-trigger {
    width: 200px;
    height: 200px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: var(--primary-color);
      background: #f5f7fa;
    }

    .upload-text {
      margin-top: 16px;
      text-align: center;
    }
  }
}

.preview-card {
  width: 90vw;
  max-width: 800px;
}
</style>
