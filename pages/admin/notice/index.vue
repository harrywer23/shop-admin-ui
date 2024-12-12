<template>
  <div class="notice-management">
    <div class="page-header">
      <h1 class="text-h5">公告管理</h1>
      <q-btn
        color="primary"
        icon="add"
        label="新增公告"
        @click="$router.push('/admin/notice/edit')"
      />
    </div>

    <!-- 公告列表 -->
    <q-table
      :rows="notices"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
      class="notices-table"
      flat
      bordered
    >
      <!-- 添加标题列的自定义插槽 -->
      <template v-slot:body-cell-title="props">
        <q-td :props="props" :data-content="props.value">
          <div class="ellipsis cursor-pointer" @click="$router.push(`/admin/notice/detail?id=${props.row.id}`)">
            {{ props.value }}
          </div>
        </q-td>
      </template>

      <!-- 添加内容列的自定义插槽 -->
      <template v-slot:body-cell-content="props">
        <q-td :props="props" :data-content="props.value">
          <div class="content-preview" v-html="getContentPreview(props.value)"></div>
        </q-td>
      </template>

      <!-- 状态列 -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.status ? 'positive' : 'negative'"
            text-color="white"
            dense
          >
            {{ props.row.status ? '已发布' : '已撤回' }}
          </q-chip>
        </q-td>
      </template>

      <!-- 置顶列 -->
      <template v-slot:body-cell-isTop="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.isTop ? 'primary' : 'grey'"
            text-color="white"
            dense
          >
            {{ props.row.isTop ? '已置顶' : '未置顶' }}
          </q-chip>
        </q-td>
      </template>

      <!-- 操作列 -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              @click="$router.push(`/admin/notice/edit?id=${props.row.id}`)"
            >
              <q-tooltip>编辑</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              :color="props.row.status ? 'negative' : 'positive'"
              :icon="props.row.status ? 'visibility_off' : 'visibility'"
              @click="toggleStatus(props.row)"
            >
              <q-tooltip>{{ props.row.status ? '撤回' : '发布' }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              :color="props.row.isTop ? 'grey' : 'warning'"
              :icon="props.row.isTop ? 'vertical_align_bottom' : 'vertical_align_top'"
              @click="toggleTop(props.row)"
            >
              <q-tooltip>{{ props.row.isTop ? '取消置顶' : '置顶' }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>删除</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { date } from 'quasar'
import { api } from '~/utils/axios'
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});
const $q = useQuasar()

// 公告接口定义
interface Translations {
  zh: string
  en: string
  zhTw: string
  ja: string
  ko: string
}

interface Notice {
  id: number | null
  title: string
  content: string
  status: boolean
  isTop: boolean
  publishTime: string
  updateTime: string
  translations: string
  translationsContent: string
  translationsI18n: Translations
  translationsContentI18n: Translations
}

// 表格列定义
const columns = [
  { 
    name: 'id', 
    label: 'ID', 
    field: 'id', 
    sortable: true,
    align: 'left' as const
  },
  { 
    name: 'title', 
    label: '标题', 
    field: 'title', 
    sortable: true,
    align: 'left' as const,
    style: 'max-width: 200px'
  },
  { 
    name: 'content', 
    label: '内容', 
    field: 'content',
    align: 'left' as const,
    style: 'max-width: 300px'
  },
  { 
    name: 'status', 
    label: '状态', 
    field: 'status',
    align: 'center' as const
  },
  { 
    name: 'isTop', 
    label: '置顶', 
    field: 'isTop',
    align: 'center' as const
  },
  { 
    name: 'publishTime', 
    label: '发布时间', 
    field: 'publishTime', 
    sortable: true,
    align: 'left' as const,
    format: (val: string) => val ? date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') : '-'
  },
  { 
    name: 'updateTime', 
    label: '更新时间', 
    field: 'updateTime', 
    sortable: true,
    align: 'left' as const,
    format: (val: string) => val ? date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') : '-'
  },
  { 
    name: 'actions', 
    label: '操作', 
    field: 'actions',
    align: 'center' as const
  }
]

// 状态变量
const notices = ref<Notice[]>([])
const loading = ref(false)
const pagination = ref({
  sortBy: 'publishTime',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 加载公告列表
const loadNotices = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sort: pagination.value.sortBy,
      order: pagination.value.descending ? 'desc' : 'asc'
    }

    const response = await api.get('/admin/notice/list', { params })
    const { code, data, total } = response.data

    if (code === 200) {
      notices.value = data.map((notice: Notice) => ({
        ...notice,
        translationsI18n: notice.translations ? JSON.parse(notice.translations) : {},
        translationsContentI18n: notice.translationsContent ? JSON.parse(notice.translationsContent) : {}
      }))
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载公告列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载公告列表失败'
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
  await loadNotices()
}

// 切换状态
const toggleStatus = async (notice: Notice) => {
  try {
    const response = await api.post('/admin/notice/status', {
      id: notice.id,
      status: !notice.status
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: notice.status ? '已撤回' : '已发布'
      })
      loadNotices()
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

// 切换置顶
const toggleTop = async (notice: Notice) => {
  try {
    const response = await api.post('/admin/notice/top', {
      id: notice.id,
      isTop: !notice.isTop
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: notice.isTop ? '已取消置顶' : '已置顶'
      })
      loadNotices()
    } else {
      throw new Error(msg || '操作失败')
    }
  } catch (error) {
    console.error('切换置顶失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '操作失败'
    })
  }
}

// 确认删除
const confirmDelete = (notice: Notice) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除公告 "${notice.title}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/notice/${notice.id}`)

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadNotices()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除公告失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 初始化
onMounted(() => {
  loadNotices()
})

// 在script部分添加内容预览处理函数
const getContentPreview = (content: string) => {
  if (!content) return '-'
  // 移除HTML标签，只保留文本
  const plainText = content.replace(/<[^>]+>/g, '')
  // 截取前100个字符
  return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText
}
</script>

<style lang="scss" scoped>
.notice-management {
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

  .notices-table {
    background: white;
    border-radius: 8px;
    
    .q-table__card {
      box-shadow: none;
    }

    :deep(.q-table th) {
      font-weight: 600;
      background: #f5f5f5;
    }

    :deep(.q-table tr:hover td) {
      background-color: #f0f7ff;
    }

    :deep(.q-table td) {
      &.text-left {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      // 标题列样式
      &:nth-child(2) {
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        
        .ellipsis {
          &:hover {
            color: #1976d2;
            text-decoration: underline;
          }
        }
        
        &:hover {
          position: relative;
          overflow: visible;
          z-index: 1;

          &:after {
            content: attr(data-content);
            position: absolute;
            left: 0;
            top: 0;
            background: white;
            padding: 8px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.12);
            white-space: normal;
            word-break: break-all;
            min-width: 100%;
          }
        }
      }

      // 修改内容列样式
      .content-preview {
        max-width: 300px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        
        &:hover {
          position: relative;
          overflow: visible;
          z-index: 1;

          &:after {
            content: attr(data-content);
            position: absolute;
            left: 0;
            top: 0;
            background: white;
            padding: 8px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.12);
            white-space: normal;
            word-break: break-all;
            min-width: 100%;
            max-width: 400px;
            max-height: 200px;
            overflow-y: auto;
          }
        }
      }
    }
  }

  // 优化状态和置顶芯片样式
  :deep(.q-chip) {
    font-weight: 500;
    min-width: 80px;
    justify-content: center;
  }

  // 优化按钮组样式
  :deep(.q-btn-group) {
    .q-btn {
      padding: 4px 8px;
      margin: 0 2px;
      
      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }

  // 编辑对话��中的翻译部分样式
  .translations-section {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fafafa;

    .text-subtitle2 {
      color: #666;
      font-weight: 500;
      margin-bottom: 12px;
    }
  }
}
</style>
