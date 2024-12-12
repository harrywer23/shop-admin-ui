<template>
  <div class="order-management">
    <div class="page-header">
      <h1 class="text-h5">订单管理</h1>

      <!-- 搜索和筛选工具栏 -->
      <div class="filter-section q-mb-md">
        <q-card flat bordered>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <!-- 订单号搜索 -->
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="filters.orderNumber"
                  label="订单号"
                  dense
                  outlined
                  clearable
                />
              </div>

              <!-- 订单状态筛选 -->
              <div class="col-12 col-sm-3">
                <q-select
                  v-model="filters.status"
                  :options="orderStatusOptions"
                  label="订单状态"
                  dense
                  outlined
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- 时间范围筛选 -->
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="filters.dateRange"
                  label="下单时间"
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
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <!-- 搜索按钮 -->
              <div class="col-12 col-sm-2">
                <q-btn
                  color="primary"
                  icon="search"
                  label="搜索"
                  @click="loadOrders"
                  class="full-width"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 订单列表 -->
    <q-table
      :rows="orders"
      :columns="columns"
      row-key="orderId"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
      class="orders-table"
      flat
      bordered
    >
      <!-- 订单号列 -->
      <template v-slot:body-cell-orderNumber="props">
        <q-td :props="props" :data-content="props.value">
          <div class="ellipsis">{{ props.value }}</div>
        </q-td>
      </template>

      <!-- 商品名称列 -->
      <template v-slot:body-cell-prodName="props">
        <q-td :props="props" :data-content="props.value">
          <div class="ellipsis">{{ props.value }}</div>
        </q-td>
      </template>

      <!-- 金额列 -->
      <template v-slot:body-cell-total="props">
        <q-td :props="props">
          <div>应付: ¥{{ props.value.total.toFixed(2) }}</div>
          <div>实付: ¥{{ props.value.actualTotal.toFixed(2) }}</div>
        </q-td>
      </template>

      <!-- 用户ID列 -->
      <template v-slot:body-cell-userId="props">
        <q-td :props="props" :data-content="props.value">
          <div class="ellipsis">{{ props.value }}</div>
        </q-td>
      </template>

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

      <!-- 操作列 -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <!-- 发货按钮 -->
            <q-btn
              v-if="props.row.status === OrderStatus.PAID"
              flat
              dense
              color="primary"
              icon="local_shipping"
              @click="showShipDialog(props.row)"
            >
              <q-tooltip>发货</q-tooltip>
            </q-btn>

            <!-- 退款按钮 -->
            <q-btn
              v-if="canRefund(props.row)"
              flat
              dense
              color="negative"
              icon="money_off"
              @click="showRefundDialog(props.row)"
            >
              <q-tooltip>退款</q-tooltip>
            </q-btn>

            <!-- 取消订单按钮 -->
            <q-btn
              v-if="props.row.status === OrderStatus.UNPAID"
              flat
              dense
              color="grey"
              icon="cancel"
              @click="confirmCancel(props.row)"
            >
              <q-tooltip>取消订单</q-tooltip>
            </q-btn>

            <!-- 备注按钮 -->
            <q-btn
              flat
              dense
              color="amber"
              icon="note"
              @click="showRemarkDialog(props.row)"
            >
              <q-tooltip>添加备注</q-tooltip>
            </q-btn>

            <!-- 查看详情按钮 -->
            <q-btn
              flat
              dense
              color="info"
              icon="visibility"
              @click="viewOrderDetail(props.row)"
            >
              <q-tooltip>查看详情</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- 发货对话框 -->
    <q-dialog v-model="shipDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">订单发货</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleShip" class="q-gutter-md">
            <!-- 物流公司选择 -->
            <q-select
              v-model="shipDialog.data.delivery"
              :options="deliveryCompanies"
              label="物流公司"
              option-label="dvyName"
              option-value="dvyId"
              :rules="[val => !!val || '请选择物流公司']"
              outlined
              dense
            />

            <!-- 物流单号输入 -->
            <q-input
              v-model="shipDialog.data.dvyFlowId"
              label="物流单号"
              :rules="[val => !!val || '请输入物流单号']"
              outlined
              dense
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="取消" color="primary" v-close-popup />
              <q-btn label="确认发货" color="primary" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

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
            <!-- 退款金额输入 -->
            <q-input
              v-model.number="refundDialog.data.refundAmount"
              label="退款金额"
              type="number"
              :rules="[
                val => !!val || '请输入退款金额',
                val => val > 0 || '退款金额必须大于0',
                val => val <= refundDialog.maxAmount || '退款金额不能超过订单金额'
              ]"
              outlined
              dense
            >
              <template v-slot:append>
                <q-btn
                  flat
                  dense
                  label="全额"
                  @click="refundDialog.data.refundAmount = refundDialog.maxAmount"
                />
              </template>
            </q-input>

            <!-- 退款原因输入 -->
            <q-input
              v-model="refundDialog.data.refundReason"
              label="退款原因"
              type="textarea"
              :rules="[val => !!val || '请输入退款原因']"
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

    <!-- 备注对话框 -->
    <q-dialog v-model="remarkDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">订单备注</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleRemark" class="q-gutter-md">
            <q-input
              v-model="remarkDialog.data.remarks"
              label="备注内容"
              type="textarea"
              :rules="[val => !!val || '请输入备注内容']"
              outlined
              autogrow
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="取消" color="primary" v-close-popup />
              <q-btn label="保存" color="primary" type="submit" />
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
import { useRouter } from 'vue-router'
import { api } from '~/utils/axios'
import {orderStatusOptions,OrderStatus} from "~/utils/constants";

const $q = useQuasar()
const router = useRouter()

// 表格列定义
const columns = [
  { 
    name: 'orderNumber', 
    label: '订单号', 
    field: 'orderNumber', 
    sortable: true,
    align: 'left' as const,
    style: 'max-width: 160px'
  },
  { 
    name: 'prodName', 
    label: '商品名称', 
    field: 'prodName',
    align: 'left' as const,
    style: 'max-width: 200px'
  },
  { 
    name: 'total', 
    label: '订单金额', 
    field: row => {
      return {
        total: row.total,
        actualTotal: row.actualTotal
      }
    },
    align: 'right' as const
  },
  { 
    name: 'userId', 
    label: '用户ID', 
    field: 'userId',
    align: 'left' as const
  },
  { 
    name: 'status', 
    label: '状态', 
    field: 'status',
    align: 'center' as const
  },
  { 
    name: 'createTime', 
    label: '创建时间', 
    field: 'createTime',
    sortable: true,
    align: 'left' as const
  },
  { 
    name: 'actions', 
    label: '操作', 
    field: 'actions',
    align: 'center' as const
  }
]

// 状态变量
const orders = ref([])
const loading = ref(false)
const pagination = ref({
  sortBy: 'createTime',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 筛选条件
interface DateRange {
  from?: string
  to?: string
}

const filters = ref({
  orderNumber: '',
  status: null,
  dateRange: null as DateRange | null
})

// 发货对话框
const shipDialog = ref({
  show: false,
  data: {
    orderId: null,
    delivery: null,
    dvyFlowId: ''
  }
})

// 退款对话框
const refundDialog = ref({
  show: false,
  data: {
    orderId: null,
    refundAmount: 0,
    refundReason: ''
  },
  maxAmount: 0
})

// 备注对话框
const remarkDialog = ref({
  show: false,
  data: {
    orderId: null,
    remarks: ''
  }
})

// 物流公司列表
const deliveryCompanies = ref([])

// 加载物流公司
const loadDeliveryCompanies = async () => {
  try {
    const response = await api.get('/admin/delivery/list')
    const { code, data } = response.data
    if (code === 200) {
      deliveryCompanies.value = data
    }
  } catch (error) {
    console.error('加载物流公司失败:', error)
  }
}

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      orderNumber: filters.value.orderNumber,
      status: filters.value.status,
      startTime: filters.value.dateRange?.from,
      endTime: filters.value.dateRange?.to
    }

    const response = await api.get('/admin/order/list', { params })
    const { code, data, total } = response.data

    if (code === 200) {
      orders.value = data
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载订单列表失败:', error)
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
  await loadOrders()
}

// 获取状态标签
const getStatusLabel = (status: OrderStatus) => {
  const option = orderStatusOptions.find(opt => opt.value === status)
  return option ? option.label : '未知状态'
}

// 获取状态颜色
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.UNPAID:
      return 'warning'
    case OrderStatus.PAID:
      return 'info'
    case OrderStatus.SHIPPED:
      return 'primary'
    case OrderStatus.COMPLETED:
      return 'positive'
    case OrderStatus.CANCELLED:
    case OrderStatus.REFUNDED:
      return 'negative'
    case OrderStatus.REFUNDING:
      return 'orange'
    default:
      return 'grey'
  }
}

// 显示发货对话框
const showShipDialog = (order: any) => {
  shipDialog.value.data = {
    orderId: order.orderId,
    delivery: null,
    dvyFlowId: ''
  }
  shipDialog.value.show = true
}

// 处理发货
const handleShip = async () => {
  try {
    const response = await api.post('/admin/order/ship', shipDialog.value.data)
    const { code, msg } = response.data

    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '发货成功'
      })
      shipDialog.value.show = false
      loadOrders()
    } else {
      throw new Error(msg || '发货失败')
    }
  } catch (error) {
    console.error('发货失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '发货失败'
    })
  }
}

// 判断是否可以退款
const canRefund = (order: any) => {
  return [OrderStatus.PAID, OrderStatus.SHIPPED].includes(order.status)
}

// 显示退款对话框
const showRefundDialog = (order: any) => {
  refundDialog.value.data = {
    orderId: order.orderId,
    refundAmount: 0,
    refundReason: ''
  }
  refundDialog.value.maxAmount = order.actualTotal
  refundDialog.value.show = true
}

// 处理退款
const handleRefund = async () => {
  try {
    const response = await api.post('/admin/order/refund', refundDialog.value.data)
    const { code, msg } = response.data

    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '退款成功'
      })
      refundDialog.value.show = false
      loadOrders()
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

// 确认取消订单
const confirmCancel = (order: any) => {
  $q.dialog({
    title: '确认取消',
    message: '确定要取消该订单吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.get(`/admin/order/cancel/${order.orderId}`)
      const { code, msg } = response.data

      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '订单已取消'
        })
        loadOrders()
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

// 显示备注对话框
const showRemarkDialog = (order: any) => {
  remarkDialog.value.data = {
    orderId: order.orderId,
    remarks: order.remarks || ''
  }
  remarkDialog.value.show = true
}

// 处理备注
const handleRemark = async () => {
  try {
    const response = await api.post('/admin/order/remark', remarkDialog.value.data)
    const { code, msg } = response.data

    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '备注已保存'
      })
      remarkDialog.value.show = false
      loadOrders()
    } else {
      throw new Error(msg || '保存失败')
    }
  } catch (error) {
    console.error('保存备注失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  }
}

// 查看订单详情
const viewOrderDetail = (order: any) => {
  router.push(`/admin/order/detail?orderNumber=${order.orderNumber}`)
}

// 初始化
onMounted(() => {
  loadDeliveryCompanies()
  loadOrders()
})
</script>

<style lang="scss" scoped>
.orders-management {
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

  .orders-table {
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

      // 订单号列样式
      &:nth-child(1) {
        max-width: 160px;
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

      // 商品名称列样式
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
            max-width: 300px;
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

  // 筛选区域样式
  .filter-section {
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
  }
}
</style>
