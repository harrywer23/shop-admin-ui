<template>
  <div class="topic-management">
    <div class="page-header">
      <h1 class="text-h5">论坛主题管理</h1>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- 分类筛选 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.categoryId"
                :options="categories"
                label="分类"
                option-label="name"
                option-value="id"
                dense
                outlined
                clearable
                emit-value
                map-options
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
              />
            </div>

            <!-- 关键词搜索 -->
            <div class="col-12 col-sm-3">
              <q-input
                v-model="filters.keyword"
                label="标题/内容"
                dense
                outlined
                clearable
              />
            </div>

            <!-- 搜索按钮 -->
            <div class="col-12 col-sm-3">
              <q-btn
                color="primary"
                icon="search"
                label="搜索"
                @click="loadTopics"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 主题列表 -->
    <q-table
      :rows="topics"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- 用户信息列 -->
      <template v-slot:body-cell-user="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-avatar size="28px">
              <img :src="props.row.userAvatar">
            </q-avatar>
            <span class="q-ml-sm">{{ props.row.userName }}</span>
          </div>
        </q-td>
      </template>

      <!-- 标题列 -->
      <template v-slot:body-cell-title="props">
        <q-td :props="props">
          <div>
            <q-chip
              v-if="props.row.isTop"
              color="primary"
              text-color="white"
              dense
              class="q-mr-sm"
            >
              置顶
            </q-chip>
            <q-chip
              v-if="props.row.isEssence"
              color="purple"
              text-color="white"
              dense
              class="q-mr-sm"
            >
              精华
            </q-chip>
            {{ props.row.title }}
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
            <!-- 查看按钮 -->
            <q-btn
              flat
              round
              color="primary"
              icon="visibility"
              @click="viewTopic(props.row)"
            >
              <q-tooltip>查看</q-tooltip>
            </q-btn>

            <!-- 置顶按钮 -->
            <q-btn
              flat
              round
              :color="props.row.isTop ? 'grey' : 'warning'"
              :icon="props.row.isTop ? 'vertical_align_bottom' : 'vertical_align_top'"
              @click="toggleTop(props.row)"
            >
              <q-tooltip>{{ props.row.isTop ? '取消置顶' : '置顶' }}</q-tooltip>
            </q-btn>

            <!-- 精华按钮 -->
            <q-btn
              flat
              round
              :color="props.row.isEssence ? 'grey' : 'purple'"
              :icon="props.row.isEssence ? 'stars' : 'star_outline'"
              @click="toggleEssence(props.row)"
            >
              <q-tooltip>{{ props.row.isEssence ? '取消精华' : '设为精华' }}</q-tooltip>
            </q-btn>

            <!-- 状态按钮 -->
            <q-btn
              flat
              round
              :color="props.row.status === 1 ? 'negative' : 'positive'"
              :icon="props.row.status === 1 ? 'visibility_off' : 'visibility'"
              @click="toggleStatus(props.row)"
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'

const router = useRouter()
const $q = useQuasar()

// 状态变量
const topics = ref([])
const categories = ref([])
const loading = ref(false)
const pagination = ref({
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 筛选条件
const filters = ref({
  categoryId: null,
  status: null,
  keyword: ''
})

// 状态选项
const statusOptions = [
  { label: '全部', value: null },
  { label: '待审核', value: 0 },
  { label: '已发布', value: 1 },
  { label: '已关闭', value: 2 }
]

// 表格列定义
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'user', label: '发布者', field: 'userName', align: 'left' },
  { name: 'title', label: '标题', field: 'title', align: 'left' },
  { name: 'categoryName', label: '分类', field: 'categoryName' },
  { name: 'views', label: '浏览', field: 'views', sortable: true },
  { name: 'likes', label: '点赞', field: 'likes', sortable: true },
  { name: 'comments', label: '评论', field: 'comments', sortable: true },
  { name: 'status', label: '状态', field: 'status' },
  { name: 'createdAt', label: '发布时间', field: 'createdAt', sortable: true },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' }
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

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await api.get('/admin/forum/category/list')
    const { code, data } = response.data
    if (code === 200) {
      categories.value = data
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载主题列表
const loadTopics = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sort: pagination.value.sortBy,
      order: pagination.value.descending ? 'desc' : 'asc',
      ...filters.value
    }

    const response = await api.get('/admin/forum/topic/list', { params })
    const { code, data, total } = response.data
    if (code === 200) {
      topics.value = data
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载主题列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载主题列表失败'
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
  await loadTopics()
}

// 查看主题
const viewTopic = (topic: any) => {
  router.push(`/forum/topic/${topic.id}`)
}

// 切换置顶状态
const toggleTop = async (topic: any) => {
  try {
    const response = await api.post('/admin/forum/topic/top', {
      id: topic.id,
      isTop: !topic.isTop
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: topic.isTop ? '已取消置顶' : '已置顶'
      })
      loadTopics()
    } else {
      throw new Error(msg || '操作失败')
    }
  } catch (error) {
    console.error('切换置顶状态失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '操作失败'
    })
  }
}

// 切换精华状态
const toggleEssence = async (topic: any) => {
  try {
    const response = await api.post('/admin/forum/topic/essence', {
      id: topic.id,
      isEssence: !topic.isEssence
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: topic.isEssence ? '已取消精华' : '已设为精华'
      })
      loadTopics()
    } else {
      throw new Error(msg || '操作失败')
    }
  } catch (error) {
    console.error('切换精华状态失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '操作失败'
    })
  }
}

// 切换状态
const toggleStatus = async (topic: any) => {
  try {
    const response = await api.post('/admin/forum/topic/status', {
      id: topic.id,
      status: topic.status === 1 ? 2 : 1
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: topic.status === 1 ? '已关闭' : '已发布'
      })
      loadTopics()
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

// 确认删除
const confirmDelete = (topic: any) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除主题 "${topic.title}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/forum/topic/${topic.id}`)

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadTopics()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除主题失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 初始化
onMounted(() => {
  loadCategories()
  loadTopics()
})
</script>

<style lang="scss" scoped>
.topic-management {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
  }

  .filter-section {
    margin-bottom: 20px;
  }
}
</style>
