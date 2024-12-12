<template>
  <div class="topic-edit-page">
    <div class="page-container">
      <h1 class="text-h5 q-mb-lg">{{ $t('forum.topic.edit.pageTitle') }}</h1>

      <q-card flat bordered>
        <q-card-section>
          <!-- 分类选择 -->
          <div class="category-select q-mb-lg">
            <div class="text-subtitle1 q-mb-sm">{{ $t('forum.topic.create.selectCategory') }}</div>
            <div class="selected-path text-grey q-mb-sm" v-if="selectedPath.length">
              {{ $t('forum.topic.create.selectedPath') }}: {{ selectedPath.join(' > ') }}
            </div>
            <q-tree
              v-model:selected="selectedCategory"
              :nodes="categoryTree"
              node-key="id"
              label-key="label"
              default-expand-all
              @update:selected="handleCategorySelect"
            />
          </div>

          <!-- 主题表单 -->
          <q-form @submit="updateTopic" class="topic-form">
            <!-- 标题 -->
            <q-input
              v-model="formData.title"
              :label="$t('forum.topic.create.topicTitle')"
              filled
              :rules="[
                val => !!val || $t('forum.topic.create.titleRequired'),
                val => val.length >= 5 || $t('forum.topic.create.titleMinLength'),
                val => val.length <= 100 || $t('forum.topic.create.titleMaxLength')
              ]"
              class="q-mb-md"
            />

            <!-- 内容编辑器 -->
            <div class="q-mb-lg">
              <div class="text-subtitle1 q-mb-sm">{{ $t('forum.topic.create.content') }}</div>
              <Editor
                v-model="formData.content"
                :api-key="editorApiKey"
                :init="editorInit"
                :rules="[val => !!val || $t('forum.topic.create.contentRequired')]"
              />
            </div>

            <!-- 附件上传 -->
            <div class="attachments q-mb-lg">
              <div class="text-subtitle1 q-mb-sm">{{ $t('forum.topic.create.attachments') }}</div>
              <q-file
                v-model="formData.attachments"
                :label="$t('forum.topic.create.uploadAttachment')"
                filled
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                @rejected="onFileRejected"
                style="max-width: 400px"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>

              <!-- 已上传的附件列表 -->
              <div v-if="existingAttachments.length" class="existing-attachments q-mt-md">
                <q-list bordered separator>
                  <q-item v-for="file in existingAttachments" :key="file.id">
                    <q-item-section avatar>
                      <q-icon :name="getFileIcon(file.fileType)" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ file.fileName }}</q-item-label>
                      <q-item-label caption>{{ formatFileSize(file.fileSize) }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        @click="removeExistingFile(file)"
                      >
                        <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="row justify-end q-gutter-sm">
              <q-btn
                flat
                :label="$t('common.cancel')"
                color="grey"
                @click="router.back()"
              />
              <q-btn
                type="submit"
                color="primary"
                :label="$t('common.save')"
                :loading="submitting"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>

    <!-- 文件上传错误提示 -->
    <q-dialog v-model="showFileError">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('forum.topic.create.fileRejected') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ fileErrorMessage }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.ok')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'
import { useI18n } from 'vue-i18n'
import Editor from '@tinymce/tinymce-vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

// 状态变量
const formData = ref({
  title: '',
  content: '',
  categoryId: '',
  attachments: []
})

const categoryTree = ref([])
const selectedCategory = ref(null)
const selectedPath = ref([])
const submitting = ref(false)
const showFileError = ref(false)
const fileErrorMessage = ref('')
const existingAttachments = ref([])
const topicId = ref(route.params.id)

// TinyMCE 编辑器配置
const editorApiKey = 'your-api-key'
const editorInit = {
  height: 400,
  menubar: false,
  plugins: [
    'advlist autolink lists link image charmap print preview anchor',
    'searchreplace visualblocks code fullscreen',
    'insertdatetime media table paste code help wordcount'
  ],
  toolbar: 'undo redo | formatselect | bold italic backcolor | \
    alignleft aligncenter alignright alignjustify | \
    bullist numlist outdent indent | removeformat | help'
}

// 加载主题数据
const loadTopicData = async () => {
  try {
    const response = await api.get(`/forum/topic/detail/${topicId.value}`)
    if (response.data.code === 200) {
      const topicData = response.data.data
      formData.value.title = topicData.title
      formData.value.content = topicData.content
      formData.value.categoryId = topicData.categoryId
      selectedCategory.value = topicData.categoryId
      existingAttachments.value = topicData.attachments || []
      
      // 设置分类路径
      await loadCategories()
      updateSelectedPath(topicData.categoryId)
    }
  } catch (error) {
    console.error('加载主题数据失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.error.loadTopicFailed')
    })
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await api.get('/forum/category/list')
    if (response.data.code === 200) {
      const processedData = response.data.data.map(item => ({
        ...item,
        label: getCurrentLanguageName(item),
        children: []
      }))
      categoryTree.value = buildCategoryTree(processedData)
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.topic.create.loadCategoriesFailed')
    })
  }
}

// 构建分类树
const buildCategoryTree = (flatData) => {
  const tree = []
  const map = {}

  flatData.forEach(item => {
    map[item.id] = item
  })

  flatData.forEach(item => {
    if (item.parentId === 0) {
      tree.push(item)
    } else {
      const parent = map[item.parentId]
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(item)
      }
    }
  })

  return tree
}

// 获取当前语言的分类名称
const getCurrentLanguageName = (category) => {
  if (!category?.translations) return category?.name || ''
  const translations = typeof category.translations === 'string' 
    ? JSON.parse(category.translations) 
    : category.translations

  const lang = locale.value
  switch (lang) {
    case 'en': return translations.en || translations.zh
    case 'zh-TW': return translations.zhTw || translations.zh
    case 'ja': return translations.ja || translations.zh
    case 'ko': return translations.ko || translations.zh
    default: return translations.zh
  }
}

// 处理分类选择
const handleCategorySelect = (categoryId) => {
  formData.value.categoryId = categoryId
  updateSelectedPath(categoryId)
}

// 更新选中的分类路径
const updateSelectedPath = (categoryId) => {
  const path = []
  const findPath = (categories, targetId) => {
    for (const category of categories) {
      if (category.id === targetId) {
        path.push(getCurrentLanguageName(category))
        return true
      }
      if (category.children?.length) {
        if (findPath(category.children, targetId)) {
          path.unshift(getCurrentLanguageName(category))
          return true
        }
      }
    }
    return false
  }
  findPath(categoryTree.value, categoryId)
  selectedPath.value = path
}

// 更新主题
const updateTopic = async () => {
  if (!formData.value.categoryId) {
    $q.notify({
      type: 'warning',
      message: t('forum.topic.create.categoryRequired')
    })
    return
  }

  try {
    submitting.value = true

    // 上传新附件
    const attachmentIds = [...existingAttachments.value.map(file => file.id)]
    if (formData.value.attachments.length) {
      const formDataObj = new FormData()
      formData.value.attachments.forEach(file => {
        formDataObj.append('files', file)
      })
      const uploadResponse = await api.post('/forum/attachment/upload', formDataObj)
      if (uploadResponse.data.code === 200) {
        attachmentIds.push(...uploadResponse.data.data)
      }
    }

    // 更新主题
    const response = await api.put(`/forum/topic/${topicId.value}`, {
      title: formData.value.title,
      content: formData.value.content,
      categoryId: formData.value.categoryId,
      attachmentIds
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('forum.topic.edit.success')
      })
      router.push(`/forum/topic/${topicId.value}`)
    }
  } catch (error) {
    console.error('更新主题失���:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.topic.edit.failed')
    })
  } finally {
    submitting.value = false
  }
}

// 处理文件上传被拒绝
const onFileRejected = (rejectedEntries) => {
  showFileError.value = true
  fileErrorMessage.value = rejectedEntries
    .map(entry => entry.file.name + ': ' + entry.failedPropValidation)
    .join('\n')
}

// 移除已有附件
const removeExistingFile = async (file) => {
  try {
    const response = await api.delete(`/forum/attachment/${file.id}`)
    if (response.data.code === 200) {
      existingAttachments.value = existingAttachments.value.filter(f => f.id !== file.id)
      $q.notify({
        type: 'positive',
        message: t('forum.topic.edit.attachmentRemoved')
      })
    }
  } catch (error) {
    console.error('删除附件失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.topic.edit.attachmentRemoveFailed')
    })
  }
}

// 获取文件图标
const getFileIcon = (fileType) => {
  const iconMap = {
    'image': 'image',
    'pdf': 'picture_as_pdf',
    'word': 'description',
    'excel': 'table_chart',
    'zip': 'folder_zip'
  }
  return iconMap[fileType] || 'insert_drive_file'
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 初始化
onMounted(() => {
  loadTopicData()
})
</script>

<style lang="scss" scoped>
.topic-edit-page {
  padding: 20px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .category-select {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
  }

  .selected-path {
    padding: 8px;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .topic-form {
    .editor-container {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
  }

  .existing-attachments {
    max-width: 600px;
  }
}
</style> 