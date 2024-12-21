<template>
  <div class="return-management">
    <div class="page-header">
      <h1 class="text-h5">退货管理</h1>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-3">
              <q-input
                v-model="filters.orderNumber"
                label="订单号"
                dense
                outlined
                clearable
              />
            </div>
            <div class="col-12 col-sm-3">
              <q-input
                v-model="filters.userName"
                label="用户名"
                dense
                outlined
                clearable
              />
            </div>
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
            <div class="col-12 col-sm-3">
              <q-btn
                color="primary"
                icon="search"
                label="搜索"
                @click="loadReturns"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 退货列表 -->
    <q-table
      :rows="returns"
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
            :color="getStatusColor(props.value)"
            text-color="white"
            dense
          >
            {{ getStatusLabel(props.value) }}
          </q-chip>
        </q-td>
      </template>

      <!-- 凭证图片列 -->
      <template v-slot:body-cell-proofPics="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <q-img
              v-for="(pic, index) in JSON.parse(props.value || '[]')"
              :key="index"
              :src="pic"
              style="width: 50px; height: 50px"
              class="cursor-pointer"
              @click="showImagePreview(pic)"
            />
          </div>
        </q-td>
      </template>

      <!-- 操作列 -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              v-if="props.row.status === 0"
              flat
              round
              color="primary"
              icon="check_circle"
              @click="handleAudit(props.row, 1)"
            >
              <q-tooltip>同意</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.status === 0"
              flat
              round
              color="negative"
              icon="cancel"
              @click="handleAudit(props.row, 2)"
            >
              <q-tooltip>拒绝</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.status === 1"
              flat
              round
              color="positive"
              icon="local_shipping"
              @click="handleReceive(props.row)"
            >
              <q-tooltip>确认收货</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.status === 3"
              flat
              round
              color="primary"
              icon="payments"
              @click="handleRefund(props.row)"
            >
              <q-tooltip>确认退款</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- 审核对话框 -->
    <q-dialog v-model="auditDialog.show" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ auditDialog.type === 1 ? '同意退货' : '拒绝退货' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="auditDialog.remark"
            label="审核备注"
            type="textarea"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="确定" color="primary" @click="submitAudit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 退款对话框 -->
    <q-dialog v-model="refundDialog.show" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">确认退款</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="refundDialog.amount"
            label="退款金额"
            type="number"
            outlined
            prefix="￥"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="确定" color="primary" @click="submitRefund" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 图片预览 -->
    <q-dialog v-model="imagePreview.show">
      <q-card>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-img :src="imagePreview.url" style="max-width: 100%; max-height: 80vh" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'

const $q = useQuasar()

// 状态选项
const statusOptions = [
  { label: '待审核', value: 0 },
  { label: '已同意', value: 1 },
  { label: '已拒绝', value: 2 },
  { label: '已收货', value: 3 },
  { label: '已退款', value: 4 }
]

// 表格列定义
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'orderNumber', label: '订单号', field: 'orderNumber' },
  { name: 'userName', label: '用户名', field: 'userName' },
  { name: 'reason', label: '退货原因', field: 'reason' },
  { name: 'proofPics', label: '凭证图片', field: 'proofPics' },
  { name: 'status', label: '状态', field: 'status' },
  { name: 'createTime', label: '申请时间', field: 'createTime', sortable: true },
  { name: 'actions', label: '操作', field: 'actions' }
]

// 状态相关
const returns = ref([])
const loading = ref(false)
const filters = ref({
  orderNumber: '',
  userName: '',
  status: null
})

// 分页设置
const pagination = ref({
  sortBy: 'createTime',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 对话框状态
const auditDialog = ref({
  show: false,
  type: 1,
  remark: '',
  currentReturn: null
})

const refundDialog = ref({
  show: false,
  amount: 0,
  currentReturn: null
})

const imagePreview = ref({
  show: false,
  url: ''
})

// 获取状态标签和颜色
const getStatusLabel = (status: number) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option ? option.label : '未知'
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'info'
    case 2: return 'negative'
    case 3: return 'primary'
    case 4: return 'positive'
    default: return 'grey'
  }
}

// 加载退货列表
const loadReturns = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sort: pagination.value.sortBy,
      order: pagination.value.descending ? 'desc' : 'asc',
      ...filters.value
    }

    const response = await api.get('/order/returns/list', { params })
    const { code, data, total } = response.data

    if (code === 200) {
      returns.value = data
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载退货列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载退货列表失败'
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
  await loadReturns()
}

// 处理审核
const handleAudit = (returnData: any, type: number) => {
  auditDialog.value = {
    show: true,
    type,
    remark: '',
    currentReturn: returnData
  }
}

// 提交审核
const submitAudit = async () => {
  try {
    const response = await api.post('/order/returns/audit', {
      id: auditDialog.value.currentReturn.id,
      status: auditDialog.value.type,
      remark: auditDialog.value.remark
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '审核成功'
      })
      auditDialog.value.show = false
      loadReturns()
    }
  } catch (error) {
    console.error('审核失败:', error)
    $q.notify({
      type: 'negative',
      message: '审核失败'
    })
  }
}

// 确认收货
const handleReceive = async (returnData: any) => {
  try {
    const response = await api.post('/order/returns/receive', {
      id: returnData.id
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '确认收货成功'
      })
      loadReturns()
    }
  } catch (error) {
    console.error('确认收货失败:', error)
    $q.notify({
      type: 'negative',
      message: '确认收货失败'
    })
  }
}

// 处理退款
const handleRefund = (returnData: any) => {
  refundDialog.value = {
    show: true,
    amount: returnData.refundAmount || 0,
    currentReturn: returnData
  }
}

// 提交退款
const submitRefund = async () => {
  try {
    const response = await api.post('/order/returns/refund', {
      id: refundDialog.value.currentReturn.id,
      refundAmount: refundDialog.value.amount
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '退款成功'
      })
      refundDialog.value.show = false
      loadReturns()
    }
  } catch (error) {
    console.error('退款失败:', error)
    $q.notify({
      type: 'negative',
      message: '退款失败'
    })
  }
}

// 图片预览
const showImagePreview = (url: string) => {
  imagePreview.value = {
    show: true,
    url
  }
}

// 初始化
onMounted(() => {
  loadReturns()
})
</script>

<style lang="scss" scoped>
.return-management {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
  }
}
</style> 