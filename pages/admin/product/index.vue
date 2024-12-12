<template>
  <div class="product-management">
    <div class="page-header">
      <h1 class="text-h5">商品管理</h1>
      <div class="header-actions">
        <q-btn
          color="primary"
          icon="add"
          label="新增商品"
          :to="'/admin/product/add'"
        />
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- 商品名称搜索 -->
            <div class="col-12 col-sm-3">
              <q-input
                v-model="filters.prodName"
                label="商品名称"
                dense
                outlined
                clearable
              />
            </div>

            <!-- 商品类型筛选 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.prodType"
                :options="prodTypeOptions"
                label="商品类型"
                dense
                outlined
                clearable
                emit-value
                map-options
              />
            </div>

            <!-- 商品状态筛选 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.status"
                :options="statusOptions"
                label="商品状态"
                dense
                outlined
                clearable
                emit-value
                map-options
              />
            </div>

            <!-- 搜索按钮 -->
            <div class="col-12 col-sm-3">
              <q-btn
                color="primary"
                icon="search"
                label="搜索"
                @click="loadProducts"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 商品列表 -->
    <q-table
      :rows="products"
      :columns="columns"
      row-key="prodId"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- 商品图片列 -->
      <template v-slot:body-cell-pic="props">
        <q-td :props="props">
          <q-img
            :src="getImageUrl(props.row.pic)"
            style="width: 80px; height: 80px"
            fit="cover"
          />
        </q-td>
      </template>

      <!-- 商品类型列 -->
      <template v-slot:body-cell-prodType="props">
        <q-td :props="props">
          <q-chip
            :color="getProdTypeColor(props.value)"
            text-color="white"
            dense
          >
            {{ getProdTypeLabel(props.value) }}
          </q-chip>
        </q-td>
      </template>

      <!-- 商品状态列 -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="getStatusColor(props.value)"
            text-color="white"
            dense
          >
            {{ getStatusLabel(props.value) }}
          </q-chip>
        </q-td>
      </template>

      <!-- 操作列 -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <!-- 编辑按钮 -->
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              :to="`/admin/product/edit/${props.row.prodId}`"
            >
              <q-tooltip>编辑</q-tooltip>
            </q-btn>

            <!-- 上下架按钮 -->
            <q-btn
              flat
              round
              :color="props.row.status === 1 ? 'negative' : 'positive'"
              :icon="props.row.status === 1 ? 'arrow_downward' : 'arrow_upward'"
              @click="toggleStatus(props.row)"
            >
              <q-tooltip>{{ props.row.status === 1 ? '下架' : '上架' }}</q-tooltip>
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

            <!-- 查看评论按钮 -->
            <q-btn
              flat
              round
              color="info"
              icon="comment"
              @click="viewComments(props.row)"
            >
              <q-tooltip>查看评论</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>
    <!-- 分页器 -->
    <div class="pagination">
      <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="7"
          boundary-numbers
          direction-links
          @update:modelValue="loadProducts()"
      />
    </div>
    <!-- 评论对话框 -->
    <q-dialog v-model="commentsDialog.show" maximized>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">商品评论</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-none">
          <q-table
            :rows="commentsDialog.comments"
            :columns="commentColumns"
            row-key="prodCommId"
            :loading="commentsDialog.loading"
            :pagination="commentPagination"
            @request="onCommentRequest"
          >
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

            <!-- 操作列 -->
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <div class="row q-gutter-xs">
                  <!-- 回复按钮 -->
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="reply"
                    @click="showReplyDialog(props.row)"
                  >
                    <q-tooltip>回复</q-tooltip>
                  </q-btn>

                  <!-- 删除按钮 -->
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click="confirmDeleteComment(props.row)"
                  >
                    <q-tooltip>删除</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 回复评论对话框 -->
    <q-dialog v-model="replyDialog.show">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">回复评论</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="replyDialog.content"
            type="textarea"
            label="回复内容"
            :rules="[val => !!val || '请输入回复内容']"
            outlined
            autogrow
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
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from '~/utils/axios'
import { ProductType, ProductStatus } from '~/utils/constants'

const $q = useQuasar()
const router = useRouter()
const config = useRuntimeConfig()
const currentPage = ref(1)
const pageSize = ref(12)
const totalPages = ref(1)
// 状态变量
const products = ref([])
const loading = ref(false)
const pagination = ref({
  sortBy: 'createTime',
  descending: true,
  pageNum: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 筛选条件
const filters = ref({
  prodName: '',
  prodType: null,
  status: null
})

// 商品类型选项
const prodTypeOptions = [
  { label: '普通商品', value: ProductType.NORMAL },
  { label: '预售商品', value: ProductType.PRESELL },
  { label: '团购商品', value: ProductType.GROUP },
  { label: '秒杀商品', value: ProductType.SECKILL }
]

// 商品状态选项
const statusOptions = [
  { label: '已下架', value: ProductStatus.OFFLINE },
  { label: '已上架', value: ProductStatus.PUBLISHED }
]

// 表格列定义
const columns = [
  { name: 'prodId', label: 'ID', field: 'prodId', sortable: true },
  { name: 'pic', label: '商品图片', field: 'pic' },
  { name: 'prodName', label: '商品名称', field: 'prodName', sortable: true },
  { name: 'price', label: '价格', field: 'price', sortable: true },
  { name: 'prodType', label: '商品类型', field: 'prodType' },
  { name: 'status', label: '状态', field: 'status' },
  { name: 'soldNum', label: '销量', field: 'soldNum', sortable: true },
  { name: 'totalStocks', label: '库存', field: 'totalStocks', sortable: true },
  { name: 'actions', label: '操作', field: 'actions' }
]

// 评论相关
const commentsDialog = ref({
  show: false,
  loading: false,
  comments: [],
  currentProdId: null
})

const commentPagination = ref({
  sortBy: 'recTime',
  descending: true,
  pageNum: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const commentColumns = [
  { name: 'prodCommId', label: 'ID', field: 'prodCommId', sortable: true },
  { name: 'content', label: '评论内容', field: 'content' },
  { name: 'score', label: '评分', field: 'score' },
  { name: 'pics', label: '图片', field: 'pics' },
  { name: 'recTime', label: '评论时间', field: 'recTime', sortable: true },
  { name: 'replyContent', label: '回复内容', field: 'replyContent' },
  { name: 'actions', label: '操作', field: 'actions' }
]

// 回复对话框
const replyDialog = ref({
  show: false,
  content: '',
  currentComment: null
})

// 图片预览对话框
const previewDialog = ref({
  show: false,
  url: ''
})

// 获取图片URL
const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${config.public.imageBaseUrl}/${url}`
}

// 获取商品类型标签和颜色
const getProdTypeLabel = (type: ProductType) => {
  const option = prodTypeOptions.find(opt => opt.value === type)
  return option ? option.label : '未知类型'
}

const getProdTypeColor = (type: ProductType) => {
  switch (type) {
    case ProductType.PRESELL:
      return 'warning'
    case ProductType.GROUP:
      return 'positive'
    case ProductType.SECKILL:
      return 'negative'
    default:
      return 'primary'
  }
}

// 获取状态标签和颜色
const getStatusLabel = (status: ProductStatus) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option ? option.label : '未知状态'
}

const getStatusColor = (status: ProductStatus) => {
  switch (status) {
    case ProductStatus.PUBLISHED:
      return 'positive'
    case ProductStatus.OFFLINE:
      return 'negative'
    default:
      return 'grey'
  }
}

// 加载商品列表
const loadProducts = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pagination.value.rowsPerPage,
      ...filters.value
    }

    const response = await api.get('/admin/prod/list', { params })
    const { code, data, total } = response.data

    if (code === 200) {
      products.value = data
      pagination.value.rowsNumber = total
      totalPages.value = Math.ceil(response.data.total / pageSize.value)
    }
  } catch (error) {
    console.error('加载商品列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载商品列表失败'
    })
  } finally {
    loading.value = false
  }
}

// 处理分页和排序
const onRequest = async (props: any) => {
  const { pageNum, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.pageNum = pageNum
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  await loadProducts()
}

// 切换商品状态
const toggleStatus = async (product: any) => {
  try {
    const response = await api.post('/admin/prod/updateStatus', {
      prodId: product.prodId,
      status: product.status === 1 ? 0 : 1
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: product.status === 1 ? '下架成功' : '上架成功'
      })
      loadProducts()
    } else {
      throw new Error(msg || '操作失败')
    }
  } catch (error) {
    console.error('切换状态失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '操作失败'
    })
  }
}

// 确认删除商品
const confirmDelete = (product: any) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除商品 "${product.prodName}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/prod/delete/${product.prodId}`)

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadProducts()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除商品失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 查看评论
const viewComments = async (product: any) => {
  commentsDialog.value.currentProdId = product.prodId
  commentsDialog.value.show = true
  await loadComments()
}

// 加载评论列表
const loadComments = async () => {
  commentsDialog.value.loading = true
  try {
    const params = {
      pageNum: commentPagination.value.pageNum,
      pageSize: commentPagination.value.rowsPerPage,
      prodId: commentsDialog.value.currentProdId
    }

    const response = await api.get('/admin/comment/list', { params })
    const { code, data, total } = response.data

    if (code === 200) {
      commentsDialog.value.comments = data
      commentPagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载评论列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载评论列表失败'
    })
  } finally {
    commentsDialog.value.loading = false
  }
}

// 处理评论分页
const onCommentRequest = async (props: any) => {
  const { pageNum, rowsPerPage, sortBy, descending } = props.pagination
  commentPagination.value.pageNum = pageNum
  commentPagination.value.rowsPerPage = rowsPerPage
  commentPagination.value.sortBy = sortBy
  commentPagination.value.descending = descending
  await loadComments()
}

// 显示回复对话框
const showReplyDialog = (comment: any) => {
  replyDialog.value.currentComment = comment
  replyDialog.value.content = comment.replyContent || ''
  replyDialog.value.show = true
}

// 处理回复
const handleReply = async () => {
  try {
    const response = await api.post('/admin/comment/reply', {
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

// 确认删除评论
const confirmDeleteComment = (comment: any) => {
  $q.dialog({
    title: '确认删除',
    message: '确定要删除该评论吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/comment/delete/${comment.prodCommId}`)

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
  loadProducts()
})
</script>

<style lang="scss" scoped>
.product-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .filter-section {
    margin-bottom: 20px;
  }

  .q-table {
    .q-img {
      border-radius: 4px;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
        cursor: pointer;
      }
    }
  }
}
</style>
