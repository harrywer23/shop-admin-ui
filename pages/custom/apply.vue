<template>
  <div class="custom-apply-page">
    <div class="page-container">
      <h1 class="text-h5 q-mb-lg">{{ t('custom.apply.title') }}</h1>

      <!-- 申请表单 -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('custom.apply.formTitle') }}</div>
          <q-form @submit="submitApplication" class="q-gutter-md">
            <!-- 基本信息 -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.name"
                  :label="t('custom.apply.name')"
                  filled
                  :rules="[val => !!val || t('custom.apply.error.nameRequired')]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.contact"
                  :label="t('custom.apply.contact')"
                  filled
                  :rules="[val => !!val || t('custom.apply.error.contactRequired')]"
                />
              </div>
            </div>

            <!-- 定制类型 -->
            <q-select
              v-model="formData.type"
              :options="customTypes"
              :label="t('custom.apply.form.type')"
              filled
              :rules="[val => !!val || t('custom.apply.error.typeRequired')]"
              emit-value
              map-options
            />

            <!-- 需求描述 -->
            <div class="q-mb-lg">
              <div class="text-subtitle2 q-mb-sm">{{ t('custom.apply.form.description') }}</div>
              <TinyMce
                v-model="formData.requirements"
                :init="{
                  height: 400,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount'
                  ],
                  toolbar: `
                    undo redo | formatselect | bold italic backcolor | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | removeformat | help
                  `,
                  content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }'
                }"
                :disabled="submitting"
                @change="handleEditorChange"
              />
              <div v-if="formErrors.requirements" class="text-negative text-caption">
                {{ t('custom.apply.form.descriptionRequired') }}
              </div>
            </div>

            <!-- 预算范围 -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="formData.budgetMin"
                  type="number"
                  :label="t('custom.apply.budgetMin')"
                  filled
                  :rules="[
                    val => val > 0 || t('custom.apply.error.invalidBudget'),
                    val => !formData.budgetMax || val <= formData.budgetMax || t('custom.apply.error.budgetRange')
                  ]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="formData.budgetMax"
                  type="number"
                  :label="t('custom.apply.budgetMax')"
                  filled
                  :rules="[
                    val => val > 0 || t('custom.apply.error.invalidBudget'),
                    val => !formData.budgetMin || val >= formData.budgetMin || t('custom.apply.error.budgetRange')
                  ]"
                />
              </div>
            </div>

            <!-- 期望完成时间 -->
            <q-input
              v-model="formData.expectedDeliveryDate"
              :label="t('custom.apply.expectedDeliveryDate')"
              filled
              mask="date"
              :rules="['date']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="formData.expectedDeliveryDate" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <!-- 参考图片上传部分 -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">{{ t('custom.apply.referenceImages') }}</div>
              
              <!-- 图片上传区域 -->
              <div class="upload-section q-mb-md">
                <q-file
                  v-model="formData.referenceImages"
                  :label="t('custom.apply.uploadImages')"
                  filled
                  multiple
                  accept="image/*"
                  max-files="6"
                  @rejected="onFileRejected"
                  @update:model-value="handleFileSelect"
                  style="max-width: 400px"
                >
                  <template v-slot:prepend>
                    <q-icon name="add_photo_alternate" />
                  </template>
                  <template v-slot:append v-if="formData.referenceImages.length">
                    <q-icon name="close" class="cursor-pointer" @click.stop="clearFiles" />
                  </template>
                </q-file>
                
                <div class="text-caption text-grey q-mt-sm">
                  {{ t('custom.apply.imageNote') }}
                </div>
              </div>

              <!-- 图片预览区域 -->
              <div v-if="imagePreviewUrls.length" class="row q-col-gutter-md q-mb-lg">
                <div
                  v-for="(url, index) in imagePreviewUrls"
                  :key="index"
                  class="col-4 col-sm-3 col-md-2"
                >
                  <div class="image-preview-card">
                    <q-img
                      :src="url"
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
                          size="sm"
                          @click="removeImage(index)"
                        >
                          <q-tooltip>{{ t('common.delete') }}</q-tooltip>
                        </q-btn>
                      </div>
                    </q-img>
                  </div>
                </div>
              </div>

              <!-- 附件上传区域 -->
              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">{{ t('custom.apply.attachments') }}</div>
                <q-file
                  v-model="formData.attachments"
                  :label="t('custom.apply.uploadAttachment')"
                  filled
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  max-files="5"
                  @rejected="onFileRejected"
                  style="max-width: 400px"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:append v-if="formData.attachments.length">
                    <q-icon name="close" class="cursor-pointer" @click.stop="clearAttachments" />
                  </template>
                </q-file>

                <!-- 附件列表 -->
                <div v-if="formData.attachments.length" class="attachment-list q-mt-sm">
                  <q-list bordered separator>
                    <q-item v-for="(file, index) in formData.attachments" :key="index">
                      <q-item-section avatar>
                        <q-icon :name="getFileIcon(file.type)" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ file.name }}</q-item-label>
                        <q-item-label caption>{{ formatFileSize(file.size) }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
                          icon="delete"
                          @click="removeAttachment(index)"
                        >
                          <q-tooltip>{{ t('common.delete') }}</q-tooltip>
                        </q-btn>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </div>

            <!-- 其他要求 -->
            <q-input
              v-model="formData.additionalRequirements"
              type="textarea"
              :label="t('custom.apply.additionalRequirements')"
              filled
              rows="3"
            />

            <!-- 申请类型选择 -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">{{ t('custom.apply.form.applicationType') }}</div>
              <q-btn-toggle
                v-model="formData.applicationType"
                :options="[
                  { label: t('custom.apply.form.personalApplication'), value: 'personal' },
                  { label: t('custom.apply.form.crowdfundingApplication'), value: 'crowdfunding' }
                ]"
                spread
                class="full-width"
                @update:model-value="handleApplicationTypeChange"
              />
            </div>

            <!-- 众筹特有字段 - 仅在选择众筹申请时显示 -->
            <template v-if="formData.applicationType === 'crowdfunding'">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="formData.targetAmount"
                    type="number"
                    :label="t('custom.apply.form.targetAmount')"
                    filled
                    :rules="[
                      val => val > 0 || t('custom.apply.error.invalidTargetAmount'),
                      val => val >= 1000 || t('custom.apply.error.minTargetAmount')
                    ]"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="formData.minSupportAmount"
                    type="number"
                    :label="t('custom.apply.form.minSupportAmount')"
                    filled
                    :rules="[
                      val => val > 0 || t('custom.apply.error.invalidMinSupportAmount'),
                      val => val <= formData.targetAmount || t('custom.apply.error.exceedTargetAmount')
                    ]"
                  />
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.startTime"
                    :label="t('custom.apply.form.startTime')"
                    filled
                    type="datetime-local"
                    :rules="[val => !!val || t('custom.apply.error.startTimeRequired')]"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.endTime"
                    :label="t('custom.apply.form.endTime')"
                    filled
                    type="datetime-local"
                    :rules="[
                      val => !!val || t('custom.apply.error.endTimeRequired'),
                      val => !formData.startTime || new Date(val) > new Date(formData.startTime) || t('custom.apply.error.invalidEndTime')
                    ]"
                  />
                </div>
              </div>

              <!-- 回报设置 -->
              <div class="rewards-section q-mb-lg">
                <div class="text-subtitle2 q-mb-sm">{{ t('custom.apply.form.rewards') }}</div>
                <div v-for="(reward, index) in formData.rewards" :key="index" class="reward-item q-pa-md q-mb-md bg-grey-2">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="reward.title"
                        :label="t('custom.apply.form.rewardTitle')"
                        filled
                        :rules="[val => !!val || t('custom.apply.error.rewardTitleRequired')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="reward.amount"
                        type="number"
                        :label="t('custom.apply.form.rewardAmount')"
                        filled
                        :rules="[val => val > 0 || t('custom.apply.error.invalidRewardAmount')]"
                      />
                    </div>
                    <div class="col-12">
                      <div class="text-subtitle2 q-mb-sm">{{ t('custom.apply.form.rewardDescription') }}</div>
                      <TinyMce
                        v-model="reward.description"
                        :init="{
                          height: 200,
                          menubar: false,
                          plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
                            'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'table', 'help', 'wordcount'
                          ],
                          toolbar: `
                            undo redo | formatselect | bold italic | \
                            alignleft aligncenter alignright | \
                            bullist numlist | removeformat | help
                          `,
                          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
                          placeholder: t('custom.apply.form.rewardDescriptionPlaceholder')
                        }"
                        :disabled="submitting"
                        @change="(content) => handleRewardDescriptionChange(index, content)"
                      />
                      <div v-if="rewardErrors[index]?.description" class="text-negative text-caption">
                        {{ t('custom.apply.error.rewardDescriptionRequired') }}
                      </div>
                    </div>
                  </div>
                  <div class="row justify-end q-mt-sm">
                    <q-btn
                      flat
                      color="negative"
                      :label="t('common.delete')"
                      @click="removeReward(index)"
                    />
                  </div>
                </div>
                <q-btn
                  outline
                  color="primary"
                  :label="t('custom.apply.form.addReward')"
                  @click="addReward"
                />
              </div>
            </template>

            <!-- 提交按钮 -->
            <div class="row justify-end q-mt-lg">
              <q-btn
                type="submit"
                color="primary"
                :label="t('custom.apply.submit')"
                :loading="submitting"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- 申请进度 -->
      <q-card flat bordered v-if="applicationId">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('custom.apply.progress') }}</div>
          <q-timeline color="primary">
            <q-timeline-entry
              v-for="(progress, index) in progressList"
              :key="index"
              :title="progress.title"
              :subtitle="formatDate(progress.time)"
              :color="progress.color"
            >
              <div>{{ progress.description }}</div>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>
      </q-card>
    </div>

    <!-- 文件上传错误提示 -->
    <q-dialog v-model="showFileError">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t('custom.apply.error.uploadFailed') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ fileErrorMessage }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.ok')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/axios'
import { useQuasar } from 'quasar'
import { date } from 'quasar'
import TinyMce from '~/components/tiny-mce/index.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()

interface FormData {
  name: string
  contact: string
  type: string
  requirements: string
  budgetMin: number
  budgetMax: number
  expectedDeliveryDate: string
  referenceImages: File[]
  attachments: File[]
  additionalRequirements: string
  applicationType: string
  targetAmount: number | null
  minSupportAmount: number | null
  startTime: string
  endTime: string
  rewards: Array<{
    title: string
    amount: number
    description: string
  }>
}

interface Progress {
  title: string
  time: string
  description: string
  color: string
}

const formData = ref<FormData>({
  name: '',
  contact: '',
  type: '',
  requirements: '',
  budgetMin: 0,
  budgetMax: 0,
  expectedDeliveryDate: '',
  referenceImages: [],
  attachments: [],
  additionalRequirements: '',
  applicationType: 'personal',
  targetAmount: null,
  minSupportAmount: null,
  startTime: '',
  endTime: '',
  rewards: []
})

const submitting = ref(false)
const showFileError = ref(false)
const fileErrorMessage = ref('')
const applicationId = ref('')
const progressList = ref<Progress[]>([])

// 定制类型选项
const customTypes = [
  { label: t('custom.type.clothing'), value: 'clothing' },
  { label: t('custom.type.jewelry'), value: 'jewelry' },
  { label: t('custom.type.furniture'), value: 'furniture' },
  { label: t('custom.type.artwork'), value: 'artwork' },
  { label: t('custom.type.other'), value: 'other' }
]

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 文件上传错误处理
const onFileRejected = (rejectedEntries: any[]) => {
  showFileError.value = true
  fileErrorMessage.value = rejectedEntries
    .map(entry => {
      if (entry.failedPropValidation === 'max-files') {
        return t('custom.apply.error.tooManyFiles')
      }
      if (entry.failedPropValidation === 'accept') {
        return t('custom.apply.error.invalidFileType')
      }
      return entry.file.name + ': ' + entry.failedPropValidation
    })
    .join('\n')
}

// 新增图片预览URL数组
const imagePreviewUrls = ref<string[]>([])

// 处理文件选择
const handleFileSelect = async (files: File[]) => {
  // 清除旧的预览URL
  imagePreviewUrls.value.forEach(url => URL.revokeObjectURL(url))
  imagePreviewUrls.value = []

  // 为每个文件创建预览URL
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      // 压缩图片
      try {
        const compressedFile = await compressImage(file)
        const url = URL.createObjectURL(compressedFile)
        imagePreviewUrls.value.push(url)
      } catch (error) {
        console.error('图片压缩失败:', error)
        const url = URL.createObjectURL(file)
        imagePreviewUrls.value.push(url)
      }
    }
  }
}

// 压缩图片
const compressImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // 设置最大尺寸
        const maxSize = 1200
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          } else {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          'image/jpeg',
          0.8
        )
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 移除图片
const removeImage = (index: number) => {
  URL.revokeObjectURL(imagePreviewUrls.value[index])
  imagePreviewUrls.value.splice(index, 1)
  const files = [...formData.value.referenceImages]
  files.splice(index, 1)
  formData.value.referenceImages = files
}

// 清除所有图片
const clearFiles = () => {
  imagePreviewUrls.value.forEach(url => URL.revokeObjectURL(url))
  imagePreviewUrls.value = []
  formData.value.referenceImages = []
}

// 移除附件
const removeAttachment = (index: number) => {
  const files = [...formData.value.attachments]
  files.splice(index, 1)
  formData.value.attachments = files
}

// 清除所有附件
const clearAttachments = () => {
  formData.value.attachments = []
}

// 获取文件图标
const getFileIcon = (fileType: string) => {
  const iconMap: Record<string, string> = {
    'application/pdf': 'picture_as_pdf',
    'application/msword': 'description',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'description',
    'application/vnd.ms-excel': 'table_chart',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'table_chart'
  }
  return iconMap[fileType] || 'insert_drive_file'
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理申请类型变更
const handleApplicationTypeChange = () => {
  if (formData.value.applicationType === 'personal') {
    // 切换到个人申请时清空众筹相关字段
    formData.value.targetAmount = null
    formData.value.minSupportAmount = null
    formData.value.startTime = ''
    formData.value.endTime = ''
    formData.value.rewards = []
  }
}

// 添加回报选项
const addReward = () => {
  formData.value.rewards.push({
    title: '',
    amount: 0,
    description: ''
  })
  // 同时添加对应的错误状态对象
  rewardErrors.value.push({
    description: false
  })
}

// 移除回报选项
const removeReward = (index: number) => {
  formData.value.rewards.splice(index, 1)
  rewardErrors.value.splice(index, 1)
}

// 表单错误
const formErrors = ref({
  requirements: false,
  // ... 其他错误字段
})

// 处理编辑器内容变化
const handleEditorChange = (content: string) => {
  formData.value.requirements = content
  // 清除错误提示
  if (content) {
    formErrors.value.requirements = false
  }
}

// 表单验证
const validateForm = () => {
  let isValid = true

  // 验证富文本内容
  if (!formData.value.requirements.trim()) {
    formErrors.value.requirements = true
    isValid = false
  }

  // 验证众筹回报描述
  if (formData.value.applicationType === 'crowdfunding') {
    formData.value.rewards.forEach((reward, index) => {
      if (!reward.description.trim()) {
        if (!rewardErrors.value[index]) {
          rewardErrors.value[index] = {}
        }
        rewardErrors.value[index].description = true
        isValid = false
      }
    })
  }

  // ... 其他验证逻辑保持不变 ...

  return isValid
}

// 提交申请
const submitApplication = async () => {
  if (!validateForm()) {
    $q.notify({
      type: 'negative',
      message: t('custom.apply.error.formInvalid')
    })
    return
  }

  try {
    submitting.value = true
    
    // 上传图片
    const imageUrls = []
    if (formData.value.referenceImages.length > 0) {
      const uploadFormData = new FormData()
      for (const file of formData.value.referenceImages) {
        uploadFormData.append('files', file)
      }
      const uploadResponse = await api.post('/upload/images', uploadFormData)
      if (uploadResponse.data.code === 200) {
        imageUrls.push(...uploadResponse.data.data)
      }
    }

    // 提交申请
    const response = await api.post('/custom/apply', {
      ...formData.value,
      referenceImages: imageUrls
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('custom.apply.success')
      })
      router.push('/user/custom')
    }
  } catch (error) {
    console.error('提交申请失败:', error)
    $q.notify({
      type: 'negative',
      message: t('custom.apply.error.submitFailed')
    })
  } finally {
    submitting.value = false
  }
}

// 加载申请进度
const loadProgress = async () => {
  try {
    const response = await api.get(`/custom/progress/${applicationId.value}`)
    if (response.data.code === 200) {
      progressList.value = response.data.data
    }
  } catch (error) {
    console.error('获取进度失败:', error)
  }
}

// 如果有applicationId参数,加载进度
onMounted(() => {
  const id = route.query.id
  if (id) {
    applicationId.value = id as string
    loadProgress()
  }
})

// 组件卸载时清理预览URL
onUnmounted(() => {
  imagePreviewUrls.value.forEach(url => URL.revokeObjectURL(url))
})

// 清理编辑器实例
onBeforeUnmount(() => {
  // TinyMCE 会自动清理实例
})

// 回报错误状态
const rewardErrors = ref<Array<{description?: boolean}>>([])

// 处理回报描述变化
const handleRewardDescriptionChange = (index: number, content: string) => {
  formData.value.rewards[index].description = content
  // 清除错误提示
  if (content && rewardErrors.value[index]) {
    rewardErrors.value[index].description = false
  }
}
</script>

<style lang="scss" scoped>
.custom-apply-page {
  padding: 20px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .image-preview-card {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .attachment-list {
    max-width: 600px;
  }

  .reward-item {
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: #e0e0e0;
    }
  }
}

// 富文本编辑器样式调整
:deep(.tox-tinymce) {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

:deep(.tox-toolbar__primary) {
  background: none !important;
}

:deep(.tox .tox-edit-area__iframe) {
  background: #fff;
}

// 回报编辑器样式调整
.reward-item {
  :deep(.tox-tinymce) {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    margin-bottom: 8px;
  }

  :deep(.tox-toolbar__primary) {
    background: none !important;
  }

  :deep(.tox .tox-edit-area__iframe) {
    background: #fff;
  }
}
</style>
