<template>
  <div class="user-posts">
    <div class="page-header">
      <h1 class="text-h5">我的动态</h1>
      <q-btn
        color="primary"
        icon="add"
        label="发布动态"
        @click="router.push('/user/post/create')"
      />
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- 状态筛选 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.status"
                :options="statusOptions"
                label="状态"
                dense
                outlined
                clearable
                emit-value
                map-options
                @update:model-value="loadPosts"
              />
            </div>

            <!-- 关键词搜索 -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model="filters.keyword"
                label="搜索标题/内容"
                dense
                outlined
                clearable
                @update:model-value="loadPosts"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <!-- 时间范围 -->
            <div class="col-12 col-sm-3">
              <q-input
                v-model="filters.dateRange"
                label="发布时间"
                dense
                outlined
                readonly
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="filters.dateRange"
                        range
                        mask="YYYY-MM-DD"
                        @update:model-value="loadPosts"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 帖子列表 -->
    <div class="posts-grid">
      <q-card v-for="post in posts" :key="post.id" flat bordered class="post-card q-mb-md">
        <!-- 帖子头部 -->
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h6">{{ post.title }}</div>
            <div class="post-status">
              <q-chip
                :color="getStatusColor(post.status)"
                text-color="white"
                dense
              >
                {{ getStatusLabel(post.status) }}
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <!-- 帖子内容 -->
        <q-card-section>
          <div class="post-content" v-html="truncateContent(post.content)"></div>

          <!-- 图片预览 -->
          <div v-if="post.images?.length" class="row q-col-gutter-sm q-mt-sm">
            <div
              v-for="(image, index) in post.images"
              :key="index"
              class="col-4 col-sm-3 col-md-2"
            >
              <q-img
                :src="getImageUrl(image)"
                :ratio="1"
                class="rounded-borders cursor-pointer"
                @click="previewImage(image)"
              />
            </div>
          </div>

          <!-- 附件列表 -->
          <div v-if="post.attachments?.length" class="attachments q-mt-sm">
            <div
              v-for="file in post.attachments"
              :key="file.id"
              class="attachment-item q-py-sm"
            >
              <q-icon :name="getFileIcon(file.fileType)" />
              <span class="q-ml-sm">{{ file.fileName }}</span>
              <span class="text-grey-6">({{ formatFileSize(file.fileSize) }})</span>
            </div>
          </div>
        </q-card-section>

        <!-- 帖子数据 -->
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="post-stats text-grey">
              <q-icon name="visibility" size="16px" />
              <span class="q-ml-xs">{{ post.views }}</span>
              <q-icon name="thumb_up" size="16px" class="q-ml-md" />
              <span class="q-ml-xs">{{ post.likes }}</span>
              <q-icon name="comment" size="16px" class="q-ml-md" />
              <span class="q-ml-xs">{{ post.comments }}</span>
              <span class="q-ml-md">{{ formatDateTime(post.createdAt) }}</span>
            </div>

            <!-- 操作按钮 -->
            <div class="post-actions">
              <q-btn
                flat
                round
                color="primary"
                icon="edit"
                @click="editPost(post)"
              >
                <q-tooltip>编辑</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click="confirmDelete(post)"
              >
                <q-tooltip>删除</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 分页器 -->
    <div class="pagination-section q-mt-lg flex justify-center">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="6"
        boundary-numbers
        direction-links
        @update:model-value="loadPosts"
      />
    </div>

    <!-- 图片预览对话框 -->
    <q-dialog v-model="previewDialog.show">
      <q-card style="min-width: 300px">
        <q-card-section class="row items-center">
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="text-center">
          <q-img
            :src="previewDialog.url"
            style="max-width: 100%; max-height: 80vh"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { api } from '~/utils/axios'

const router = useRouter()
const $q = useQuasar()
const config = useRuntimeConfig()

// 状态变量
const posts = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const previewDialog = ref({
  show: false,
  url: ''
})

// 筛选条件
const filters = ref({
  status: null,
  keyword: '',
  dateRange: null
})

// 状态选项
const statusOptions = [
  { label: '全部', value: null },
  { label: '待审核', value: 0 },
  { label: '已发布', value: 1 },
  { label: '已关闭', value: 2 }
]

// 获取状态标签和颜色
const getStatusLabel = (status: number) => {
  switch (status) {
    case 0: return '待审核'
    case 1: return '已发布'
    case 2: return '已关闭'
    default: return '未知'
  }
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'positive'
    case 2: return 'negative'
    default: return 'grey'
  }
}

// 获取文件图标
const getFileIcon = (fileType: string) => {
  const typeMap: { [key: string]: string } = {
    'image': 'image',
    'pdf': 'picture_as_pdf',
    'word': 'description',
    'excel': 'table_chart',
    'zip': 'folder_zip'
  }
  return typeMap[fileType] || 'insert_drive_file'
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 截断内容
const truncateContent = (content: string) => {
  if (!content) return ''
  return content.length > 200 ? content.substring(0, 200) + '...' : content
}


// 预览图片
const previewImage = (url: string) => {
  previewDialog.value.url = getImageUrl(url)
  previewDialog.value.show = true
}

// 加载帖子列表
const loadPosts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: 10,
      ...filters.value,
      startTime: filters.value.dateRange?.from,
      endTime: filters.value.dateRange?.to
    }

    const response = await api.get('/user/post/list', { params })
    const { code, data, total } = response.data
    if (code === 200) {
      posts.value = data
      totalPages.value = Math.ceil(total / 10)
    }
  } catch (error) {
    console.error('加载帖子列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载帖子列表失败'
    })
  } finally {
    loading.value = false
  }
}

// 编辑帖子
const editPost = (post: any) => {
  router.push(`/user/post/edit/${post.id}`)
}

// 确认删除
const confirmDelete = (post: any) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除帖子 "${post.title}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/user/post/${post.id}`)

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadPosts()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除帖子失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 初始化
onMounted(() => {
  loadPosts()
})
</script>

<style lang="scss" scoped>
.user-posts {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .post-card {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .post-content {
      max-height: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .attachments {
      .attachment-item {
        display: flex;
        align-items: center;
        color: #666;
        font-size: 0.9em;
      }
    }

    .post-stats {
      font-size: 0.9em;
      display: flex;
      align-items: center;
    }
  }
}
</style>
