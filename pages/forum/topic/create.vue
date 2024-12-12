<template>
  <div class="topic-create-page">
    <div class="page-header">
      <h1 class="text-h5">{{ $t('forum.topic.create.title') }}</h1>
    </div>

    <q-form @submit="handleSubmit" class="q-mt-md">
      <!-- 分类选择 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">{{ $t('forum.topic.create.selectCategory') }}</div>
          <!-- 分类级联选择 -->
          <div class="category-cascade">
            <!-- 一级分类 -->
            <div class="category-level primary-level">
              <div class="level-title q-mb-sm">
                <q-icon name="category" class="q-mr-sm" />
                {{ $t('forum.topic.create.primaryCategory') }}
              </div>
              <div class="row q-gutter-md">
                <q-btn
                  v-for="cat in level1Categories"
                  :key="cat.value"
                  :label="cat.label"
                  :style="getCategoryStyle(selectedLevel1 === cat.value)"
                  class="category-btn primary-btn"
                  @click="selectedLevel1 = cat.value; handleLevel1Change(cat.value)"
                >
                  <q-icon
                    :name="selectedLevel1 === cat.value ? 'check_circle' : 'radio_button_unchecked'"
                    class="q-mr-sm"
                  />
                  {{ getCurrentLanguageName(cat.category) }}
                </q-btn>
              </div>
            </div>

            <!-- 二级分类 -->
            <div v-if="level2Categories.length" class="category-level secondary-level q-mt-lg">
              <div class="level-title q-mb-sm">二级分类</div>
              <div class="row q-gutter-sm">
                <q-btn
                  v-for="cat in level2Categories"
                  :key="cat.value"
                  :label="cat.label"
                  :color="selectedLevel2 === cat.value ? 'primary' : 'grey-3'"
                  :text-color="selectedLevel2 === cat.value ? 'white' : 'grey-8'"
                  :unelevated="selectedLevel2 === cat.value"
                  :flat="selectedLevel2 !== cat.value"
                  class="category-btn"
                  @click="selectedLevel2 = cat.value; handleLevel2Change(cat.value)"
                />
              </div>
            </div>

            <!-- 三级分类 -->
            <div v-if="level3Categories.length" class="category-level q-mt-sm">
              <div class="row q-gutter-sm">
                <q-btn
                  v-for="cat in level3Categories"
                  :key="cat.value"
                  :label="cat.label"
                  :color="selectedLevel3 === cat.value ? 'primary' : 'grey-3'"
                  :text-color="selectedLevel3 === cat.value ? 'white' : 'grey-8'"
                  :unelevated="selectedLevel3 === cat.value"
                  :flat="selectedLevel3 !== cat.value"
                  class="category-btn"
                  @click="selectedLevel3 = cat.value; handleLevel3Change(cat.value)"
                />
              </div>
            </div>

            <!-- 当前选择的分类路径 -->
            <div class="selected-path q-mt-lg">
              <div class="path-title q-mb-sm">当前选择</div>
              <div class="path-content">
                <template v-if="selectedPath.length">
                  <span
                    v-for="(cat, index) in selectedPath"
                    :key="cat.id"
                    class="path-item"
                  >
                    <q-chip
                      :color="index === selectedPath.length - 1 ? 'primary' : 'grey'"
                      text-color="white"
                      size="md"
                      class="q-ma-none"
                    >
                      {{ getCurrentLanguageName(cat) }}
                    </q-chip>
                    <q-icon
                      v-if="index < selectedPath.length - 1"
                      name="chevron_right"
                      size="20px"
                      class="q-mx-sm text-primary"
                    />
                  </span>
                </template>
                <span v-else class="text-grey-6">
                  {{ $t('forum.topic.create.pleaseSelect') }}
                </span>
              </div>
            </div>

            <!-- 错误提示 -->
            <div v-if="showCategoryError" class="text-negative q-mt-sm">
              {{ $t('forum.topic.create.categoryRequired') }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 主题内容 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <!-- 标题 -->
          <q-input
            v-model="formData.title"
            :label="$t('forum.topic.create.title')"
            :rules="[
              val => !!val || $t('forum.topic.create.titleRequired'),
              val => val.length >= 5 || $t('forum.topic.create.titleMinLength'),
              val => val.length <= 100 || $t('forum.topic.create.titleMaxLength')
            ]"
            outlined
            counter
            maxlength="100"
          />

          <!-- 内容编辑器 -->
          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('forum.topic.create.content') }}</div>
            <q-editor
              v-model="formData.content"
              :rules="[val => !!val || $t('forum.topic.create.contentRequired')]"
              min-height="300px"
              :toolbar="[
                ['bold', 'italic', 'strike', 'underline'],
                ['upload-image'],
                [
                  {
                    label: $q.lang.editor.formatting,
                    icon: $q.iconSet.editor.formatting,
                    list: 'no-icons',
                    options: ['p', 'h2', 'h3', 'h4', 'h5', 'h6']
                  }
                ],
                ['quote', 'unordered', 'ordered'],
                ['undo', 'redo']
              ]"
            />
          </div>

          <!-- 附件上传 -->
          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('forum.topic.create.attachments') }}</div>
            <q-file
              v-model="attachments"
              :label="$t('forum.topic.create.uploadAttachment')"
              outlined
              multiple
              bottom-slots
              counter
              max-files="5"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
              @rejected="onFileRejected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <!-- 已上传的附件列表 -->
            <q-list v-if="attachments.length" bordered separator class="q-mt-sm">
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
                    dense
                    color="negative"
                    icon="close"
                    @click="removeAttachment(index)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
      </q-card>

      <!-- 提交按钮 -->
      <div class="row justify-end q-mt-md">
        <q-btn
          :label="$t('common.cancel')"
          color="grey"
          flat
          class="q-mr-sm"
          @click="router.back()"
        />
        <q-btn
          :label="$t('common.submit')"
          color="primary"
          :loading="submitting"
          type="submit"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'
import { useI18n } from 'vue-i18n'
import { getImageUrl } from '~/utils/tools'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t, locale } = useI18n()

// 状态变量
const formData = ref({
  title: '',
  content: '',
  categoryId: null
})
const attachments = ref([])
const submitting = ref(false)
const showCategoryError = ref(false)

// 分类选择相关
const allCategories = ref<ForumCategory[]>([])
const selectedLevel1 = ref(null)
const selectedLevel2 = ref(null)
const selectedLevel3 = ref(null)

// 计算一级分类
const level1Categories = computed(() => {
  return allCategories.value
    .filter(cat => cat.parentId === '0')
    .map(cat => ({
      label: getCurrentLanguageName(cat),
      value: cat.id,
      category: cat
    }))
})

// 计算二级分类
const level2Categories = computed(() => {
  if (!selectedLevel1.value) return []
  return allCategories.value
    .filter(cat => cat.parentId === selectedLevel1.value)
    .map(cat => ({
      label: getCurrentLanguageName(cat),
      value: cat.id,
      category: cat
    }))
})

// 计算三级分类
const level3Categories = computed(() => {
  if (!selectedLevel2.value) return []
  return allCategories.value
    .filter(cat => cat.parentId === selectedLevel2.value)
    .map(cat => ({
      label: getCurrentLanguageName(cat),
      value: cat.id,
      category: cat
    }))
})

// 计算当前选择的分类路径
const selectedPath = computed(() => {
  const path = []
  if (selectedLevel1.value) {
    const level1Cat = allCategories.value.find(cat => cat.id === selectedLevel1.value)
    if (level1Cat) path.push(level1Cat)
  }
  if (selectedLevel2.value) {
    const level2Cat = allCategories.value.find(cat => cat.id === selectedLevel2.value)
    if (level2Cat) path.push(level2Cat)
  }
  if (selectedLevel3.value) {
    const level3Cat = allCategories.value.find(cat => cat.id === selectedLevel3.value)
    if (level3Cat) path.push(level3Cat)
  }
  return path
})

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await api.get('/forum/category/list')
    if (response.data.code === 200) {
      // 直接使用原始数据，不进行类型转换
      allCategories.value = response.data.data

      // 如果URL中有categoryId参数，自动选择对应的分类
      const categoryId = route.query.categoryId
      if (categoryId) {
        const category = findCategoryById(response.data.data, categoryId)
        if (category) {
          // 根据父子关系设置选中状态
          if (category.parentId === '0') {
            selectedLevel1.value = category.id
          } else {
            const parent = findCategoryById(response.data.data, category.parentId)
            if (parent) {
              if (parent.parentId === '0') {
                selectedLevel1.value = parent.id
                selectedLevel2.value = category.id
              }
            }
          }
          formData.value.categoryId = category.id
        }
      }
    }
  } catch (error) {
    console.error('加载分类列表失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.topic.create.loadCategoriesFailed')
    })
  }
}

// 根据ID查找分类
const findCategoryById = (categories, id) => {
  if (!id) return null
  return categories.find(cat => cat.id === id)
}

// 判断是否为叶子节点
const isLeafCategory = (categoryId, categories) => {
  if (!categoryId) return false
  return !categories.some(cat => cat.parentId === categoryId)
}

// 处理类选择变化
const handleLevel1Change = (value) => {
  selectedLevel2.value = null
  selectedLevel3.value = null
  formData.value.categoryId = null
  showCategoryError.value = false
}

const handleLevel2Change = (value) => {
  selectedLevel3.value = null
  formData.value.categoryId = value
  showCategoryError.value = false
}

const handleLevel3Change = (value) => {
  formData.value.categoryId = value
  showCategoryError.value = false
}

// 将树形结构扁平化
const flattenCategories = (tree) => {
  const result = []
  const flatten = (nodes) => {
    if (!nodes) return
    nodes.forEach(node => {
      result.push({
        id: node.id,
        parentId: node.parentId,
        name: node.name
      })
      if (node.children && node.children.length > 0) {
        flatten(node.children)
      }
    })
  }
  flatten(tree)
  return result
}

// 解析translations字段
const parseTranslations = (category: ForumCategory) => {
  if (!category.translations) return {}
  return typeof category.translations === 'string' 
    ? JSON.parse(category.translations)
    : category.translations
}

// 获取当前语言的分类名称
const getCurrentLanguageName = (category: ForumCategory) => {
  if (!category) return ''
  console.log("------category-------------------", category)
  const translations = parseTranslations(category)
  console.log("------translations-------------------", translations)
  const lang = locale.value
  console.log("------lang-------------------", lang)

  switch (lang) {
    case 'en':
      console.log("------translations.en-------------------", translations.en)
      return translations.en || category.name
    case 'zh-TW':
      return translations.zhTw || category.name  
    case 'ja':
      return translations.ja || category.name
    case 'ko':
      return translations.ko || category.name
    default:
      return translations.zh || category.name
  }
}

// 美化分类按钮样式
const getCategoryStyle = (isSelected: boolean) => {
  return {
    'background': isSelected ? 'var(--q-primary)' : '#fff',
    'color': isSelected ? '#fff' : '#666',
    'border': `2px solid ${isSelected ? 'var(--q-primary)' : '#ddd'}`,
    'box-shadow': isSelected ? '0 3px 8px rgba(0,0,0,0.15)' : 'none',
    'transform': isSelected ? 'translateY(-2px)' : 'none'
  }
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

// 处理文件拒绝
const onFileRejected = (rejectedEntries) => {
  $q.notify({
    type: 'negative',
    message: t('forum.topic.create.fileRejected')
  })
}

// 移除附件
const removeAttachment = (index) => {
  attachments.value.splice(index, 1)
}

// 上传附件
const uploadAttachments = async () => {
  if (!attachments.value.length) return []

  const formData = new FormData()
  attachments.value.forEach(file => {
    formData.append('files', file)
  })

  try {
    const response = await api.post('/admin/forum/attachment/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    const { code, data } = response.data
    if (code === 200) {
      return data // 返回上传后的文件��息数组
    }
    throw new Error(t('forum.topic.create.uploadFailed'))
  } catch (error) {
    console.error('上传附件失败:', error)
    throw error
  }
}

// 提交表单
const handleSubmit = async () => {
  // 验证分类选择
  if (!formData.value.categoryId) {
    showCategoryError.value = true
    $q.notify({
      type: 'warning',
      message: t('forum.topic.create.selectLeafCategory')
    })
    return
  }

  submitting.value = true
  try {
    // 先上传附件
    const attachmentIds = await uploadAttachments()

    // 发布主题
    const response = await api.post('/admin/forum/topic/create', {
      ...formData.value,
      attachments: attachmentIds
    })

    const { code, data, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: t('forum.topic.create.success')
      })
      router.push(`/forum/topic/${data.id}`)
    } else {
      throw new Error(msg || t('forum.topic.create.failed'))
    }
  } catch (error) {
    console.error('发布主题失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('forum.topic.create.failed')
    })
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  loadCategories()
})
</script>

<style lang="scss" scoped>
.topic-create-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .category-cascade {
    .category-btn {
      min-width: 120px;
      transition: all 0.3s ease;
      border-radius: 12px;
      font-weight: 500;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      &.primary-btn {
        min-width: 160px;
        padding: 12px 24px;
        font-size: 1.1rem;
      }
    }

    .level-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--q-primary);
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      
      &::before {
        content: '';
        width: 4px;
        height: 20px;
        background: var(--q-primary);
        margin-right: 8px;
        border-radius: 2px;
      }
    }
  }

  .selected-path {
    background: #f7f9fc;
    border-radius: 12px;
    padding: 16px;
    
    .path-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #666;
      margin-bottom: 12px;
    }
    
    .q-chip {
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-1px);
      }
    }
  }
}
</style>
