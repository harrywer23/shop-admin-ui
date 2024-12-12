`<template>
  <div class="forum-admin-page">
    <!-- 页面标题和操作按钮 -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">论坛管理</div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="category"
          label="分类管理"
          @click="router.push('/admin/forum/category')"
        />
        <q-btn
          color="primary"
          icon="topic"
          label="主题管理"
          @click="router.push('/admin/forum/topic')"
        />
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-subtitle2">总帖子数</div>
            <div class="text-h4 q-mt-sm text-primary">{{ statistics.totalPosts }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-subtitle2">今日新增</div>
            <div class="text-h4 q-mt-sm text-positive">{{ statistics.todayPosts }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-subtitle2">待审核</div>
            <div class="text-h4 q-mt-sm text-warning">{{ statistics.pendingPosts }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-subtitle2">被举报</div>
            <div class="text-h4 q-mt-sm text-negative">{{ statistics.reportedPosts }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-subtitle2">精华帖</div>
            <div class="text-h4 q-mt-sm text-orange">{{ statistics.highlightPosts }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 搜索栏 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-3">
            <q-input
              v-model="filters.keyword"
              label="搜索关键词"
              clearable
              dense
              outlined
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filters.categoryId"
              :options="categoryOptions"
              label="分类"
              clearable
              dense
              outlined
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filters.status"
              :options="statusOptions"
              label="状态"
              clearable
              dense
              outlined
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-input
              v-model="filters.dateRange"
              label="发布时间"
              dense
              outlined
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="filters.dateRange"
                      range
                      mask="YYYY-MM-DD"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 row items-center justify-end">
            <q-btn
              color="primary"
              icon="search"
              label="搜索"
              @click="loadPosts"
            />
            <q-btn
              flat
              color="grey"
              icon="refresh"
              label="重置"
              class="q-ml-sm"
              @click="resetFilters"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 数据表格 -->
    <q-card>
      <q-card-section>
        <q-table
          :rows="posts"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @request="onRequest"
        >
          <!-- 状态列 -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.row.status)"
                text-color="white"
                dense
              >
                {{ getStatusLabel(props.row.status) }}
              </q-chip>
            </q-td>
          </template>

          <!-- 操作列 -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row q-gutter-xs justify-center">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="visibility"
                  size="sm"
                  @click="viewPost(props.row)"
                >
                  <q-tooltip>查看</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="warning"
                  icon="edit"
                  size="sm"
                  @click="editPost(props.row)"
                >
                  <q-tooltip>编辑</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  :color="props.row.isTop ? 'grey' : 'warning'"
                  :icon="props.row.isTop ? 'vertical_align_bottom' : 'vertical_align_top'"
                  size="sm"
                  @click="handleTop(props.row)"
                >
                  <q-tooltip>{{ props.row.isTop ? '取消置顶' : '置顶' }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  :color="props.row.isHighlight ? 'grey' : 'orange'"
                  :icon="props.row.isHighlight ? 'stars' : 'star_border'"
                  size="sm"
                  @click="handleHighlight(props.row)"
                >
                  <q-tooltip>{{ props.row.isHighlight ? '取消加精' : '加精' }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.status === 0"
                  flat
                  round
                  color="positive"
                  icon="check_circle"
                  size="sm"
                  @click="showApproveDialog(props.row)"
                >
                  <q-tooltip>审核</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.status === 1"
                  flat
                  round
                  color="negative"
                  icon="block"
                  size="sm"
                  @click="handleOffline(props.row)"
                >
                  <q-tooltip>下架</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deletePost(props.row)"
                >
                  <q-tooltip>删除</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 审核对话框 -->
    <q-dialog v-model="approveDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <span class="text-h6">审核帖子</span>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="approveDialog.reason"
            type="textarea"
            label="审核说明"
            outlined
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey" v-close-popup />
          <q-btn flat label="通过" color="positive" @click="handleApprove" />
          <q-btn flat label="拒绝" color="negative" @click="handleReject" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from '~/utils/axios'

const $q = useQuasar()
const router = useRouter()

// 统计数据
const statistics = ref({
  totalPosts: 0,
  todayPosts: 0,
  pendingPosts: 0,
  reportedPosts: 0,
  highlightPosts: 0
})

// 表格列定义
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'title', label: '标题', field: 'title', sortable: true, align: 'left' },
  { name: 'category', label: '分类', field: 'categoryName', align: 'left' },
  { name: 'author', label: '作者', field: 'authorName', align: 'left' },
  { name: 'views', label: '浏览量', field: 'views', sortable: true, align: 'right' },
  { name: 'likes', label: '点赞数', field: 'likes', sortable: true, align: 'right' },
  { name: 'comments', label: '评论数', field: 'comments', sortable: true, align: 'right' },
  { name: 'status', label: '状态', field: 'status', align: 'center' },
  { name: 'createdAt', label: '发布时间', field: 'createdAt', sortable: true, align: 'center' },
  { name: 'actions', label: '操作', align: 'center' }
]

// 状态选项
const statusOptions = [
  { label: '待审核', value: 0 },
  { label: '已发布', value: 1 },
  { label: '已拒绝', value: 2 },
  { label: '已删除', value: 3 }
]

// 分类选项
const categoryOptions = ref([])

// 状态相关
const loading = ref(false)
const posts = ref([])
const pagination = ref({
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 筛选条件
const filters = reactive({
  keyword: '',
  categoryId: null,
  status: null,
  dateRange: { from: '', to: '' }
})

// 审核对话框
const approveDialog = reactive({
  show: false,
  postId: null,
  reason: '',
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await api.get('/admin/forum/statistics')
    if (response.data.code === 200) {
      statistics.value = response.data.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载分类选项
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
  }
}

// 加载帖子列表
const loadPosts = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sort: pagination.value.sortBy,
      order: pagination.value.descending ? 'desc' : 'asc',
      keyword: filters.keyword,
      categoryId: filters.categoryId,
      status: filters.status,
      startTime: filters.dateRange?.from,
      endTime: filters.dateRange?.to
    }

    const response = await api.get('/admin/forum/post/list', { params })
    const { code, data } = response.data

    if (code === 200) {
      posts.value = data.records
      pagination.value.rowsNumber = data.total
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

// 处理分页请求
const onRequest = (props: any) => {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  pagination.value.sortBy = props.pagination.sortBy
  pagination.value.descending = props.pagination.descending
  loadPosts()
}

// 重置筛选条件
const resetFilters = () => {
  filters.keyword = ''
  filters.categoryId = null
  filters.status = null
  filters.dateRange = { from: '', to: '' }
  loadPosts()
}

// 获取状态标签
const getStatusLabel = (status: number) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option ? option.label : '未知状态'
}

// 获取状态颜色
const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'warning'    // 待审核
    case 1: return 'positive'   // 已发布
    case 2: return 'negative'   // 已拒绝
    case 3: return 'grey'       // 已删除
    default: return 'grey'
  }
}

// 查看帖子
const viewPost = (post: any) => {
  router.push(`/forum/topic/${post.id}`)
}

// 编辑帖子
const editPost = (post: any) => {
  router.push(`/admin/forum/post/${post.id}`)
}

// 显示审核对话框
const showApproveDialog = (post: any) => {
  approveDialog.postId = post.id
  approveDialog.reason = ''
  approveDialog.show = true
}

// 处理置顶
const handleTop = async (post: any) => {
  try {
    const response = await api.post('/admin/forum/post/top', {
      id: post.id,
      isTop: !post.isTop
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: post.isTop ? '已取消置顶' : '已置顶'
      })
      loadPosts()
    }
  } catch (error) {
    console.error('操作失败:', error)
    $q.notify({
      type: 'negative',
      message: '操作失败'
    })
  }
}

// 处理加精
const handleHighlight = async (post: any) => {
  try {
    const response = await api.post('/admin/forum/post/highlight', {
      id: post.id,
      isHighlight: !post.isHighlight
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: post.isHighlight ? '已取消加精' : '已加精'
      })
      loadPosts()
    }
  } catch (error) {
    console.error('操作失败:', error)
    $q.notify({
      type: 'negative',
      message: '操作失败'
    })
  }
}

// 处理审核通过
const handleApprove = async () => {
  try {
    const response = await api.post('/admin/forum/post/approve', {
      id: approveDialog.postId,
      reason: approveDialog.reason
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '审核通过'
      })
      approveDialog.show = false
      loadPosts()
    }
  } catch (error) {
    console.error('操作失败:', error)
    $q.notify({
      type: 'negative',
      message: '操作失败'
    })
  }
}

// 处理审核拒绝
const handleReject = async () => {
  if (!approveDialog.reason) {
    $q.notify({
      type: 'warning',
      message: '请输入拒绝原因'
    })
    return
  }

  try {
    const response = await api.post('/admin/forum/post/reject', {
      id: approveDialog.postId,
      reason: approveDialog.reason
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '已拒绝'
      })
      approveDialog.show = false
      loadPosts()
    }
  } catch (error) {
    console.error('操作失败:', error)
    $q.notify({
      type: 'negative',
      message: '操作失败'
    })
  }
}

// 处理下架
const handleOffline = async (post: any) => {
  try {
    await $q.dialog({
      title: '确认下架',
      message: '确定要下架这个主题吗？',
      cancel: true,
      persistent: true
    })

    const response = await api.post('/admin/forum/post/offline', {
      id: post.id,
      status: 3
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '已下架'
      })
      loadPosts()
    }
  } catch (error) {
    if (error) {
      console.error('操作失败:', error)
      $q.notify({
        type: 'negative',
        message: '操作失败'
      })
    }
  }
}

// 删除帖子
const deletePost = async (post: any) => {
  try {
    await $q.dialog({
      title: '确认删除',
      message: '确定要删除这篇帖子吗？',
      cancel: true,
      persistent: true
    })

    const response = await api.delete(`/admin/forum/post/\${post.id}`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '删除成功'
      })
      loadPosts()
    }
  } catch (error) {
    if (error) {
      console.error('删除失败:', error)
      $q.notify({
        type: 'negative',
        message: '删除失败'
      })
    }
  }
}

// 初始化
onMounted(() => {
  loadStatistics()
  loadCategories()
  loadPosts()
})
</script>

<style lang="scss" scoped>
.forum-admin-page {
  padding: 20px;

  .q-table {
    background: white;
  }

  // 添加按钮样式
  .q-btn {
    min-width: 120px;
  }
}
</style>`
