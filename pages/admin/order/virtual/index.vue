<template>
  <div class="virtual-order-management">
    <div class="page-header">
      <h1 class="text-h5">虚拟订单管理</h1>
    </div>

    <!-- 筛选工具栏 -->
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

            <!-- 卡号搜索 -->
            <div class="col-12 col-sm-3">
              <q-input
                v-model="filters.cardNumber"
                label="卡号"
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
                @click="loadOrders"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 订单列表 -->
    <q-table
      :rows="orders"
      :columns="columns"
      row-key="orderVirtualId"
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
            @click="previewImage(props.row.pic)"
          />
        </q-td>
      </template>

      <!-- 卡密信息列 -->
      <template v-slot:body-cell-cardInfo="props">
        <q-td :props="props">
          <div>卡号: {{ props.row.cardNumber }}</div>
          <div>密码: {{ props.row.cardPassword }}</div>
          <div>面值: ¥{{ props.row.faceValue }}</div>
        </q-td>
      </template>

      <!-- 评论状态列 -->
      <template v-slot:body-cell-commSts="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.commSts ? 'positive' : 'grey'"
            text-color="white"
            dense
          >
            {{ props.row.commSts ? '已评价' : '未评价' }}
          </q-chip>
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
              @click="viewOrderDetail(props.row)"
            >
              <q-tooltip>查看详情</q-tooltip>
            </q-btn>

            <!-- 重置卡密 -->
            <q-btn
              flat
              round
              color="warning"
              icon="refresh"
              @click="resetCardInfo(props.row)"
            >
              <q-tooltip>重置卡密</q-tooltip>
            </q-btn>

            <!-- 删除订单 -->
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

    <!-- 重置卡密对话框 -->
    <q-dialog v-model="resetDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">重置卡密</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleReset" class="q-gutter-md">
            <!-- 新卡号 -->
            <q-input
              v-model="resetDialog.data.cardNumber"
              label="新卡号"
              :rules="[val => !!val || '请输入新卡号']"
              outlined
              dense
            />

            <!-- 新密码 -->
            <q-input
              v-model="resetDialog.data.cardPassword"
              label="新密码"
              :rules="[val => !!val || '请输入新密码']"
              outlined
              dense
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="取消" color="primary" v-close-popup />
              <q-btn label="确认" color="primary" type="submit" />
            </div>
          </q-form>
        </q-card-section>
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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from '~/utils/axios'

const $q = useQuasar()
const router = useRouter()
const config = useRuntimeConfig()

// 虚拟订单接口
interface VirtualOrder {
  orderVirtualId: number
  orderNumber: string
  prodId: number
  skuId: number
  prodName: string
  skuName: string
  pic: string
  price: number
  userId: number
  productAmount: number
  recTime: string
  commSts: number
  cardNumber: string
  cardPassword: string
  faceValue: number
  translations: string
}

// 状态变量
const orders = ref<VirtualOrder[]>([])
const loading = ref(false)
const pagination = ref({
  sortBy: 'recTime',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 筛选条件
const filters = ref({
  orderNumber: '',
  prodName: '',
  cardNumber: ''
})

// 对话框状态
const resetDialog = ref({
  show: false,
  data: {
    orderVirtualId: null as number | null,
    cardNumber: '',
    cardPassword: ''
  }
})

const previewDialog = ref({
  show: false,
  url: ''
})

// 表格列定义
const columns = [
  { name: 'orderVirtualId', label: 'ID', field: 'orderVirtualId', sortable: true },
  { name: 'orderNumber', label: '订单号', field: 'orderNumber', sortable: true },
  { name: 'prodName', label: '商品名称', field: 'prodName' },
  { name: 'pic', label: '商品图片', field: 'pic' },
  { name: 'price', label: '价格', field: 'price', sortable: true },
  { name: 'cardInfo', label: '卡密信息', field: row => `${row.cardNumber} / ${row.cardPassword}` },
  { name: 'commSts', label: '评价状态', field: 'commSts' },
  { name: 'recTime', label: '购买时间', field: 'recTime', sortable: true },
  { name: 'actions', label: '操作', field: 'actions' }
]

// 获取图片URL
const getImageUrl = (url: string): string => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${config.public.imageBaseUrl}/${url}`
}

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      ...filters.value
    }

    const response = await api.get('/admin/order/virtual/list', { params })
    const { code, data, total } = response.data
    
    if (code === 200) {
      orders.value = data
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载虚拟订单列表失败:', error)
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

// 查看订单详情
const viewOrderDetail = (order: VirtualOrder) => {
  router.push(`/admin/order/virtual/${order.orderVirtualId}`)
}

// 显示重置卡密对话框
const resetCardInfo = (order: VirtualOrder) => {
  resetDialog.value.data = {
    orderVirtualId: order.orderVirtualId,
    cardNumber: '',
    cardPassword: ''
  }
  resetDialog.value.show = true
}

// 处理重置卡密
const handleReset = async () => {
  try {
    const response = await api.post('/admin/order/virtual/reset-card', resetDialog.value.data)
    
    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '重置成功'
      })
      resetDialog.value.show = false
      loadOrders()
    } else {
      throw new Error(msg || '重置失败')
    }
  } catch (error) {
    console.error('重置卡密失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '重置失败'
    })
  }
}

// 确认删除
const confirmDelete = (order: VirtualOrder) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除订单 "${order.orderNumber}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/order/virtual/${order.orderVirtualId}`)
      
      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadOrders()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除订单失败:', error)
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
  loadOrders()
})
</script>

<style lang="scss" scoped>
.virtual-order-management {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
  }

  .q-img {
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style> 