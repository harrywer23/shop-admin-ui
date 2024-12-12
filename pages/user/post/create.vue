<template>
  <div class="user-post-create">
    <div class="page-header">
      <h1 class="text-h5">发布动态</h1>
    </div>

    <q-form @submit="handleSubmit" class="q-mt-md">
      <!-- 标题输入 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <q-input
            v-model="formData.title"
            label="标题"
            :rules="[
              val => !!val || '请输入标题',
              val => val.length >= 5 || '标题至少5个字符',
              val => val.length <= 100 || '标题最多100个字符'
            ]"
            outlined
            counter
            maxlength="100"
          />
        </q-card-section>
      </q-card>

      <!-- 内容编辑器 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">内容</div>
          <q-editor
            v-model="formData.content"
            :rules="[val => !!val || '请输入内容']"
            min-height="300px"
            :toolbar="[
              ['bold', 'italic', 'strike', 'underline'],
              ['token', 'hr', 'link'],
              [{
                label: $q.lang.editor.formatting,
                icon: $q.iconSet.editor.formatting,
                list: 'no-icons',
                options: ['p', 'h2', 'h3', 'h4', 'h5', 'h6']
              }],
              ['quote', 'unordered', 'ordered'],
              ['undo', 'redo']
            ]"
          />
        </q-card-section>
      </q-card>

      <!-- 图片上传 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">图片上传</div>
          <div class="row q-col-gutter-sm">
            <div
              v-for="(image, index) in images"
              :key="index"
              class="col-4 col-sm-3 col-md-2"
            >
              <q-img
                :src="image.url"
                :ratio="1"
                class="rounded-borders"
              >
                <div class="absolute-top-right q-pa-xs">
                  <q-btn
                    round
                    flat
                    dense
                    color="negative"
                    icon="close"
                    @click="removeImage(index)"
                  >
                    <q-tooltip>删除</q-tooltip>
                  </q-btn>
                </div>
              </q-img>
            </div>

            <!-- 上传按钮 -->
            <div class="col-4 col-sm-3 col-md-2">
              <q-file
                v-model="imageFile"
                accept="image/*"
                style="display: none"
                @update:model-value="onImageSelected"
                ref="imageInput"
              />
              <div
                class="upload-box flex flex-center cursor-pointer"
                style="height: 100%; min-height: 120px; border: 2px dashed #ddd"
                @click="$refs.imageInput.pickFiles()"
              >
                <q-icon name="add" size="40px" color="grey-6" />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 附件上传 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">附件上传</div>
          <q-file
            v-model="attachments"
            label="选择文件"
            outlined
            multiple
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip"
            :max-files="5"
            :max-file-size="10485760"
            @rejected="onFileRejected"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          
          <!-- 已上传文件列表 -->
          <div v-if="attachments.length" class="q-mt-md">
            <q-list bordered separator>
              <q-item v-for="(file, index) in attachments" :key="index">
                <q-item-section>
                  <q-item-label>{{ file.name }}</q-item-label>
                  <q-item-label caption>
                    {{ formatFileSize(file.size) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="close"
                    @click="removeFile(index)"
                  >
                    <q-tooltip>移除</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
      </q-card>

      <!-- 提交按钮 -->
      <div class="row justify-end q-mt-md">
        <q-btn
          flat
          color="primary"
          label="取消"
          class="q-mr-sm"
          @click="router.back()"
        />
        <q-btn
          color="primary"
          :label="submitting ? '发布中...' : '发布'"
          type="submit"
          :loading="submitting"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'

const router = useRouter()
const $q = useQuasar()

// 状态变量
const images = ref<Array<{url: string, file: File}>>([])
const imageFile = ref<File | null>(null)
const attachments = ref([])
const submitting = ref(false)

// 表单数据
const formData = ref({
  title: '',
  content: ''
})

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理图片选择
const onImageSelected = async (file: File) => {
  if (!file) return

  try {
    // 创建预览URL
    const url = URL.createObjectURL(file)
    images.value.push({
      url,
      file
    })
    imageFile.value = null
  } catch (error) {
    console.error('处理图片失败:', error)
    $q.notify({
      type: 'negative',
      message: '处理图片失败'
    })
  }
}

// 移除图片
const removeImage = (index: number) => {
  URL.revokeObjectURL(images.value[index].url)
  images.value.splice(index, 1)
}

// 文件上传被拒绝
const onFileRejected = (rejectedEntries: any[]) => {
  rejectedEntries.forEach(entry => {
    let message = ''
    if (entry.failedPropValidation === 'max-files') {
      message = '最多只能上传5个文件'
    } else if (entry.failedPropValidation === 'max-file-size') {
      message = '文件大小不能超过10MB'
    } else {
      message = '不支持的文件类型'
    }
    $q.notify({
      type: 'negative',
      message
    })
  })
}

// 移除文件
const removeFile = (index: number) => {
  attachments.value.splice(index, 1)
}

// 上传图片
const uploadImages = async () => {
  if (!images.value.length) return []

  const formData = new FormData()
  images.value.forEach(image => {
    formData.append('images', image.file)
  })

  try {
    const response = await api.post('/user/post/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    const { code, data } = response.data
    if (code === 200) {
      return data // 返回上传后的图片信息数组
    }
    throw new Error('上传图片失败')
  } catch (error) {
    console.error('上传图片失败:', error)
    throw error
  }
}

// 上传附件
const uploadAttachments = async () => {
  if (!attachments.value.length) return []

  const formData = new FormData()
  attachments.value.forEach(file => {
    formData.append('files', file)
  })

  try {
    const response = await api.post('/user/post/upload/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    const { code, data } = response.data
    if (code === 200) {
      return data // 返回上传后的文件信息数组
    }
    throw new Error('上传附件失败')
  } catch (error) {
    console.error('上传附件失败:', error)
    throw error
  }
}

// 提交表单
const handleSubmit = async () => {
  submitting.value = true
  try {
    // 先上传图片和附件
    const [imageUrls, attachmentIds] = await Promise.all([
      uploadImages(),
      uploadAttachments()
    ])

    // 发布帖子
    const response = await api.post('/user/post', {
      ...formData.value,
      images: imageUrls,
      attachments: attachmentIds
    })

    const { code, data, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '发布成功'
      })
      router.push(`/user/post/${data.id}`)
    } else {
      throw new Error(msg || '发布失败')
    }
  } catch (error) {
    console.error('发布帖子失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '发布失败'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.user-post-create {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
  }

  :deep(.q-editor) {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
  }

  .upload-box {
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--q-primary);
      background: #f5f5f5;
    }
  }
}
</style> 