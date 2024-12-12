`<template>
  <div class="refund-list-page">
    <!-- 搜索栏 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-3">
            <q-input
              v-model="filters.orderNumber"
              label="订单号"
              clearable
              dense
              outlined
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-input
              v-model="filters.refundSn"
              label="退款编号"
              clearable
              dense
              outlined
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filters.refundSts"
              :options="REFUND_STATUS_OPTIONS"
              label="退款状态"
              clearable
              dense
              outlined
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filters.applyType"
              :options="REFUND_APPLY_TYPE_OPTIONS"
              label="申请类型"
              clearable
              dense
              outlined
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="filters.dateRange"
              label="申请时间"
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
          <div class="col-12 col-sm-6 row items-center justify-end">
            <q-btn
              color="primary"
              icon="search"
              label="搜索"
              @click="loadRefunds"
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
          :rows="refunds"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="refundId"
          @request="onRequest"
        >
          <!-- 状态列 -->
          <template v-slot:body-cell-refundSts="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.row.refundSts)"
                text-color="white"
                dense
              >
                {{ getStatusLabel(props.row.refundSts) }}
              </q-chip>
            </q-td>
          </template>

          <!-- 操作列 -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                color="primary"
                icon="visibility"
                size="sm"
                @click="viewDetails(props.row)"
              >
                <q-tooltip>查看详情</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.refundSts === RefundStatus.PENDING"
                flat
                round
                color="positive"
                icon="check_circle"
                size="sm"
                @click="handleRefund(props.row, true)"
              >
                <q-tooltip>同意退款</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.refundSts === RefundStatus.PENDING"
                flat
                round
                color="negative"
                icon="cancel"
                size="sm"
                @click="handleRefund(props.row, false)"
              >
                <q-tooltip>拒绝退款</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 审核对话框 -->
    <q-dialog v-model="reviewDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <span class="text-h6">{{ reviewDialog.approve ? '同意退款' : '拒绝退款' }}</span>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="reviewDialog.message"
            type="textarea"
            label="审核说明"
            :hint="reviewDialog.approve ? '请输入同意退款的说明' : '请输入拒绝退款的原因'"
            outlined
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey" v-close-popup />
          <q-btn flat label="确认" color="primary" @click="submitReview" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from '~/utils/axios'
import {
  RefundStatus,
  RefundApplyType,
  REFUND_STATUS_OPTIONS,
  REFUND_APPLY_TYPE_OPTIONS
} from '~/utils/constants'

const $q = useQuasar()
const router = useRouter()

// 表格列定义
const columns = [
  { name: 'refundSn', label: '退款编号', field: 'refundSn', align: 'left' },
  { name: 'orderNumber', label: '订单号', field: 'orderNumber', align: 'left' },
  { name: 'refundAmount', label: '退款金额', field: 'refundAmount', align: 'right' },
  { name: 'applyType', label: '申请类型', field: row => getApplyTypeLabel(row.applyType), align: 'center' },
  { name: 'refundSts', label: '退款状态', field: 'refundSts', align: 'center' },
  { name: 'applyTime', label: '申请时间', field: 'applyTime', align: 'center' },
  { name: 'actions', label: '操作', align: 'center' }
]

// 状态相关
const loading = ref(false)
const refunds = ref([])
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 筛选条件
const filters = reactive({
  orderNumber: '',
  refundSn: '',
  refundSts: null,
  applyType: null,
  dateRange: { from: '', to: '' }
})

// 审核对话框
const reviewDialog = reactive({
  show: false,
  approve: true,
  message: '',
  currentRefund: null
})

// 加载退款记录
const loadRefunds = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      orderNumber: filters.orderNumber,
      refundSn: filters.refundSn,
      refundSts: filters.refundSts,
      applyType: filters.applyType,
      startTime: filters.dateRange?.from,
      endTime: filters.dateRange?.to
    }

    const response = await api.get('/admin/refund/list', { params })
    const { code, data } = response.data

    if (code === 200) {
      refunds.value = data
      pagination.value.rowsNumber = data.total
    }
  } catch (error) {
    console.error('加载退款记录失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载退款记录失败'
    })
  } finally {
    loading.value = false
  }
}

// 处理分页请求
const onRequest = (props: any) => {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  loadRefunds()
}

// 重置筛选条件
const resetFilters = () => {
  filters.orderNumber = ''
  filters.refundSn = ''
  filters.refundSts = null
  filters.applyType = null
  filters.dateRange = { from: '', to: '' }
  loadRefunds()
}

// 查看详情
const viewDetails = (refund: any) => {
  router.push(`/admin/refund/${refund.refundId}`)
}

// 处理退款审核
const handleRefund = (refund: any, approve: boolean) => {
  reviewDialog.show = true
  reviewDialog.approve = approve
  reviewDialog.message = ''
  reviewDialog.currentRefund = refund
}

// 提交审核
const submitReview = async () => {
  if (!reviewDialog.message) {
    $q.notify({
      type: 'warning',
      message: '请输入审核说明'
    })
    return
  }

  try {
    const response = await api.post('/admin/refund/review', {
      refundId: reviewDialog.currentRefund.refundId,
      approved: reviewDialog.approve,
      message: reviewDialog.message
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '审核成功'
      })
      reviewDialog.show = false
      loadRefunds()
    }
  } catch (error) {
    console.error('审核失败:', error)
    $q.notify({
      type: 'negative',
      message: '审核失败'
    })
  }
}

// 获取状态标签
const getStatusLabel = (status: number) => {
  const option = REFUND_STATUS_OPTIONS.find(opt => opt.value === status)
  return option ? option.label : '未知状态'
}

// 获取状态颜色
const getStatusColor = (status: number) => {
  switch (status) {
    case RefundStatus.PENDING: return 'warning'
    case RefundStatus.APPROVED: return 'positive'
    case RefundStatus.REJECTED: return 'negative'
    default: return 'grey'
  }
}

// 获取申请类型标签
const getApplyTypeLabel = (type: number) => {
  const option = REFUND_APPLY_TYPE_OPTIONS.find(opt => opt.value === type)
  return option ? option.label : '未知类型'
}

// 初始化
onMounted(() => {
  loadRefunds()
})
</script>

<style lang="scss" scoped>
.refund-list-page {
  padding: 20px;
}
</style>`
