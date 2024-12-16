<template>
  <div class="presell-edit">
    <q-card class="edit-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">预售设置</div>
        <q-space />
        <q-btn
          icon="arrow_back"
          flat
          round
          dense
          v-close-popup
          @click="router.back()"
        />
      </q-card-section>

      <!-- 商品基本信息展示 -->
      <q-card-section v-if="productInfo" class="product-info q-pt-none">
        <div class="row items-center">
          <q-img
            :src="productInfo.pic"
            class="product-image"
            width="80px"
            height="80px"
          />
          <div class="product-details q-ml-md">
            <div class="text-subtitle1">{{ productInfo.prodName }}</div>
            <div class="text-caption text-grey">编码: {{ productInfo.prodCode }}</div>
          </div>
        </div>
      </q-card-section>

      <!-- 预售设置表单 -->
      <q-card-section>
        <q-form @submit="handleSubmit" class="presell-form">
          <!-- 预售开关 -->
          <div class="row q-mb-lg">
            <q-toggle
              v-model="form.presellStatus"
              :false-value="0"
              :true-value="1"
              label="开启预售"
              color="primary"
            />
          </div>

          <template v-if="form.presellStatus">
            <!-- 价格设置 -->
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-md-4">
                <money-input
                  v-model="form.presellPrice"
                  label="预售价格"
                  :rules="[val => val > 0 || '预售价格必须大于0']"
                  @update:model-value="updateFinalPayment"
                />
              </div>

              <div class="col-12 col-md-4">
                <money-input
                  v-model="form.presellDeposit"
                  label="预售定金"
                  :rules="[
                    val => val > 0 || '定金必须大于0',
                    val => val < form.presellPrice || '定金不能大于预售价格'
                  ]"
                  @update:model-value="updateFinalPayment"
                />
              </div>

              <div class="col-12 col-md-4">
                <money-input
                  v-model="form.presellFinalPayment"
                  label="尾款金额"
                  readonly
                  disable
                />
              </div>
            </div>

            <!-- 时间设置 -->
            <div class="row q-col-gutter-md">
              <!-- 预售时间 -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.presellStartTime"
                  type="datetime-local"
                  label="预售开始时间"
                  filled
                  :rules="[val => !!val || '请选择预售开始时间']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.presellEndTime"
                  type="datetime-local"
                  label="预售结束时间"
                  filled
                  :rules="[
                    val => !!val || '请选择预售结束时间',
                    val => new Date(val) > new Date(form.presellStartTime) || '结束时间必须晚于开始时间'
                  ]"
                />
              </div>

              <!-- 发货时间 -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.presellDeliveryTime"
                  type="datetime-local"
                  label="预计发货时间"
                  filled
                  :rules="[
                    val => !!val || '请选择预计发货时间',
                    val => new Date(val) > new Date(form.presellEndTime) || '发货时间必须晚于预售结束时间'
                  ]"
                />
              </div>

              <!-- 尾款支付时间 -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.presellFinalStartTime"
                  type="datetime-local"
                  label="尾款支付开始时间"
                  filled
                  :rules="[
                    val => !!val || '请选择尾款支付开始时间',
                    val => new Date(val) > new Date(form.presellEndTime) || '尾款支付开始时间必须晚于预售结束时间'
                  ]"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.presellFinalEndTime"
                  type="datetime-local"
                  label="尾款支付截止时间"
                  filled
                  :rules="[
                    val => !!val || '请选择尾款支付截止时间',
                    val => new Date(val) > new Date(form.presellFinalStartTime) || '尾款支付截止时间必须晚于开始时间'
                  ]"
                />
              </div>
            </div>
          </template>

          <!-- 底部按钮 -->
          <div class="row justify-end q-mt-xl">
            <q-btn
              flat
              label="取消"
              color="grey-7"
              class="q-mr-sm"
              @click="router.back()"
            />
            <q-btn
              unelevated
              color="primary"
              :loading="submitting"
              label="保存"
              type="submit"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import MoneyInput from '~/components/common/MoneyInput.vue'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const prodId = ref(route.query.prodId)
const submitting = ref(false)
const productInfo = ref<any>(null)

// 表单数据
const form = ref({
  presellStatus: 1,
  presellPrice: 0,
  presellDeposit: 0,
  presellFinalPayment: 0,
  presellStartTime: '',
  presellEndTime: '',
  presellDeliveryTime: '',
  presellFinalStartTime: '',
  presellFinalEndTime: ''
})

// 加载商品数据
async function loadData() {
  try {
    const response = await  api.get(`/sys/prod/prod/info/${prodId}`)
    const result = await response.data

    if (result.code === 200) {
      productInfo.value = result.data

      // 初始化表单数据
      form.value = {
        presellStatus: result.data.presellStatus || 0,
        presellPrice: result.data.presellPrice || 0,
        presellDeposit: result.data.presellDeposit || 0,
        presellFinalPayment: result.data.presellFinalPayment || 0,
        presellStartTime: formatToDateTime(result.data.presellStartTime),
        presellEndTime: formatToDateTime(result.data.presellEndTime),
        presellDeliveryTime: formatToDateTime(result.data.presellDeliveryTime),
        presellFinalStartTime: formatToDateTime(result.data.presellFinalStartTime),
        presellFinalEndTime: formatToDateTime(result.data.presellFinalEndTime)
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载数据失败'
    })
  }
}

// 更新尾款金额
function updateFinalPayment() {
  form.value.presellFinalPayment = Number((form.value.presellPrice - form.value.presellDeposit).toFixed(2))
}

// 提交表单
async function handleSubmit() {
  try {
    submitting.value = true

    // 验证预售时间
    if (form.value.presellStatus) {
      const now = new Date()
      const startTime = new Date(form.value.presellStartTime)
      const endTime = new Date(form.value.presellEndTime)
      const deliveryTime = new Date(form.value.presellDeliveryTime)
      const finalStartTime = new Date(form.value.presellFinalStartTime)
      const finalEndTime = new Date(form.value.presellFinalEndTime)

      if (startTime <= now) {
        throw new Error('预售开始时间必须大于当前时间')
      }

      if (endTime <= startTime) {
        throw new Error('预售结束时间必须晚于开始时间')
      }

      if (deliveryTime <= endTime) {
        throw new Error('发货时间必须晚于预售结束时间')
      }

      if (finalStartTime <= endTime) {
        throw new Error('尾款支付开始时间必须晚于预售结束时间')
      }

      if (finalEndTime <= finalStartTime) {
        throw new Error('尾款支付截止时间必须晚于开始时间')
      }
    }

    const response = await  api.put(`/sys/prod/prod/presell/${prodId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...form.value,
        presellStartTime: formatToDateTime(form.value.presellStartTime),
        presellEndTime: formatToDateTime(form.value.presellEndTime),
        presellDeliveryTime: formatToDateTime(form.value.presellDeliveryTime),
        presellFinalStartTime: formatToDateTime(form.value.presellFinalStartTime),
        presellFinalEndTime: formatToDateTime(form.value.presellFinalEndTime)
      })
    })

    const result = await response.data

    if (result.code === 200) {
      $q.notify({
        type: 'positive',
        message: '保存成功'
      })
      router.back()
    } else {
      throw new Error(result.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  } finally {
    submitting.value = false
  }
}

// 格式化日期时间
function formatToDateTime(date: string | null): string {
  if (!date) return ''

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

onMounted(() => {
  if (prodId) {
    loadData()
  }
})
</script>

<style lang="scss" scoped>
.presell-edit {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;

  .edit-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .product-info {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 0;

    .product-image {
      border-radius: 4px;
    }

    .product-details {
      .text-subtitle1 {
        font-weight: 500;
      }
    }
  }

  .presell-form {
    padding: 20px 0;
  }
}
</style>
