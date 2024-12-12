<template>
  <div class="message-management">
    <div class="page-header">
      <h1 class="text-h5">消息管理</h1>
      <q-btn
        color="primary"
        icon="add"
        label="创建消息"
        @click="showCreateDialog"
      />
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- 用户名搜索 -->
            <div class="col-12 col-sm-3">
              <q-input
                v-model="filters.userName"
                label="用户名"
                dense
                outlined
                clearable
              />
            </div>

            <!-- 邮箱搜索 -->
            <div class="col-12 col-sm-3">
              <q-input
                v-model="filters.email"
                label="邮箱"
                dense
                outlined
                clearable
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

            <!-- 搜索按钮 -->
            <div class="col-12 col-sm-3">
              <q-btn
                color="primary"
                icon="search"
                label="搜索"
                @click="loadMessages"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 消息列表 -->
    <q-table
      :rows="messages"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- 状态列 -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.status ? 'positive' : 'warning'"
            text-color="white"
            dense
          >
            {{ props.row.status ? '已审核' : '待审核' }}
          </q-chip>
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

            <!-- 审核/取消审核按钮 -->
            <q-btn
              flat
              round
              :color="props.row.status ? 'negative' : 'positive'"
              :icon="props.row.status ? 'cancel' : 'check_circle'"
              @click="toggleStatus(props.row)"
            >
              <q-tooltip>{{ props.row.status ? '取消审核' : '审核通过' }}</q-tooltip>
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
    <q-dialog v-model="replyDialog.show" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">回���消息</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <!-- 原消息内容 -->
          <div class="original-message q-pa-md bg-grey-2 rounded-borders">
            <div class="text-subtitle2">原消息：</div>
            <div class="q-mt-sm">{{ replyDialog.currentMessage?.content }}</div>
            <div class="row q-mt-sm items-center text-caption text-grey">
              <div>{{ replyDialog.currentMessage?.userName }}</div>
              <div class="q-mx-sm">|</div>
              <div>{{ replyDialog.currentMessage?.email }}</div>
              <div class="q-mx-sm">|</div>
              <div>{{ formatDateTime(replyDialog.currentMessage?.createTime) }}</div>
            </div>
          </div>

          <!-- 回复内容 -->
          <q-form @submit="handleReply" class="q-mt-md">
            <q-input
              v-model="replyDialog.content"
              type="textarea"
              label="回复内容"
              :rules="[val => !!val || '请输入回复内容']"
              outlined
              autogrow
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="取消" color="primary" v-close-popup />
              <q-btn label="回复" color="primary" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 创建消息对话框 -->
    <q-dialog v-model="createDialog.show" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">创建消息</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleCreate">
            <q-input
              v-model="createDialog.form.userName"
              label="用户名"
              :rules="[val => !!val || '请输入用户名']"
              outlined
              class="q-mb-md"
            />
            <q-input
              v-model="createDialog.form.email"
              label="邮箱"
              :rules="[val => !!val || '请输入邮箱']"
              outlined
              class="q-mb-md"
            />
            <q-input
              v-model="createDialog.form.contact"
              label="联系方式"
              outlined
              class="q-mb-md"
            />
            <q-input
              v-model="createDialog.form.content"
              type="textarea"
              label="消息内容"
              :rules="[val => !!val || '请输入消息内容']"
              outlined
              autogrow
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="取消" color="primary" v-close-popup />
              <q-btn label="创建" color="primary" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
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

// 消息接口定义
interface Message {
  id: number
  userName: string
  email: string
  contact: string
  content: string
  reply: string | null
  status: number
  createTime: string
}

// 状态选项
const statusOptions = [
  { label: '全部', value: null },
  { label: '待审核', value: 0 },
  { label: '已审核', value: 1 }
]

// 表格列定义
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'userName', label: '用户名', field: 'userName', sortable: true },
  { name: 'email', label: '邮箱', field: 'email' },
  { name: 'contact', label: '联系方式', field: 'contact' },
  { name: 'content', label: '消息内容', field: 'content' },
  { name: 'reply', label: '回复内容', field: 'reply' },
  { name: 'status', label: '状态', field: 'status' },
  { name: 'createTime', label: '创建时间', field: 'createTime', sortable: true,
    format: (val: string) => formatDateTime(val)
  },
  { name: 'actions', label: '操作', field: 'actions' }
]

// 状态变量
const messages = ref<Message[]>([])
const loading = ref(false)
const pagination = ref({
  sortBy: 'createTime',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 筛选条件
const filters = ref({
  userName: '',
  email: '',
  status: null
})

// 回复对话框
const replyDialog = ref({
  show: false,
  content: '',
  currentMessage: null as Message | null
})

// 创建消息对话框
const createDialog = ref({
  show: false,
  form: {
    userName: '',
    email: '',
    contact: '',
    content: '',
    status: 0
  }
})

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 加载消息列表
const loadMessages = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sort: pagination.value.sortBy,
      order: pagination.value.descending ? 'desc' : 'asc',
      ...filters.value
    }

    const response = await api.get('/admin/message/list', { params })
    const { code, data, total } = response.data

    if (code === 200) {
      messages.value = data
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载消息列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载消息列表失败'
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
  await loadMessages()
}

// 显示回复对话框
const showReplyDialog = (message: Message) => {
  replyDialog.value.currentMessage = message
  replyDialog.value.content = message.reply || ''
  replyDialog.value.show = true
}

// 处理回复
const handleReply = async () => {
  if (!replyDialog.value.currentMessage) return

  try {
    const response = await api.post('/admin/message/reply', {
      id: replyDialog.value.currentMessage.id,
      reply: replyDialog.value.content
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '回复成功'
      })
      replyDialog.value.show = false
      loadMessages()
    } else {
      throw new Error(msg || '回复失败')
    }
  } catch (error) {
    console.error('回复消息失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '回复失败'
    })
  }
}

// 切换状态
const toggleStatus = async (message: Message) => {
  try {
    const response = await api.post('/admin/message/status', {
      id: message.id,
      status: message.status ? 0 : 1
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: message.status ? '已取消审核' : '已审核通过'
      })
      loadMessages()
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
const confirmDelete = (message: Message) => {
  $q.dialog({
    title: '确认删除',
    message: '确定要删除该消息吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/message/${message.id}`)

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadMessages()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除消息失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 显示创建对话框
const showCreateDialog = () => {
  createDialog.value.form = {
    userName: '',
    email: '',
    contact: '',
    content: '',
    status: 0
  }
  createDialog.value.show = true
}

// 处理创建消息
const handleCreate = async () => {
  try {
    const response = await api.post('/admin/message', createDialog.value.form)
    const { code, msg } = response.data
    
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '创建成功'
      })
      createDialog.value.show = false
      loadMessages()
    } else {
      throw new Error(msg || '创建失败')
    }
  } catch (error) {
    console.error('创建消息失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '创建失败'
    })
  }
}

// 初始化
onMounted(() => {
  loadMessages()
})
</script>

<style lang="scss" scoped>
.message-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .original-message {
    border-left: 4px solid var(--q-primary);
  }
}
</style>
