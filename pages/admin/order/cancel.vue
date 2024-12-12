<template>
  <div class="cancel-audit-page q-pa-md">
    <div class="header-section q-mb-md">
      <div class="row items-center justify-between">
        <div class="text-h6">订单取消审核</div>
        <q-btn-group>
          <q-btn
            :color="activeTab === 'pending' ? 'primary' : 'grey'"
            :label="`待审核 (${pendingCount})`"
            @click="activeTab = 'pending'"
          />
          <q-btn
            :color="activeTab === 'processed' ? 'primary' : 'grey'"
            label="已处理"
            @click="activeTab = 'processed'"
          />
        </q-btn-group>
      </div>
    </div>

    <q-table
      :rows="displayedRequests"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :filter="filter"
      flat
      bordered
    >
      <!-- 搜索栏 -->
      <template v-slot:top>
        <div class="row full-width">
          <q-input
            v-model="filter"
            placeholder="搜索订单号/用户名"
            dense
            clearable
            class="col-3 q-mr-sm"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          
          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            label="取消原因"
            dense
            clearable
            class="col-2 q-mr-sm"
          />

          <q-date
            v-model="dateRange"
            range
            dense
            class="col-3"
          />
        </div>
      </template>

      <!-- 取消原因列 -->
      <template v-slot:body-cell-reason="props">
        <q-td :props="props">
          <div class="text-body2">{{ props.row.reason }}</div>
          <div class="text-caption text-grey">{{ props.row.description }}</div>
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
          <div class="row items-center no-wrap">
            <q-btn
              v-if="props.row.status === 'pending'"
              flat
              round
              color="positive"
              icon="check_circle"
              @click="approveRequest(props.row)"
            >
              <q-tooltip>批准</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.status === 'pending'"
              flat
              round
              color="negative"
              icon="cancel"
              @click="rejectRequest(props.row)"
            >
              <q-tooltip>拒绝</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="primary"
              icon="visibility"
              @click="viewOrderDetails(props.row.orderId)"
            >
              <q-tooltip>查看订单</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- 审核对话框 -->
    <q-dialog v-model="auditDialog.show" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ auditDialog.type === 'approve' ? '批准' : '拒绝' }}取消申请</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="auditDialog.remark"
            type="textarea"
            label="审核备注"
            :placeholder="`请输入${auditDialog.type === 'approve' ? '批准' : '拒绝'}原因`"
            outlined
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey" v-close-popup />
          <q-btn
            flat
            label="确定"
            color="primary"
            @click="submitAudit"
            :loading="auditDialog.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const $q = useQuasar()
const router = useRouter()

// 表格列定义
const columns = [
  { 
    name: 'orderNumber', 
    label: '订单号', 
    field: 'orderNumber', 
    align: 'left' as const,
    sortable: true 
  },
  { 
    name: 'userName', 
    label: '用户名', 
    field: 'userName', 
    align: 'left' as const 
  },
  { 
    name: 'amount', 
    label: '订��金额', 
    field: 'amount', 
    align: 'right' as const,
    format: (val: number) => `¥${val.toFixed(2)}`,
    sortable: true
  },
  { 
    name: 'reason', 
    label: '取消原因', 
    field: 'reason', 
    align: 'left' as const 
  },
  { 
    name: 'createTime', 
    label: '申请时间', 
    field: 'createTime', 
    align: 'center' as const,
    sortable: true 
  },
  { 
    name: 'status', 
    label: '状态', 
    field: 'status', 
    align: 'center' as const 
  },
  { 
    name: 'actions', 
    label: '操作', 
    align: 'center' as const 
  }
]

// 状态数据
const loading = ref(false)
const activeTab = ref('pending')
const filter = ref('')
const statusFilter = ref(null)
const dateRange = ref({ from: '', to: '' })
const cancelRequests = ref([])
const pendingCount = ref(0)

// 状态选项
const statusOptions = [
  { label: '商品缺货', value: 'out_of_stock' },
  { label: '价格变动', value: 'price_change' },
  { label: '重复下单', value: 'duplicate_order' },
  { label: '其他原因', value: 'other' }
]

// 审核对话框状态
const auditDialog = ref({
  show: false,
  type: '',
  remark: '',
  loading: false,
  currentRequest: null as any
})

// 获取状态标签
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    approved: 'positive',
    rejected: 'negative'
  }
  return colorMap[status] || 'grey'
}

// 计算显示的请求列表
const displayedRequests = computed(() => {
  let filtered = cancelRequests.value.filter(request => {
    // 根据当前标签筛选
    if (activeTab.value === 'pending' && request.status !== 'pending') return false
    if (activeTab.value === 'processed' && request.status === 'pending') return false
    
    // 搜索过滤
    if (filter.value) {
      const searchText = filter.value.toLowerCase()
      if (!request.orderNumber.toLowerCase().includes(searchText) &&
          !request.userName.toLowerCase().includes(searchText)) {
        return false
      }
    }
    
    // 状态过滤
    if (statusFilter.value && request.reason !== statusFilter.value) {
      return false
    }
    
    // 日期范围过滤
    if (dateRange.value.from && dateRange.value.to) {
      const requestDate = new Date(request.createTime)
      const fromDate = new Date(dateRange.value.from)
      const toDate = new Date(dateRange.value.to)
      if (requestDate < fromDate || requestDate > toDate) {
        return false
      }
    }
    
    return true
  })
  
  return filtered
})

// 加载取消申请列表
const loadCancelRequests = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/order/cancel/list')
    if (response.data.code === 200) {
      cancelRequests.value = response.data.data
      pendingCount.value = cancelRequests.value.filter(r => r.status === 'pending').length
    }
  } catch (error) {
    console.error('加载取消申请失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载取消申请失败'
    })
  } finally {
    loading.value = false
  }
}

// 批准申请
const approveRequest = (request: any) => {
  auditDialog.value.type = 'approve'
  auditDialog.value.currentRequest = request
  auditDialog.value.remark = ''
  auditDialog.value.show = true
}

// 拒绝申请
const rejectRequest = (request: any) => {
  auditDialog.value.type = 'reject'
  auditDialog.value.currentRequest = request
  auditDialog.value.remark = ''
  auditDialog.value.show = true
}

// 提交审核
const submitAudit = async () => {
  if (!auditDialog.value.remark) {
    $q.notify({
      type: 'warning',
      message: '请输入审核备注'
    })
    return
  }

  auditDialog.value.loading = true
  try {
    const url = `/admin/order/cancel/${auditDialog.value.type}`
    const response = await api.post(url, {
      requestId: auditDialog.value.currentRequest.id,
      remark: auditDialog.value.remark
    })
    
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: `${auditDialog.value.type === 'approve' ? '批准' : '拒绝'}成功`
      })
      auditDialog.value.show = false
      loadCancelRequests()
    }
  } catch (error) {
    console.error('提交审核失败:', error)
    $q.notify({
      type: 'negative',
      message: '提交审核失败'
    })
  } finally {
    auditDialog.value.loading = false
  }
}

// 查看订单详情
const viewOrderDetails = (orderId: string) => {
  router.push(`/admin/order/detail/${orderId}`)
}

// 初始化
onMounted(() => {
  loadCancelRequests()
})
</script>

<style lang="scss" scoped>
.cancel-audit-page {
  .q-table {
    background: white;
  }

  .q-btn {
    margin: 0 4px;
    
    &:hover {
      opacity: 0.8;
    }
  }
}
</style> 