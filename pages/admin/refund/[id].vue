`<template>
  <div class="refund-detail-page">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">退款详情</div>
        <q-space />
        <q-btn
          flat
          round
          color="grey"
          icon="arrow_back"
          @click="router.back()"
        >
          <q-tooltip>返回</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="loading">
        <div class="row justify-center">
          <q-spinner color="primary" size="3em" />
        </div>
      </q-card-section>

      <template v-else-if="refundInfo">
        <!-- 基本信息 -->
        <q-card-section>
          <div class="text-subtitle2 q-mb-md">基本信息</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-4">
              <div class="info-item">
                <div class="label">退款编号</div>
                <div class="value">{{ refundInfo.refundSn }}</div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <div class="info-item">
                <div class="label">订单编号</div>
                <div class="value">{{ refundInfo.orderNumber }}</div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <div class="info-item">
                <div class="label">退款金额</div>
                <div class="value text-primary">¥{{ refundInfo.refundAmount }}</div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <div class="info-item">
                <div class="label">申请类型</div>
                <div class="value">{{ getApplyTypeLabel(refundInfo.applyType) }}</div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <div class="info-item">
                <div class="label">退款状态</div>
                <div class="value">
                  <q-chip
                    :color="getStatusColor(refundInfo.refundSts)"
                    text-color="white"
                    dense
                  >
                    {{ getStatusLabel(refundInfo.refundSts) }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <div class="info-item">
                <div class="label">申请时间</div>
                <div class="value">{{ refundInfo.applyTime }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- 退款原因 -->
        <q-card-section>
          <div class="text-subtitle2 q-mb-md">退款原因</div>
          <div class="reason-content">
            {{ refundInfo.buyerMsg || '未提供退款原因' }}
          </div>

          <div v-if="refundInfo.photoFiles" class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">凭证图片</div>
            <div class="row q-col-gutter-sm">
              <div
                v-for="(photo, index) in JSON.parse(refundInfo.photoFiles)"
                :key="index"
                class="col-auto"
              >
                <q-img
                  :src="photo"
                  style="width: 120px; height: 120px"
                  fit="cover"
                  class="cursor-pointer"
                  @click="previewImage(photo)"
                >
                  <template v-slot:loading>
                    <q-spinner-dots color="white" />
                  </template>
                </q-img>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- 处理信息 -->
        <q-card-section v-if="refundInfo.refundSts !== RefundStatus.PENDING">
          <div class="text-subtitle2 q-mb-md">处理信息</div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="info-item">
                <div class="label">处理时间</div>
                <div class="value">{{ refundInfo.handelTime }}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="info-item">
                <div class="label">处理说明</div>
                <div class="value">{{ refundInfo.sellerMsg || '无' }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- 退货物流信息 -->
        <template v-if="refundInfo.applyType === RefundApplyType.REFUND_WITH_RETURN">
          <q-separator />
          <q-card-section>
            <div class="text-subtitle2 q-mb-md">退货物流信息</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="info-item">
                  <div class="label">物流公司</div>
                  <div class="value">{{ refundInfo.expressName || '未填写' }}</div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="info-item">
                  <div class="label">物流单号</div>
                  <div class="value">{{ refundInfo.expressNo || '未填写' }}</div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="info-item">
                  <div class="label">发货时间</div>
                  <div class="value">{{ refundInfo.shipTime || '未发货' }}</div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="info-item">
                  <div class="label">收货时间</div>
                  <div class="value">{{ refundInfo.receiveTime || '未收货' }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </template>
      </template>
    </q-card>

    <!-- 图片预览 -->
    <q-dialog v-model="imagePreview.show">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-img
            :src="imagePreview.url"
            style="max-width: 100%; max-height: 80vh"
          >
            <template v-slot:loading>
              <q-spinner-dots color="white" />
            </template>
          </q-img>
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
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import { api } from '~/utils/axios'
import {
  RefundStatus,
  RefundApplyType,
  REFUND_STATUS_OPTIONS,
  REFUND_APPLY_TYPE_OPTIONS
} from '~/utils/constants'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const loading = ref(true)
const refundInfo = ref(null)

// 图片预览
const imagePreview = reactive({
  show: false,
  url: ''
})

// 获取退款详情
const loadRefundDetails = async () => {
  try {
    const response = await api.get(`/admin/refund/info/${route.params.id}`)
    const { code, data } = response.data

    if (code === 200) {
      refundInfo.value = data
    }
  } catch (error) {
    console.error('获取退款详情失败:', error)
    $q.notify({
      type: 'negative',
      message: '获取退款详情失败'
    })
  } finally {
    loading.value = false
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

// 预览图片
const previewImage = (url: string) => {
  imagePreview.url = url
  imagePreview.show = true
}

// 初始化
onMounted(() => {
  loadRefundDetails()
})
</script>


<style lang="scss" scoped>
.refund-detail-page {
  padding: 20px;

  .info-item {
    margin-bottom: 16px;

    .label {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9em;
      margin-bottom: 4px;
    }

    .value {
      font-size: 1em;
    }
  }

  .reason-content {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    white-space: pre-wrap;
  }
}
</style>`
