<template>
  <div class="orders-page">
    <h1 class="text-h4 q-mb-lg">{{ t('user.order.title') }}</h1>

    <!-- 筛选和搜索 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center q-gutter-md">
            <!-- 订单状态筛选 -->
            <q-select
              v-model="queryParams.status"
              :options="statusOptions"
              label="订单状态"
              emit-value
              map-options
              dense
              outlined
              @update:model-value="loadOrders"
            />

            <!-- 订单号搜索 -->
            <q-input
              v-model="queryParams.orderNumber"
              label="订单号"
              dense
              outlined
              clearable
              @update:model-value="loadOrders"
            />

            <!-- 商品名称搜索 -->
            <q-input
              v-model="queryParams.prodName"
              label="商品名称"
              dense
              outlined
              clearable
              @update:model-value="loadOrders"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <q-card
        v-for="order in orders"
        :key="order.orderId"
        class="order-card q-mb-md"
        bordered
        flat
      >
        <q-card-section>
          <!-- 订单头部信息 -->
          <div class="row items-center justify-between q-mb-md">
            <div class="order-header">
              <div class="order-number">订单号：{{ order.orderNumber }}</div>
              <div class="order-time">下单时间：{{ formatDateTime(order.createTime) }}</div>
            </div>
            <div class="order-status text-caption" :class="getStatusClass(order.status)">
              {{ getStatusLabel(order.status) }}
            </div>
          </div>

          <!-- 订单商品列表 -->
          <div class="order-items">
            <div v-for="item in order.orderItems" :key="item.orderItemId" class="order-item">
              <div class="item-main" @click="viewOrderDetails(order.orderNumber)">
                <q-img :src="getImageUrl(item.pic)" style="width: 80px; height: 80px" />
                <div class="item-info">
                  <div class="item-name">{{ item.skuName || item.prodName }}</div>
                  <div class="item-price">
                    <span class="price">¥{{ item.price }}</span>
                    <span class="quantity">x{{ item.prodCount }}</span>
                  </div>
                </div>
              </div>

              <!-- 商品操作按钮 -->
              <div class="item-actions">
                <q-btn
                  v-if="order.status === OrderStatus.COMPLETED && !item.commSts"
                  flat
                  color="primary"
                  :label="t('order.review.submit')"
                  @click="openReview(item)"
                />
                <q-btn
                  v-else-if="item.commSts"
                  flat
                  color="primary"
                  :label="t('order.review.detail')"
                  @click="viewReview(item)"
                />
              </div>
            </div>
          </div>

          <!-- 订单底部信息 -->
          <div class="order-footer">
            <div class="order-total">
              共 {{ getTotalQuantity(order) }} 件商品
              合计：<span class="total-amount">¥{{ order.actualTotal }}</span>
              <span class="text-grey-6">(含运费 ¥{{ order.freightAmount || 0 }})</span>
            </div>

            <!-- 订单操作按钮 -->
            <div class="order-actions">
              <!-- 待付款状态显示付款按钮 -->
              <q-btn
                v-if="order.status === OrderStatus.UNPAID"
                color="primary"
                :label="t('order.pay')"
                @click="goToPay(order)"
              />

              <!-- 待收货状态显示确认收货按钮 -->
              <q-btn
                v-if="order.status === OrderStatus.SHIPPED"
                outline
                color="primary"
                :label="t('order.confirm')"
                @click="confirmReceipt(order)"
              />

              <!-- 可取消的订单显示取消按钮 -->
              <q-btn
                v-if="canCancel(order)"
                outline
                color="grey"
                :label="t('order.cancel')"
                @click="handleCancelOrder(order)"
              />

              <!-- 删除按钮 - 只在已完成或已取消的订单显示 -->
              <q-btn
                v-if="canDelete(order)"
                outline
                color="negative"
                :label="t('common.delete')"
                @click="confirmDelete(order)"
              />

              <!-- 查看详情按钮 -->
              <q-btn
                flat
                color="primary"
                :label="t('order.detail.title')"
                @click="viewOrderDetails(order.orderNumber)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 分页器 -->
    <div class="pagination-section q-mt-lg flex justify-center">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="6"
        boundary-numbers
        direction-links
        @update:model-value="loadOrders"
      />
    </div>

    <!-- 加载状态 -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>

    <!-- 评论组件 -->
    <OrderReview
      ref="reviewDialog"
      :order-item="selectedItem"
      @review-submitted="handleReviewSubmitted"
    />

    <!-- 取消订单申请对话框 -->
    <q-dialog v-model="cancelDialog.show" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t('order.cancelRequest.title') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="cancelDialog.reason"
            :options="cancelReasonOptions"
            :label="t('order.cancelRequest.reason')"
            :rules="[val => !!val || t('order.cancelRequest.reasonRequired')]"
            outlined
            emit-value
            map-options
          />

          <q-input
            v-model="cancelDialog.description"
            type="textarea"
            :label="t('order.cancelRequest.description')"
            :placeholder="t('order.cancelRequest.descriptionPlaceholder')"
            class="q-mt-md"
            outlined
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" color="grey" v-close-popup />
          <q-btn
            flat
            :label="t('common.submit')"
            color="primary"
            @click="submitCancelRequest"
            :loading="cancelDialog.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 在模板底部添加删除确认对话框 -->
    <q-dialog v-model="deleteDialog.show">
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t('common.confirm') }}</div>
        </q-card-section>

        <q-card-section>
          {{ t('order.deleteConfirm') }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            :label="t('common.confirm')"
            color="negative"
            @click="deleteOrder"
            :loading="deleteDialog.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import OrderReview from '~/components/order/OrderReview.vue'
import { tansParams } from "~/utils/tools"
import { OrderStatus } from "~/utils/constants"
import { api } from '~/utils/axios'
import { CancelReasonType } from '~/types/order'
import { shanghaiToLocal } from '~/utils/format'

definePageMeta({
  layout: 'users',
  middleware: 'auth'
})

const $q = useQuasar()
const { t } = useI18n()
const router = useRouter()

// 状态变量
const orders = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const reviewDialog = ref(null)
const selectedItem = ref(null)

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  orderNumber: '',
  prodName: '',
  status: null
})

// 订单状态选项
const statusOptions = [
  { label: '全部', value: null },
  { label: '待付款', value: OrderStatus.UNPAID },
  { label: '已付款', value: OrderStatus.PAID },
  { label: '已发货', value: OrderStatus.SHIPPED },
  { label: '已完成', value: OrderStatus.COMPLETED },
  { label: '已取消', value: OrderStatus.CANCELLED },
  { label: '已评论', value: OrderStatus.CANCELLED }

]

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return shanghaiToLocal(dateStr)
}

// 获取订单状态标签和样式
const getStatusLabel = (status: number) => {
  switch (status) {
    case OrderStatus.UNPAID: return '待付款'
    case OrderStatus.PAID: return '已付款'
    case OrderStatus.SHIPPED: return '已发货'
    case OrderStatus.COMPLETED: return '已完成'
    case OrderStatus.CANCELLED: return '已取消'
    case OrderStatus.COMM: return '已评论'
    default: return '未知状态'
  }
}

const getStatusClass = (status: number) => {
  switch (status) {
    case OrderStatus.UNPAID: return 'text-warning'
    case OrderStatus.PAID: return 'text-info'
    case OrderStatus.SHIPPED: return 'text-primary'
    case OrderStatus.COMPLETED: return 'text-positive'
    case OrderStatus.CANCELLED: return 'text-negative'
    default: return 'text-grey'
  }
}

// 计算订单总数量
const getTotalQuantity = (order: any) => {
  return order.orderItems.reduce((total: number, item: any) => total + item.prodCount, 0)
}

// 判断订单是否可以取消
const canCancel = (order: any) => {
  return order.status === OrderStatus.UNPAID ||
         (order.status === OrderStatus.PAID && !order.shippingTime)
}

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    queryParams.value.pageNum= currentPage.value;
    const response = await api.get('/admin/order/list?' + tansParams(queryParams.value))
    const { code, data, total } = response.data
    if (code === 200) {
      orders.value = data
      totalPages.value = Math.ceil(total / queryParams.value.pageSize)
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '获取订单列表失败'
    })
  } finally {
    loading.value = false
  }
}

// 跳转到支付页面
const goToPay = (order: any) => {
  router.push(`/order/payment?orderNumber=${order.orderNumber}`)
}

// 确认收货
const confirmReceipt = async (order: any) => {
  try {
    const response = await api.get(`/admin/order/confirm/${order.orderId}`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '确认收货成功'
      })
      loadOrders()
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '确认收货失败'
    })
  }
}

// 取消订单
const handleCancelOrder = async (order: any) => {
  if (order.status === OrderStatus.UNPAID) {
    // 未付款订单直接取消
    try {
      const response = await api.get(`/admin/order/cancel/${order.orderId}`)
      if (response.data.code === 200) {
        $q.notify({
          type: 'positive',
          message: t('order.cancelSuccess')
        })
        loadOrders() // 重新加载订单列表
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      $q.notify({
        type: 'negative',
        message: t('order.cancelFailed')
      })
    }
  } else {
    // 已付款订单显示申请对话框
    cancelDialog.value.currentOrder = order
    cancelDialog.value.reason = ''
    cancelDialog.value.description = ''
    cancelDialog.value.show = true
  }
}

// 提交取消申请
const submitCancelRequest = async () => {
  if (!cancelDialog.value.reason) {
    $q.notify({
      type: 'warning',
      message: t('order.cancelRequest.reasonRequired')
    })
    return
  }

  cancelDialog.value.loading = true
  try {
    const response = await api.post('/admin/order/cancel/create', {
      orderId: cancelDialog.value.currentOrder.orderId,
      reason: cancelDialog.value.reason,
      description: cancelDialog.value.description
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('order.cancelRequest.submitSuccess')
      })
      cancelDialog.value.show = false
      loadOrders() // 重新加载订单列表
    }else{
      $q.notify({
        type: 'negative',
        message: response.data.msg
      });
    }
  } catch (error) {
    console.error('提交取消申请失败:', error)
    $q.notify({
      type: 'negative',
      message: t('order.cancelRequest.submitFailed')
    })
  } finally {
    cancelDialog.value.loading = false
  }
}

// 查看订单详情
const viewOrderDetails = (orderNumber: string) => {
  router.push(`/user/orders/${orderNumber}`)
}

// 打开评论对话框
const openReview = (item: any) => {
  selectedItem.value = item
  reviewDialog.value?.open()
}

// 查看评论详情
const viewReview = (item: any) => {
  router.push(`/user/review/${item.orderItemId}`)
}

// 评论提交后的处理
const handleReviewSubmitted = () => {
  loadOrders()
}

// 删除对话框状态
const deleteDialog = ref({
  show: false,
  loading: false,
  order: null as any
})

// 判断订单是否可以删除
const canDelete = (order: any) => {
  return order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED
}

// 显示删除确认对话框
const confirmDelete = (order: any) => {
  deleteDialog.value.order = order
  deleteDialog.value.show = true
}

// 删除订单
const deleteOrder = async () => {
  if (!deleteDialog.value.order) return

  deleteDialog.value.loading = true
  try {
    const response = await api.delete(`/admin/order/del/${deleteDialog.value.order.orderId}`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('order.deleteSuccess')
      })
      deleteDialog.value.show = false
      loadOrders() // 重新加载订单列表
    }
  } catch (error) {
    console.error('删除订单失败:', error)
    $q.notify({
      type: 'negative',
      message: t('order.deleteFailed')
    })
  } finally {
    deleteDialog.value.loading = false
  }
}

// 取消对话框状态
const cancelDialog = ref({
  show: false,
  reason: '',
  description: '',
  loading: false,
  currentOrder: null as any
})

// 取消原因选项
const cancelReasonOptions = [
  { label: t('order.cancelRequest.reasons.outOfStock'), value: CancelReasonType.OUT_OF_STOCK },
  { label: t('order.cancelRequest.reasons.priceChange'), value: CancelReasonType.PRICE_CHANGE },
  { label: t('order.cancelRequest.reasons.duplicateOrder'), value: CancelReasonType.DUPLICATE_ORDER },
  { label: t('order.cancelRequest.reasons.other'), value: CancelReasonType.OTHER }
]

// 初始化
onMounted(() => {
  loadOrders()
})
</script>

<style lang="scss" scoped>
.orders-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .filter-section {
    .q-input,
    .q-select {
      width: 200px;
    }
  }

  .order-list {
    .order-card {
      transition: all 0.3s ease;

      .order-header {
        .order-number {
          font-weight: 500;
          margin-bottom: 4px;
        }
        .order-time {
          font-size: 0.9em;
          color: #666;
        }
      }

      .order-items {
        .order-item {
          padding: 16px 0;
          border-bottom: 1px solid #f5f5f5;

          &:last-child {
            border-bottom: none;
          }

          .item-main {
            display: flex;
            align-items: center;
            gap: 16px;
            cursor: pointer;

            .item-info {
              flex: 1;
              .item-name {
                font-weight: 500;
                margin-bottom: 8px;
              }
              .item-price {
                .price {
                  color: var(--q-primary);
                  font-weight: 500;
                  margin-right: 8px;
                }
                .quantity {
                  color: #999;
                }
              }
            }
          }

          .item-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
          }
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #f5f5f5;

        .order-total {
          .total-amount {
            font-size: 1.2em;
            font-weight: bold;
            color: var(--q-primary);
            margin: 0 4px;
          }
        }

        .order-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}

.order-actions {
  .q-btn {
    margin-left: 8px; // 增加按钮之间的间距
  }
}
</style>
