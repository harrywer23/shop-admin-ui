<template>
  <div class="payment-management">
    <div class="page-header q-pb-md">
      <h1 class="text-h5 q-my-none">
        <q-icon name="payments" class="q-mr-sm" />
        支付订单管理
      </h1>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section q-mb-lg">
      <q-card flat bordered class="filter-card">
        <q-card-section>
          <div class="row q-col-gutter-md items-center">
            <!-- 订单号搜索 -->
            <div class="col-12 col-sm-3">
              <q-input
                v-model="filters.payId"
                label="支付订单号"
                dense
                outlined
                clearable
                class="filter-input"
                placeholder="请输入订单号"
              >
                <template v-slot:prepend>
                  <q-icon name="receipt" />
                </template>
              </q-input>
            </div>

            <!-- 用户名搜索 -->
            <div class="col-12 col-sm-3">
              <q-input
                v-model="filters.username"
                label="用户名"
                dense
                outlined
                clearable
                class="filter-input"
                placeholder="请输入用户名"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>

            <!-- 状态筛选 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.status"
                :options="statusOptions"
                label="支付状态"
                dense
                outlined
                clearable
                emit-value
                map-options
                class="filter-input"
              >
                <template v-slot:prepend>
                  <q-icon name="filter_list" />
                </template>
              </q-select>
            </div>

            <!-- 搜索按钮 -->
            <div class="col-12 col-sm-3">
              <q-btn
                color="primary"
                icon="search"
                label="搜索"
                @click="loadPayments"
                class="full-width"
                :loading="loading"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 支付订单列表 -->
    <q-table
      :rows="payments"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
      class="payments-table"
      flat
      bordered
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

      <!-- 金额列 -->
      <template v-slot:body-cell-amount="props">
        <q-td :props="props">
          <div>应付: ¥{{ props.row.total }}</div>
          <div>实付: ¥{{ props.row.actualTotal }}</div>
        </q-td>
      </template>

      <!-- 时间列 -->
      <template v-slot:body-cell-time="props">
        <q-td :props="props">
          <div>创建: {{ formatDateTime(props.row.createTime) }}</div>
          <div v-if="props.row.payTime">支付: {{ formatDateTime(props.row.payTime) }}</div>
        </q-td>
      </template>

      <!-- 商品名称列 -->
      <template v-slot:body-cell-prodName="props">
        <q-td :props="props" :data-content="props.value">
          <div class="ellipsis">{{ props.row.prodName }}</div>
        </q-td>
      </template>

      <!-- 操作列 -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <!-- 查看详情 -->
            <q-btn
              flat
              round
              color="primary"
              icon="visibility"
              @click="viewDetail(props.row)"
            >
              <q-tooltip>查看详情</q-tooltip>
            </q-btn>

            <!-- 取消订单 -->
            <q-btn
              v-if="props.row.status === 1"
              flat
              round
              color="negative"
              icon="cancel"
              @click="confirmCancel(props.row)"
            >
              <q-tooltip>取消订单</q-tooltip>
            </q-btn>

            <!-- 退款按钮 -->
            <q-btn
              v-if="props.row.status === 2"
              flat
              round
              color="warning"
              icon="money_off"
              @click="showRefundDialog(props.row)"
            >
              <q-tooltip>退款</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- 退款对话框 -->
    <q-dialog v-model="refundDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">订单退款</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleRefund" class="q-gutter-md">
            <!-- 退款金额 -->
            <q-input
              v-model.number="refundDialog.amount"
              type="number"
              label="退款金额"
              :rules="[
                val => !!val || '请输入退款金额',
                val => val > 0 || '退款金额必须大于0',
                val => val <= refundDialog.maxAmount || '退款金额不能超过支付金额'
              ]"
              outlined
              dense
            >
              <template v-slot:append>
                <q-btn
                  flat
                  dense
                  label="全额"
                  @click="refundDialog.amount = refundDialog.maxAmount"
                />
              </template>
            </q-input>

            <!-- 退款原因 -->
            <q-input
              v-model="refundDialog.reason"
              type="textarea"
              label="退款原因"
              :rules="[val => !!val || '请输��退款原因']"
              outlined
              autogrow
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="取消" color="primary" v-close-popup />
              <q-btn label="确认退款" color="negative" type="submit" />
            </div>
          </q-form>
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
import { date } from 'quasar'
import { api } from '~/utils/axios'

const $q = useQuasar()

// 支付订单接口
interface PaymentOrder {
  id: number
  amount: number
  paidAmount: number
  payId: string
  orderNumber: string
  prodName: string
  description: string
  createTime: string
  payTime: string | null
  status: number
  userId: number
  username: string
  country: string
  kind: number
  productId: number
  payType: string
  expiredTime: string
  requestId: string
  incomeUserId: number | null
}

// 状态选项
const statusOptions = [
  { label: '全部', value: null },
  { label: '等待支付', value: 1 },
  { label: '支付完成', value: 2 },
  { label: '已退款', value: 3 },
  { label: '已取消', value: 4 }
]

// 表格列定义
const columns = [
  {
    name: 'payId',
    label: '支付订单号',
    field: 'payId',
    sortable: true,
    align: 'left'
  },
  {
    name: 'orderNumber',
    label: '订单编号',
    field: 'orderNumber',
    align: 'left',
    style: 'max-width: 200px'
  },
  {
    name: 'prodName',
    label: '商品名称',
    field: 'prodName',
    align: 'left',
    style: 'max-width: 200px'
  },
  {
    name: 'actualTotal',
    label: '金额',
    field: 'actualTotal',
    align: 'right'
  },
  {
    name: 'userName',
    label: '用户名',
    field: 'userName',
    sortable: true,
    align: 'left'
  },
  {
    name: 'payType',
    label: '支付方式',
    field: 'payType',
    align: 'left'
  },
  {
    name: 'status',
    label: '状态',
    field: 'status',
    align: 'center'
  },
  {
    name: 'time',
    label: '时间',
    field: 'createTime',
    sortable: true,
    align: 'left'
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center'
  }
]

// 状态变量
const payments = ref<PaymentOrder[]>([])
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
  payId: '',
  username: '',
  status: null
})

// 退款对话框
const refundDialog = ref({
  show: false,
  currentOrder: null as PaymentOrder | null,
  amount: 0,
  maxAmount: 0,
  reason: ''
})

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 获取状态标签和颜色
const getStatusLabel = (status: number) => {
  switch (status) {
    case 1: return '等待支付'
    case 2: return '支付完成'
    case 3: return '已退款'
    case 4: return '已取消'
    default: return '未知状态'
  }
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 1: return 'warning'
    case 2: return 'positive'
    case 3: return 'negative'
    case 4: return 'grey'
    default: return 'grey'
  }
}

// 加载支付订单列表
const loadPayments = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sort: pagination.value.sortBy,
      order: pagination.value.descending ? 'desc' : 'asc',
      ...filters.value
    }

    const response = await api.get('/admin/payment/list', { params })
    const { code, data, total } = response.data

    if (code === 200) {
      payments.value = data
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载支付订单列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载订单列表失败'
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
  await loadPayments()
}

// 查看详情
const viewDetail = (order: PaymentOrder) => {
  // 实现查看详情逻辑
}

// 确认取消订单
const confirmCancel = (order: PaymentOrder) => {
  $q.dialog({
    title: '确认取消',
    message: '确定要取消该支付订单吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.post('/admin/payment/cancel', {
        payId: order.payId
      })

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '取消成功'
        })
        loadPayments()
      } else {
        throw new Error(msg || '取消失败')
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '取消失败'
      })
    }
  })
}

// 显示退款对话框
const showRefundDialog = (order: PaymentOrder) => {
  refundDialog.value.currentOrder = order
  refundDialog.value.amount = 0
  refundDialog.value.maxAmount = order.paidAmount
  refundDialog.value.reason = ''
  refundDialog.value.show = true
}

// 处理退款
const handleRefund = async () => {
  if (!refundDialog.value.currentOrder) return

  try {
    const response = await api.post('/admin/payment/refund', {
      payId: refundDialog.value.currentOrder.payId,
      amount: refundDialog.value.amount,
      reason: refundDialog.value.reason
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '退款成功'
      })
      refundDialog.value.show = false
      loadPayments()
    } else {
      throw new Error(msg || '退款失败')
    }
  } catch (error) {
    console.error('退款失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '退款失败'
    })
  }
}

// 初始化
onMounted(() => {
  loadPayments()
})
</script>

<style lang="scss" scoped>
.payment-management {
  padding: 20px;

  .page-header {
    border-bottom: 1px solid #e0e0e0;

    h1 {
      display: flex;
      align-items: center;
      color: #1976d2;
    }
  }

  .filter-card {
    background: #f8f9fa;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
  }

  .filter-input {
    .q-field__control {
      background: white;
    }
  }

  .payments-table {
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

      &:nth-child(2) {
        max-width: 200px;
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
          }
        }
      }
    }
  }

  // 优化状态芯片样式
  :deep(.q-chip) {
    font-weight: 500;
    min-width: 80px;
    justify-content: center;
  }

  // 优化按钮样式
  :deep(.q-btn) {
    &.q-btn--round {
      padding: 8px;
      margin: 0 4px;
    }
  }
}
</style>
