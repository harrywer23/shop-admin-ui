<template>
  <div class="presell-orders">
    <div class="page-header">
      <h1 class="text-h5">{{ t('presell.orders.title') }}</h1>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
      <div class="text-grey q-mt-sm">{{ t('common.loading') }}</div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="text-center text-negative q-pa-lg">
      {{ error }}
      <q-btn
        flat
        color="primary"
        :label="t('common.retry')"
        class="q-mt-sm"
        @click="loadOrders"
      />
    </div>

    <!-- 空状态 -->
    <div v-else-if="!orders.length" class="text-center q-pa-xl">
      <q-icon name="inventory_2" size="4em" color="grey-5" />
      <div class="text-grey q-mt-md">{{ t('presell.orders.empty') }}</div>
    </div>

    <!-- 订单列表 -->
    <template v-else>
      <q-list bordered separator class="rounded-borders">
        <q-item v-for="order in orders" :key="order.presellOrderId" class="q-pa-md">
          <q-item-section>
            <!-- 订单基本信息 -->
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle1">
                订单号: {{ order.orderNumber }}
              </div>
              <div class="text-caption text-grey">
                {{ formatDateTime(order.createTime) }}
              </div>
            </div>

            <!-- 地址信息 -->
            <div class="row items-center justify-between q-mb-md">
              <div class="address-info" v-if="order.addrInfo">
                <div class="text-subtitle2">{{ t('presell.orders.shippingAddress') }}</div>
                <div class="text-grey">
                  {{ order.addrInfo.receiver }} {{ order.addrInfo.mobile }}
                </div>
                <div class="text-grey">
                  {{ formatAddress(order.addrInfo) }}
                </div>
              </div>
              <div class="actions">
                <q-btn
                  v-if="canModifyAddress(order as PresellOrder)"
                  flat
                  color="primary"
                  :label="t('presell.orders.modifyAddress')"
                  @click="showAddressDialog(order as PresellOrder)"
                />
              </div>
            </div>

            <!-- 价格信息 -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-sm-4">
                <div class="text-grey">定金</div>
                <div class="text-subtitle1 text-primary">
                  ¥{{ formatAmount(order.depositAmount) }}
                </div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="text-grey">尾款</div>
                <div class="text-subtitle1">
                  ¥{{ formatAmount(order.finalAmount) }}
                </div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="text-grey">总金额</div>
                <div class="text-subtitle1">
                  ¥{{ formatAmount(Number(order.depositAmount) + Number(order.finalAmount)) }}
                </div>
              </div>
            </div>

            <!-- 状态信息 -->
            <div class="row items-center justify-between">
              <div class="status-info">
                <q-chip
                  :color="getStatusColor(order.status)"
                  text-color="white"
                  size="sm"
                >
                  {{ getStatusText(order.status) }}
                </q-chip>
                <q-chip
                  v-if="order.depositStatus==1"
                  :color="getDepositStatusColor(order.depositStatus)"
                  text-color="white"
                  size="sm"
                >
                  {{ getDepositStatusText(order.depositStatus) }}
                </q-chip>
                <q-chip
                  v-if="order.finalStatus == 1 && order.depositStatus==2"
                  :color="getFinalStatusColor(order.finalStatus)"
                  text-color="white"
                  size="sm"
                >
                  {{ getFinalStatusText(order.finalStatus) }}
                </q-chip>
              </div>

              <!-- 操作按钮 -->
              <div class="actions">
                <q-btn
                  v-if="canPayDeposit(order)"
                  color="primary"
                  flat
                  :label="t('presell.orders.payDeposit')"
                  :to="`/order/payment?orderNumber=${order.orderNumber}&type=deposit`"
                />
                <q-btn
                  v-if="canPayFinal(order)"
                  color="primary"
                  flat
                  :label="t('presell.orders.payFinal')"
                  :to="`/user/presell/payment?orderId=${order.presellOrderId}&type=final`"
                />
                <q-btn
                  v-if="canDelete(order)"
                  flat
                  color="negative"
                  :label="t('common.delete')"
                  @click="confirmDelete(order)"
                />
                <q-btn
                  flat
                  color="primary"
                  :label="t('presell.orders.detail')"
                  :to="`/user/presell/detail?id=${order.presellOrderId}`"
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- 分页 -->
      <div class="row justify-center q-mt-md">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="6"
          boundary-numbers
          direction-links
        />
      </div>
    </template>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="deleteDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="text-h6 q-ml-sm">{{ t('presell.orders.deleteConfirm') }}</span>
        </q-card-section>

        <q-card-section>
          <div class="text-body1">{{ t('presell.orders.deleteMessage') }}</div>
          <div v-if="deleteDialog.order" class="order-preview q-mt-md">
            <div class="text-subtitle2">订单号：{{ deleteDialog.order.orderNumber }}</div>
            <div class="row q-mt-sm">
              <div class="col-4">
                <div class="text-grey">定金</div>
                <div class="text-weight-medium">
                  ¥{{ formatAmount(deleteDialog.order.depositAmount) }}
                </div>
              </div>
              <div class="col-4">
                <div class="text-grey">尾款</div>
                <div class="text-weight-medium">
                  ¥{{ formatAmount(deleteDialog.order.finalAmount) }}
                </div>
              </div>
              <div class="col-4">
                <div class="text-grey">总金额</div>
                <div class="text-weight-medium">
                  ¥{{ formatAmount(Number(deleteDialog.order.depositAmount) + Number(deleteDialog.order.finalAmount)) }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1">
          <q-btn
            flat
            :label="t('common.cancel')"
            color="primary"
            v-close-popup
          />
          <q-btn
            :label="t('common.confirm')"
            color="negative"
            :loading="deleteDialog.loading"
            @click="handleDeleteConfirm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 添加地址选择对话框 -->
    <q-dialog v-model="addressDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t('presell.orders.selectAddress') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <AddressManager
            v-model="addressDialog.selectedAddressId"
            @select="handleAddressSelect"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="t('common.cancel')"
            color="primary"
            v-close-popup
          />
          <q-btn
            :label="t('common.confirm')"
            color="primary"
            :loading="addressDialog.loading"
            @click="handleAddressConfirm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'users',
  middleware: 'auth'
});
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '~/utils/axios'
import { shanghaiToLocal } from '~/utils/format'
import AddressManager from '~/components/address/AddressManager.vue'
import { useQuasar } from 'quasar'

const { t } = useI18n()
const $q = useQuasar()

// 添加预售订单类型定义
interface PresellOrder {
  presellOrderId: number
  orderNumber: string
  createTime: string
  status: number
  depositStatus: number
  finalStatus: number
  depositAmount: number
  finalAmount: number
  dvyTime?: string
  addrInfo?: {
    id?: number
    addrId: number
    receiver: string
    mobile: string
    province: string
    city: string
    area: string
    addr: string
  }
}

// 状态定义
const orders = ref<PresellOrder[]>([])
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return shanghaiToLocal(dateStr)
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount?.toFixed(2) || '0.00'
}

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待付定金',
    1: '预售中',
    2: '待付尾款',
    3: '待发货',
    4: '已发货',
    5: '已完成',
    6: '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态颜色
const getStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: 'warning',
    1: 'warning',
    2: 'info',
    3: 'info',
    4: 'positive',
    5: 'negative',
    6: 'negative'

  }
  return colorMap[status] || 'grey'
}

// 获取定金状态文本
const getDepositStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '未支付定金',
    2: '已支付定金',
    3: '定金已退款',
    4: '已取消'
  }
  return statusMap[status] || '-'
}

// 获取定金状态颜色
const getDepositStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    1: 'warning',
    2: 'positive',
    3: 'positive',
    4: 'grey'
  }
  return colorMap[status] || 'grey'
}

// 获取尾款状态文本
const getFinalStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '未支付尾款',
    2: '已支付尾款',
    3: '尾款已退款',
    4: '已取消'
  }
  return statusMap[status] || '-'
}

// 获取尾款状态颜色
const getFinalStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    1: 'warning',
    2: 'positive',
    3: 'grey',
    4: 'grey'
  }
  return colorMap[status] || 'grey'
}

// 判断是否可以支付定金
const canPayDeposit = (order: any) => {
  //order.finalStatus == 1 && order.depositStatus==2
  return order.status === 0 && (!order.depositStatus || order.depositStatus === 1)
}

// 判断是否可以支付尾款
const canPayFinal = (order: any) => {
  return order.status === 2 && (!order.finalStatus || (order.finalStatus === 1 &&  order.depositStatus === 2))
}

// 加载订单数据
const loadOrders = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/admin/presell/order/list', {
      params: {
        pageNum: currentPage.value,
        pageSize: pageSize.value
      }
    })

    const { code, data, total: totalCount } = response.data
    if (code === 200) {
      orders.value = data
      total.value = Number(totalCount)
    } else {
      throw new Error('加载预售订单失败')
    }
  } catch (err) {
    console.error('加载预售订单失败:', err)
    error.value = err instanceof Error ? err.message : '加载预售订单失败'
  } finally {
    loading.value = false
  }
}

// 监听页码变化
watch(currentPage, () => {
  loadOrders()
})

// 初始化加载
onMounted(() => {
  loadOrders()
})

// 删除对话框状态
const deleteDialog = ref({
  show: false,
  loading: false,
  order: null as PresellOrder | null
})

// 判断订单是否可以删除
const canDelete = (order: any) => {
  // 已完成、已取消或已退款的订单可以删除
  return order.status === 5 || // 已完成
         order.status === 6 || // 已取消
         (order.depositStatus === 3 && order.finalStatus === 3) // 定金和尾款都已退款
}

// 显示删除确认对话框
const confirmDelete = (order: any) => {
  deleteDialog.value.order = order
  deleteDialog.value.show = true
}

// 处理删除确认
const handleDeleteConfirm = async () => {
  if (!deleteDialog.value.order) return

  deleteDialog.value.loading = true
  try {
    const response = await api.delete(`/admin/presell/order/del/${deleteDialog.value.order.presellOrderId}`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('presell.orders.deleteSuccess')
      })
      deleteDialog.value.show = false
      loadOrders() // 重新加载订单列表
    } else {
      throw new Error(response.data.msg || t('presell.orders.deleteFailed'))
    }
  } catch (error) {
    console.error('删除预售订单失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('presell.orders.deleteFailed')
    })
  } finally {
    deleteDialog.value.loading = false
  }
}

// 地址话框状态
const addressDialog = ref({
  show: false,
  loading: false,
  selectedAddressId: null as number | null,
  currentOrder: null as PresellOrder | null
})

// 判断是否可以修改地址
const canModifyAddress = (order: PresellOrder) => {
  // 可以修改地址的状态：
  // 1. 待付定金 (status === 0)
  // 2. 已付定金 (depositStatus === 2)
  // 3. 待付尾款 (status === 2)
  return order.status === 0 || // 待付定金
         order.status === 1 || // 已付定金
         order.status === 2 // 待付尾款
}

// 显示地址选择对话框
const showAddressDialog = (order: PresellOrder) => {
  addressDialog.value.currentOrder = order
  addressDialog.value.selectedAddressId = order.addrInfo?.addrId || null
  addressDialog.value.show = true
}

// 处理地址选择
const handleAddressSelect = (address: { addrId: number }) => {
  addressDialog.value.selectedAddressId = address.addrId
}

// 格式化地址显示
const formatAddress = (address: {
  province: string
  city: string
  area: string
  addr: string
}) => {
  if (!address) return ''
  return `${address.province} ${address.city} ${address.area} ${address.addr}`
}

// 确认修改地址
const handleAddressConfirm = async () => {
  if (!addressDialog.value.selectedAddressId || !addressDialog.value.currentOrder) {
    $q.notify({
      type: 'warning',
      message: t('presell.orders.selectAddressFirst')
    })
    return
  }

  addressDialog.value.loading = true
  try {
    const response = await api.post('/admin/order/userAddr/updateAddress', {
      presellOrderId: addressDialog.value.currentOrder.presellOrderId,
      addressId: addressDialog.value.selectedAddressId
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('presell.orders.addressUpdateSuccess')
      })
      addressDialog.value.show = false
      loadOrders() // 重新加载订单列表
    } else {
      throw new Error(response.data.msg || t('presell.orders.addressUpdateFailed'))
    }
  } catch (error) {
    console.error('修改收货地址失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('presell.orders.addressUpdateFailed')
    })
  } finally {
    addressDialog.value.loading = false
  }
}
</script>

<style lang="scss" scoped>
.presell-orders {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .page-header {
    margin-bottom: 24px;
  }

  .status-info {
    display: flex;
    gap: 8px;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .q-item {
    transition: background-color 0.3s;

    &:hover {
      background-color: #f8f9fa;
    }
  }
}

.order-preview {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.actions {
  display: flex;
  gap: 8px;

  .q-btn {
    min-width: 80px; // 确保���钮宽度一致
  }
}

.address-info {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;

  .text-subtitle2 {
    margin-bottom: 4px;
  }
}
</style>
