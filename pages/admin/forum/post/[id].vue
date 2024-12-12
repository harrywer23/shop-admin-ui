<template>
  <div class="forum-post-edit">
    <div class="page-header">
      <h1 class="text-h5">编辑主题</h1>
      <div class="row q-gutter-sm">
        <q-btn
          :color="formData.isTop ? 'grey' : 'warning'"
          :icon="formData.isTop ? 'vertical_align_bottom' : 'vertical_align_top'"
          :label="formData.isTop ? '取消置顶' : '置顶'"
          @click="handleTop"
        />
        <q-btn
          :color="formData.isHighlight ? 'grey' : 'orange'"
          :icon="formData.isHighlight ? 'stars' : 'star_border'"
          :label="formData.isHighlight ? '取消加精' : '加精'"
          @click="handleHighlight"
        />
        <q-btn
          v-if="formData.status === 1"
          color="negative"
          icon="block"
          label="下架"
          @click="handleOffline"
        />
        <q-btn
          flat
          icon="arrow_back"
          label="返回"
          color="primary"
          @click="router.back()"
        />
      </div>
    </div>

    <q-card class="edit-form">
      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- 基本信息 -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-8">
              <q-input
                v-model="formData.title"
                label="标题"
                :rules="[val => !!val || '请输入标题']"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="formData.categoryId"
                :options="categoryOptions"
                label="分类"
                :rules="[val => !!val || '请选择分类']"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
          </div>

          <!-- 内容编辑器 -->
          <div class="content-editor">
            <div class="text-subtitle2 q-mb-sm">内容</div>
            <tiny-mce
              v-model="formData.content"
              :rules="[val => !!val || '请输入内容']"
            />
          </div>

          <!-- 状态设置 -->
          <div class="row q-col-gutter-md items-center">
            <div class="col-auto">
              <q-toggle
                v-model="formData.isTop"
                label="置顶"
              />
            </div>
            <div class="col-auto">
              <q-toggle
                v-model="formData.isHighlight"
                label="精华"
              />
            </div>
            <div class="col-auto">
              <q-select
                v-model="formData.status"
                :options="statusOptions"
                label="状态"
                outlined
                dense
                emit-value
                map-options
                style="min-width: 150px"
              />
            </div>
          </div>

          <!-- 审核信息 -->
          <div v-if="formData.status === 2" class="review-section">
            <q-input
              v-model="formData.rejectReason"
              type="textarea"
              label="拒绝原因"
              outlined
              autogrow
              :rules="[val => formData.status === 2 ? (!!val || '请输入拒绝原因') : true]"
            />
          </div>

          <!-- 按钮 -->
          <div class="row justify-end q-gutter-sm">
            <q-btn
              flat
              label="取消"
              color="grey"
              @click="router.back()"
            />
            <q-btn
              label="保存"
              color="primary"
              type="submit"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import TinyMce from '~/components/tiny-mce/index.vue'
import { api } from '~/utils/axios'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

interface ForumPost {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  categoryName: string;
  authorId: number;
  authorName: string;
  status: number;
  isTop: boolean;
  isHighlight: boolean;
  views: number;
  likes: number;
  comments: number;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

// 表单数据
const formData = ref<ForumPost>({
  id: 0,
  title: '',
  content: '',
  categoryId: 0,
  categoryName: '',
  authorId: 0,
  authorName: '',
  status: 1,
  isTop: false,
  isHighlight: false,
  views: 0,
  likes: 0,
  comments: 0,
  createdAt: '',
  updatedAt: ''
})

// 分类选项
const categoryOptions = ref<{ label: string; value: number; }[]>([])

// 状态选项
const statusOptions = [
  { label: '待审核', value: 0 },
  { label: '已发布', value: 1 },
  { label: '已拒绝', value: 2 },
  { label: '已下架', value: 3 }
]

// 加载分类
const loadCategories = async () => {
  try {
    const response = await api.get('/admin/forum/category/list')
    if (response.data.code === 200) {
      categoryOptions.value = response.data.data.map((item: any) => ({
        label: item.name,
        value: item.id
      }))
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载分类失败'
    })
  }
}

// 加载主题详情
const loadPost = async (id: string) => {
  try {
    const response = await api.get(`/admin/forum/post/${id}`)
    if (response.data.code === 200) {
      formData.value = response.data.data
    }
  } catch (error) {
    console.error('加载主题详情失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载主题详情失败'
    })
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    const response = await api.post('/admin/forum/post/update', formData.value)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '保存成功'
      })
      router.back()
    } else {
      throw new Error(response.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  }
}

// 处理置顶
const handleTop = async () => {
  try {
    const response = await api.post('/admin/forum/post/top', {
      id: formData.value.id,
      isTop: !formData.value.isTop
    })

    if (response.data.code === 200) {
      formData.value.isTop = !formData.value.isTop
      $q.notify({
        type: 'positive',
        message: formData.value.isTop ? '已置顶' : '已取消置顶'
      })
    } else {
      throw new Error(response.data.msg || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '操作失败'
    })
  }
}

// 处理加精
const handleHighlight = async () => {
  try {
    const response = await api.post('/admin/forum/post/highlight', {
      id: formData.value.id,
      isHighlight: !formData.value.isHighlight
    })

    if (response.data.code === 200) {
      formData.value.isHighlight = !formData.value.isHighlight
      $q.notify({
        type: 'positive',
        message: formData.value.isHighlight ? '已加精' : '已取消加精'
      })
    } else {
      throw new Error(response.data.msg || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '操作失败'
    })
  }
}

// 处理下架
const handleOffline = async () => {
  try {
    await $q.dialog({
      title: '确认下架',
      message: '确定要下架这个主题吗？',
      cancel: true,
      persistent: true
    })

    const response = await api.post('/admin/forum/post/offline', {
      id: formData.value.id,
      status: 3  // 3表示已下架状态
    })

    if (response.data.code === 200) {
      formData.value.status = 3
      $q.notify({
        type: 'positive',
        message: '已下架'
      })
      router.back()
    } else {
      throw new Error(response.data.msg || '操作失败')
    }
  } catch (error) {
    if (error) {  // 排除取消对话框的情况
      console.error('操作失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '操作失败'
      })
    }
  }
}

onMounted(async () => {
  if (route.params.id) {
    await loadCategories()
    await loadPost(route.params.id as string)
  }
})
</script>

<style lang="scss" scoped>
.forum-post-edit {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;

    h1 {
      margin: 0;
      color: #1976d2;
      display: flex;
      align-items: center;

      &:before {
        content: '';
        width: 4px;
        height: 20px;
        background: #1976d2;
        margin-right: 8px;
        border-radius: 2px;
      }
    }
  }

  .edit-form {
    background: white;
    border-radius: 8px;
  }

  .content-editor {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 16px;
    background: #fafafa;

    .text-subtitle2 {
      color: #666;
      font-weight: 500;
    }
  }

  .review-section {
    border: 1px solid #ffcdd2;
    border-radius: 4px;
    padding: 16px;
    background: #ffebee;
  }
}
</style> 