<template>
  <div class="cancel-requests-container">
    <div class="header">
      <h2>{{ $t('admin.cancelRequests.title') }}</h2>

      <!-- 搜索和筛选区域 -->
      <div class="search-filters">
        <q-input
          v-model="searchQuery.orderNumber"
          :label="$t('admin.cancelRequests.orderNumber')"
          dense
          outlined
          class="q-mr-md"
        />

        <q-select
          v-model="searchQuery.status"
          :options="statusOptions"
          :label="$t('admin.cancelRequests.status')"
          dense
          outlined
          emit-value
          map-options
          clearable
          class="q-mr-md"
        />

        <q-btn
          color="primary"
          :label="$t('common.search')"
          @click="loadRequests"
        />
      </div>
    </div>

    <!-- 数据表格 -->
    <q-table
      :rows="requests"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination.sync="pagination"
      @request="onRequest"
    >

      <!-- 状态列自定义 -->
      <template v-slot:body-cell-reason="props">
        <q-td :props="props">
          <q-chip :color="getStatusColor(props.value)" text-color="white">
            {{ getCancelReason(props.row.reason) }}
          </q-chip>
        </q-td>
      </template>

      <!-- 状态列自定义 -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip :color="getStatusColor(props.value)" text-color="white">
            {{ getStatusText(props.row.status) }}
          </q-chip>
        </q-td>
      </template>

      <!-- 操作列 -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            v-if="props.row.status === 1"
            flat
            color="primary"
            :label="$t('admin.cancelRequests.approve')"
            @click="handleApprove(props.row)"
          />
          <q-btn
            v-if="props.row.status === 1"
            flat
            color="negative"
            :label="$t('admin.cancelRequests.reject')"
            @click="handleReject(props.row)"
          />
          <q-btn
            flat
            color="info"
            :label="$t('common.view')"
            @click="viewDetails(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- 审核对话框 -->
    <q-dialog v-model="auditDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ auditDialog.title }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="auditDialog.remark"
            type="textarea"
            :label="$t('admin.cancelRequests.remark')"
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('common.confirm')" color="primary" @click="submitAudit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 详情对话框 -->
    <q-dialog v-model="detailDialog.show">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('admin.cancelRequests.requestDetails') }}</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-6" v-for="(field, index) in detailFields" :key="index">
              <div class="text-subtitle2">{{ $t(field.label) }}</div>
              <div>{{ formatDetailValue(detailDialog.data, field) }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.close')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import {CancelReasonType} from "~/types/order";

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import axios from '~/utils/axios'

const { t } = useI18n()

// 状态选项
const statusOptions = [
  { label: t('admin.cancelRequests.statusOptions.pending'), value: 1 },
  { label: t('admin.cancelRequests.statusOptions.approved'), value: 2 },
  { label: t('admin.cancelRequests.statusOptions.rejected'), value: 3 }
]

// 表格列定义
const columns = [
  { name: 'orderNumber', label: t('admin.cancelRequests.orderNumber'), field: 'orderNumber', align: 'left' },
  { name: 'userName', label: t('admin.cancelRequests.userName'), field: 'userName', align: 'left' },
  { name: 'amount', label: t('admin.cancelRequests.amount'), field: 'amount', align: 'right' },
  { name: 'reason', label: t('admin.cancelRequests.reason'), field: 'reason', align: 'left' },
  { name: 'status', label: t('admin.cancelRequests.status'), field: 'status', align: 'center' },
  { name: 'createTime', label: t('admin.cancelRequests.createTime'), field: 'createTime', align: 'center' },
  { name: 'actions', label: t('common.actions'), align: 'center' }
]

// 详情字段定义
const detailFields = [
  { key: 'orderNumber', label: 'admin.cancelRequests.orderNumber' },
  { key: 'userName', label: 'admin.cancelRequests.userName' },
  { key: 'amount', label: 'admin.cancelRequests.amount' },
  { key: 'reason', label: 'admin.cancelRequests.reason' },
  { key: 'description', label: 'admin.cancelRequests.description' },
  { key: 'status', label: 'admin.cancelRequests.status' },
  { key: 'createTime', label: 'admin.cancelRequests.createTime' },
  { key: 'auditTime', label: 'admin.cancelRequests.auditTime' },
  { key: 'auditorName', label: 'admin.cancelRequests.auditorName' },
  { key: 'remark', label: 'admin.cancelRequests.remark' }
]

// 响应式数据
const requests = ref([])
const loading = ref(false)
const pagination = ref({
  sortBy: 'createTime',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const searchQuery = ref({
  orderNumber: '',
  status: null
})

const auditDialog = ref({
  show: false,
  type: 3,
  title: '',
  remark: '',
  currentRequest: null
})

const detailDialog = ref({
  show: false,
  data: null
})

// 获取状态对应的颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'positive',
    rejected: 'negative'
  }
  return colors[status] || 'grey'
}

// 加载数据
const loadRequests = async () => {
  loading.value = true
  try {
    const { page, rowsPerPage, sortBy, descending } = pagination.value
    const response = await api.get('/admin/order/cancel/request/list', {
      params: {
        page,
        pageSize: rowsPerPage,
        sortBy,
        sortDesc: descending,
        ...searchQuery.value
      }
    })
    requests.value = response.data.data
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Failed to load cancel requests:', error)
  } finally {
    loading.value = false
  }
}

// 表格请求处理
const onRequest = (props) => {
  pagination.value = props.pagination
  loadRequests()
}

// 处理审批
const handleApprove = (request) => {
  auditDialog.value = {
    show: true,
    type: 2,
    title: t('admin.cancelRequests.approveTitle'),
    remark: '',
    currentRequest: request
  }
}

// 处理拒绝
const handleReject = (request) => {
  auditDialog.value = {
    show: true,
    type: 3,
    title: t('admin.cancelRequests.rejectTitle'),
    remark: '',
    currentRequest: request
  }
}

// 提交审核
const submitAudit = async () => {
  try {
    const { currentRequest, type, remark } = auditDialog.value
    await api.post(`/admin/order/cancel/request/audit`, {
      id: currentRequest.id,
      remark : remark,
      type : type
    })
    auditDialog.value.show = false
    loadRequests()
  } catch (error) {
    console.error('Failed to submit audit:', error)
  }
}

// 查���详情
const viewDetails = (request) => {
  detailDialog.value = {
    show: true,
    data: request
  }
}
function getStatusText(value:number){
  if(value === 1){
    return t(`admin.cancelRequests.statusOptions.pending`)
  }
  if(value === 2){
    return t(`admin.cancelRequests.statusOptions.approved`)
  }else{
    return t(`admin.cancelRequests.statusOptions.rejected`)
  }
}
function getCancelReason(value:string){
  if(value === CancelReasonType.OUT_OF_STOCK){
    return "商品缺货";
  }
  if(value === CancelReasonType.OUT_OF_STOCK){
    return "价格变动";
  }
  if(value ===  CancelReasonType.DUPLICATE_ORDER){
    return "重复下单";
  }else{
    return "其他原因";
  }
}

// 格式化详情值
const formatDetailValue = (data, field) => {
  if (!data) return ''

  const value = data[field.key]
  if (!value) return ''

  if (field.key === 'createTime' || field.key === 'auditTime') {
    return date.formatDate(value, 'YYYY-MM-DD HH:mm:ss')
  }
  //pending:待审核,approved:已批准,rejected
  if (field.key === 'status') {
    if(value === 1){
      return t(`admin.cancelRequests.statusOptions.pending`)
    }
    if(value === 2){
      return t(`admin.cancelRequests.statusOptions.approved`)
    }
    if(value === 3){
      return t(`admin.cancelRequests.statusOptions.rejected`)
    }
  }

  if (field.key === 'reason') {
    return t(`admin.cancelRequests.reasonOptions.${value}`)
  }

  return value
}

onMounted(() => {
  loadRequests()
})
</script>

<style scoped>
.cancel-requests-container {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.search-filters {
  display: flex;
  align-items: center;
  margin-top: 16px;
}
</style>
