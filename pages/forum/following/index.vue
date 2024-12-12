<template>
  <div class="following-posts-page">
    <div class="page-header">
      <h1 class="text-h5">关注动态</h1>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- 排序方式 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.sort"
                :options="sortOptions"
                label="排序方式"
                dense
                outlined
                emit-value
                map-options
                @update:model-value="loadPosts"
              />
            </div>

            <!-- 关键词搜索 -->
            <div class="col-12 col-sm-4">
              <q-input
                v-model="filters.keyword"
                label="搜索"
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
            <!-- 用户信息 -->
            <div class="user-info row items-center">
              <q-avatar size="40px" class="q-mr-md">
                <img :src="post.userAvatar">
              </q-avatar>
              <div>
                <div class="text-subtitle1">{{ post.userName }}</div>
                <div class="text-caption text-grey">{{ formatDateTime(post.createdAt) }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- 帖子内容 -->
        <q-card-section>
          <div class="text-h6">{{ post.title }}</div>
          <div class="post-content" v-html="post.content"></div>

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
            <div class="post-stats">
              <q-btn flat round :color="post.isLiked ? 'primary' : 'grey'" :icon="post.isLiked ? 'thumb_up' : 'thumb_up_off_alt'" @click="handleLike(post)">
                <q-tooltip>{{ post.likes }} 赞</q-tooltip>
              </q-btn>
              <q-btn flat round color="grey" icon="comment" @click="viewComments(post)">
                <q-tooltip>{{ post.comments }} 评论</q-tooltip>
              </q-btn>
              <q-btn flat round color="grey" icon="share" @click="sharePost(post)">
                <q-tooltip>分享</q-tooltip>
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
  sort: 'newest',
  keyword: ''
})

// 排序选项
const sortOptions = [
  { label: '最新发布', value: 'newest' },
  { label: '最多点赞', value: 'mostLiked' },
  { label: '最多评论', value: 'mostCommented' }
]



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

// 加载帖子列表
const loadPosts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: 10,
      ...filters.value
    }

    const response = await api.get('/forum/following/posts', { params })
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

// 预览图片
const previewImage = (url: string) => {
  previewDialog.value.url = getImageUrl(url)
  previewDialog.value.show = true
}

// 点赞帖子
const handleLike = async (post: any) => {
  try {
    const response = await api.post(`/forum/post/like/${post.id}`)
    const { code } = response.data
    if (code === 200) {
      post.isLiked = !post.isLiked
      post.likes += post.isLiked ? 1 : -1
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 查看评论
const viewComments = (post: any) => {
  router.push(`/forum/post/${post.id}`)
}

// 分享帖子
const sharePost = (post: any) => {
  // 实现分享功能
}

// 初始化
onMounted(() => {
  loadPosts()
})
</script>

<style lang="scss" scoped>
.following-posts-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .post-card {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .user-info {
      .text-subtitle1 {
        line-height: 1.2;
      }
    }

    .post-content {
      margin: 16px 0;
      line-height: 1.6;
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
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
</style>
