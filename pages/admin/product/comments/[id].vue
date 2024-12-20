<template>
  <div class="comments-management">
    <div class="page-header">
      <div>
        <h1 class="text-h5">商品评论管理</h1>
        <div class="text-subtitle2">{{ productInfo?.prodName }}</div>
      </div>
      <q-btn
        flat
        icon="arrow_back"
        label="返回商品列表"
        @click="router.back()"
      />
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- 评分筛选 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.score"
                :options="scoreOptions"
                label="评分"
                dense
                outlined
                clearable
                emit-value
                map-options
                @update:model-value="loadComments"
              />
            </div>

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
                @update:model-value="loadComments"
              />
            </div>

            <!-- 时间范围 -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model="filters.dateRange"
                label="评论时间"
                dense
                outlined
                clearable
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="filters.dateRange"
                        range
                        mask="YYYY-MM-DD"
                        @update:model-value="loadComments"
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

    <!-- 评论列表 -->
    <q-table
      :rows="comments"
      :columns="columns"
      row-key="prodCommId"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- 用户信息列 -->
      <template v-slot:body-cell-user="props">
        <q-td :props="props">
          <div v-if="props.row.isAnonymous">
            匿名用户
          </div>
          <div v-else>
            {{ props.row.userId }}
          </div>
        </q-td>
      </template>

      <!-- 评分列 -->
      <template v-slot:body-cell-score="props">
        <q-td :props="props">
          <q-rating
            v-model="props.row.score"
            size="1em"
            color="primary"
            readonly
          />
        </q-td>
      </template>

      <!-- 图片列 -->
      <template v-slot:body-cell-pics="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <q-img
              v-for="(pic, index) in JSON.parse(props.row.pics || '[]')"
              :key="index"
              :src="getImageUrl(pic)"
              style="width: 50px; height: 50px"
              fit="cover"
              class="cursor-pointer"
              @click="previewImage(pic)"
            />
          </div>
        </q-td>
      </template>

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
          <div class="row q-gutter-xs">
            <!-- 审核按钮 -->
            <q-btn
              v-if="props.row.status === 0"
              flat
              round
              color="primary"
              icon="check_circle"
              @click="handleAudit(props.row, 1)"
            >
              <q-tooltip>通过审核</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.status === 0"
              flat
              round
              color="negative"
              icon="cancel"
              @click="handleAudit(props.row, -1)"
            >
              <q-tooltip>拒绝审核</q-tooltip>
            </q-btn>

            <!-- 回复按钮 -->
            <q-btn
              flat
              round
              color="info"
              icon="reply"
              @click="showReplyDialog(props.row)"
            >
              <q-tooltip>回复</q-tooltip>
            </q-btn>

            <!-- 显示/隐藏按钮 -->
            <q-btn
              v-if="props.row.status !== 0"
              flat
              round
              :color="props.row.status === 1 ? 'negative' : 'positive'"
              :icon="props.row.status === 1 ? 'visibility_off' : 'visibility'"
              @click="handleAudit(props.row, props.row.status === 1 ? -1 : 1)"
            >
              <q-tooltip>{{ props.row.status === 1 ? '隐藏' : '显示' }}</q-tooltip>
            </q-btn>

            <!-- 删除按钮 -->
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>删除</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- 回复对话框 -->
    <q-dialog v-model="replyDialog.show">
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">回复评论</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <!-- 原评论内容 -->
          <div class="original-comment q-pa-md bg-grey-2 rounded-borders">
            <div class="text-subtitle2">原评论：</div>
            <div class="q-mt-sm">{{ replyDialog.currentComment?.content }}</div>
            <div class="row q-mt-sm items-center">
              <q-rating
                :model-value="replyDialog.currentComment?.score || 0"
                size="1em"
                color="primary"
                readonly
              />
              <div class="q-ml-md text-caption text-grey">
                {{ formatDateTime(replyDialog.currentComment?.recTime) }}
              </div>
            </div>
            <!-- 评论图片 -->
            <div v-if="replyDialog.currentComment?.pics" class="row q-gutter-xs q-mt-sm">
              <q-img
                v-for="(pic, index) in JSON.parse(replyDialog.currentComment?.pics || '[]')"
                :key="index"
                :src="getImageUrl(pic)"
                style="width: 50px; height: 50px"
                fit="cover"
                class="cursor-pointer"
                @click="previewImage(pic)"
              />
            </div>
          </div>

          <!-- 回复内容输入 -->
          <q-input
            v-model="replyDialog.content"
            type="textarea"
            label="回复内容"
            :rules="[val => !!val || '请输入回复内容']"
            outlined
            autogrow
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn label="回复" color="primary" @click="handleReply" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 图片预览对话框 -->
    <q-dialog v-model="previewDialog.show">
      <q-card style="min-width: 350px">
        <q-card-section>
          <q-img :src="previewDialog.url" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { api } from '~/utils/axios'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// 获取商品ID
const prodId = route.params.id

// 状态变量
const productInfo = ref(null)
const comments = ref([])
const loading = ref(false)
const pagination = ref({
  sortBy: 'recTime',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 筛选条件
const filters = ref({
  score: null,
  status: null,
  dateRange: null
})

// 对话框状态
const replyDialog = ref({
  show: false,
  content: '',
  currentComment: null as Comment | null
})

const previewDialog = ref({
  show: false,
  url: ''
})

// 选项定义
const scoreOptions = [
  { label: '全部评分', value: null },
  { label: '5星', value: 5 },
  { label: '4星', value: 4 },
  { label: '3星', value: 3 },
  { label: '2星', value: 2 },
  { label: '1星', value: 1 }
]

const statusOptions = [
  { label: '全部状态', value: null },
  { label: '显示', value: 1 },
  { label: '待审核', value: 0 },
  { label: '已隐藏', value: -1 }
]

// 表格列定义
const columns = [
  { name: 'prodCommId', label: 'ID', field: 'prodCommId', sortable: true },
  { name: 'user', label: '用户', field: 'userId' },
  { name: 'content', label: '评论内容', field: 'content' },
  { name: 'score', label: '评分', field: 'score', sortable: true },
  { name: 'pics', label: '图片', field: 'pics' },
  { name: 'recTime', label: '评论时间', field: 'recTime', sortable: true },
  { name: 'replyContent', label: '回复内容', field: 'replyContent' },
  { name: 'status', label: '状态', field: 'status' },
  { name: 'actions', label: '操作', field: 'actions' }
]

// ���取状态标签和颜色
const getStatusLabel = (status: number) => {
  switch (status) {
    case 1: return '已显示'
    case 0: return '待审核'
    case -1: return '已隐藏'
    default: return '未知'
  }
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 1: return 'positive'
    case 0: return 'warning'
    case -1: return 'negative'
    default: return 'grey'
  }
}

// 加载商品信息
const loadProductInfo = async () => {
  try {
    const response = await api.get(`/sys/prod/info/${prodId}`)
    const { code, data } = response.data
    if (code === 200) {
      productInfo.value = data
    }
  } catch (error) {
    console.error('加载商品信息失败:', error)
  }
}

// 加载评论列表
const loadComments = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      prodId: prodId,
      ...filters.value,
      startTime: filters.value.dateRange?.from,
      endTime: filters.value.dateRange?.to
    }

    const response = await api.get('/sys/comment/list', { params })
    const { code, data, total } = response.data

    if (code === 200) {
      comments.value = data
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载评论列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载评论列表失败'
    })
  } finally {
    loading.value = false
  }
}

// 处理分页和排序
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  await loadComments()
}

// 处理审核
const handleAudit = async (comment: any, status: number) => {
  try {
    const response = await api.post('/sys/comment/audit', {
      prodCommId: comment.prodCommId,
      status: status
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: status === 1 ? '评论已通过审核' : status === -1 ? '评论已隐藏' : '操作成功'
      })
      loadComments()
    } else {
      throw new Error(msg || '操作失败')
    }
  } catch (error) {
    console.error('审核评论失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '操作失败'
    })
  }
}

// 显示回复对话框
const showReplyDialog = (comment: Comment) => {
  replyDialog.value.currentComment = { ...comment }
  replyDialog.value.content = comment.replyContent || ''
  replyDialog.value.show = true
}

// 处理回复
const handleReply = async () => {
  if (!replyDialog.value.currentComment) return

  if (!replyDialog.value.content.trim()) {
    $q.notify({
      type: 'warning',
      message: '请输入回复内容'
    })
    return
  }

  try {
    const response = await api.post('/sys/comment/reply', {
      prodCommId: replyDialog.value.currentComment.prodCommId,
      replyContent: replyDialog.value.content
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '回复成功'
      })
      replyDialog.value.show = false
      loadComments()
    } else {
      throw new Error(msg || '回复失败')
    }
  } catch (error) {
    console.error('回复评论失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '回复失败'
    })
  }
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 确认删除
const confirmDelete = (comment: any) => {
  $q.dialog({
    title: '确认删除',
    message: '确定要删除该评论吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/sys/comment/delete/${comment.prodCommId}`)

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadComments()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除评论失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 预览图片
const previewImage = (url: string) => {
  previewDialog.value.url = getImageUrl(url)
  previewDialog.value.show = true
}

// 初始化
onMounted(() => {
  loadProductInfo()
  loadComments()
})
</script>

<style lang="scss" scoped>
.comments-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .q-img {
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .original-comment {
    border-left: 4px solid var(--q-primary);

    .q-img {
      border-radius: 4px;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
}
</style>
