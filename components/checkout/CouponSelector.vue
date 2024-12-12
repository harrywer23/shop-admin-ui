<template>
  <div class="coupon-selector">
    <!-- 优惠券选择按钮 -->
    <div class="price-item">
      <span>{{ t('checkout.priceDetail.coupon') }}</span>
      <div class="coupon-selector-btn">
        <q-btn
          flat
          :label="selectedCoupon ? selectedCoupon.title : t('checkout.coupon.select')"
          @click="showDialog = true"
        >
          <q-icon name="arrow_drop_down" />
        </q-btn>
        <span v-if="selectedCoupon" class="text-negative">
          -¥{{ couponDiscount }}
        </span>
      </div>
    </div>

    <!-- 优惠券选择对话框 -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ t('checkout.coupon.title') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="loading" class="text-center q-pa-md">
            <q-spinner color="primary" size="2em" />
            <div class="text-grey q-mt-sm">{{ t('common.loading') }}</div>
          </div>

          <div v-else-if="error" class="text-center text-negative q-pa-md">
            {{ error }}
            <q-btn
              flat
              color="primary"
              :label="t('common.retry')"
              class="q-mt-sm"
              @click="loadCoupons"
            />
          </div>

          <template v-else>
            <div v-if="availableCoupons.length" class="coupon-list">
              <div
                v-for="coupon in availableCoupons"
                :key="coupon.couponId"
                class="coupon-item"
                :class="{ active: selectedCoupon?.couponId === coupon.couponId }"
                @click="selectCoupon(coupon)"
              >
                <div class="coupon-info">
                  <div class="coupon-amount">
                    {{ formatCouponAmount(coupon) }}
                  </div>
                  <div class="coupon-title">{{ coupon.title }}</div>
                  <div class="coupon-condition">
                    {{ formatCouponCondition(coupon) }}
                  </div>
                  <div class="coupon-time">
                    {{ t('checkout.coupon.validUntil') }}: {{ formatDate(coupon.endTime) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-coupon">
              {{ t('checkout.coupon.noCoupon') }}
            </div>
          </template>
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
            @click="confirmCoupon"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDate, formatCouponAmount, formatCouponCondition } from '~/utils/format'
import type { Coupon } from '~/types/checkout'

const props = defineProps<{
  subtotal: number
  categoryIds?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:discount', value: number): void
}>()

const { t } = useI18n()

// 状态
const showDialog = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const availableCoupons = ref<Coupon[]>([])
const selectedCoupon = ref<Coupon | null>(null)

// 计算属性
const couponDiscount = computed(() => {
  if (!selectedCoupon.value) return 0
  return calculateCouponDiscount(selectedCoupon.value)
})

// 加载优惠券
async function loadCoupons() {
  loading.value = true
  error.value = null

  try {
    const categoryIdsParam = props.categoryIds?.join(',') || ''
    const response = await fetch(
      `/admin/coupons/available?amount=${props.subtotal}&categoryIds=${categoryIdsParam}`
    )
    const data = await response.json()

    if (data.code === 200) {
      availableCoupons.value = data.data
    } else {
      throw new Error(data.msg || '获取优惠券失败')
    }
  } catch (err) {
    console.error('加载优惠券失败:', err)
    error.value = err instanceof Error ? err.message : '加载优惠券失败'
  } finally {
    loading.value = false
  }
}

// 选择优惠券
function selectCoupon(coupon: Coupon) {
  selectedCoupon.value = coupon
}

// 确认选择
function confirmCoupon() {
  const discount = selectedCoupon.value ? calculateCouponDiscount(selectedCoupon.value) : 0
  emit('update:discount', discount)
}

// 计算优惠券折扣金额
function calculateCouponDiscount(coupon: Coupon): number {
  if (coupon.couponType === 1) {
    // 满减券
    return coupon.discount
  } else {
    // 折扣券
    const discount = props.subtotal * (1 - coupon.discount)
    return Math.min(discount, coupon.maxDiscount || discount)
  }
}

// 监听小计金额变化,重新加载优惠券
watch(() => props.subtotal, () => {
  if (showDialog.value) {
    loadCoupons()
  }
})

// 打开对话框时加载优惠券
watch(showDialog, (newValue) => {
  if (newValue) {
    loadCoupons()
  }
})
</script>

<style scoped>
.coupon-selector {
  width: 100%;
}

.coupon-selector-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coupon-list {
  max-height: 400px;
  overflow-y: auto;
}

.coupon-item {
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--q-primary);
    transform: translateY(-2px);
  }

  &.active {
    border-color: var(--q-primary);
    background-color: #f6f7ff;
  }
}

.coupon-info {
  .coupon-amount {
    font-size: 24px;
    color: var(--q-primary);
    font-weight: bold;
  }

  .coupon-title {
    margin: 8px 0;
    font-weight: 500;
  }

  .coupon-condition {
    font-size: 12px;
    color: #666;
  }

  .coupon-time {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
}

.no-coupon {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style>
