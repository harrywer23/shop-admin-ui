<template>
  <div class="basic-edit">
    <q-card class="edit-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">基本信息</div>
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

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- 商品类型选择 -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.prodType"
                :options="productTypeOptions"
                label="商品类型"
                outlined
                emit-value
                map-options
                @update:model-value="handleProdTypeChange"
              />
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.prodName"
                label="商品名称"
                outlined
                :rules="[val => !!val || '请输入商品名称']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.brief"
                type="textarea"
                label="商品简介"
                outlined
                autogrow
              />
            </div>
          </div>

          <!-- 价格和库存 -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="form.oriPrice"
                type="number"
                label="商品原价"
                outlined
                :rules="[val => val > 0 || '原价必须大于0']"
              />
            </div>

            <!-- 普通商品价格 -->
            <div v-if="form.prodType === ProductType.NORMAL" class="col-12 col-md-4">
              <q-input
                v-model.number="form.price"
                type="number"
                label="商品售价"
                outlined
                :rules="[
                  val => val > 0 || '售价必须大于0',
                  val => val <= form.oriPrice || '售价不能高于原价'
                ]"
              />
            </div>

            <!-- 团购设置 -->
            <template v-if="form.prodType === ProductType.GROUP">
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.groupPrice"
                  type="number"
                  label="团购价格"
                  outlined
                  :rules="[
                    val => val > 0 || '团购价必须大于0',
                    val => val <= form.oriPrice || '团购价不能高于原价'
                  ]"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.groupMinNum"
                  type="number"
                  label="最低成团人数"
                  outlined
                  :rules="[
                    val => val >= 2 || '最低成团人数不能少于2人',
                    val => Number.isInteger(val) || '成团人数必须是整数'
                  ]"
                />
              </div>
            </template>

            <!-- 预售设置 -->
            <template v-if="form.prodType === ProductType.PRESELL">
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.presellPrice"
                  type="number"
                  label="预售价格"
                  outlined
                  :rules="[val => val > 0 || '预售价格必须大于0']"
                  @update:model-value="updateFinalPayment"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.presellDeposit"
                  type="number"
                  label="预售定金"
                  outlined
                  :rules="[
                    val => val > 0 || '定金必须大于0',
                    val => val < form.presellPrice || '定金不能大于预售价格'
                  ]"
                  @update:model-value="updateFinalPayment"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.presellFinalPayment"
                  type="number"
                  label="尾款金额"
                  outlined
                  disable
                />
              </div>

              <!-- 预售时间设置 -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.presellStartTime"
                  type="datetime-local"
                  label="预售��始时间"
                  outlined
                  :rules="[val => !!val || '请选择预售开始时间']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.presellEndTime"
                  type="datetime-local"
                  label="预售结束时间"
                  outlined
                  :rules="[
                    val => !!val || '请选择预售结束时间',
                    val => new Date(val) > new Date(form.presellStartTime) || '结束时间必须晚于开始时间'
                  ]"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.presellDeliveryTime"
                  type="datetime-local"
                  label="预计发货时间"
                  outlined
                  :rules="[
                    val => !!val || '请选择预计发货时间',
                    val => new Date(val) > new Date(form.presellEndTime) || '发货时间必须晚于预售结束时间'
                  ]"
                />
              </div>
            </template>

            <!-- 秒杀设置 -->
            <template v-if="form.prodType === ProductType.SECKILL">
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.seckillPrice"
                  type="number"
                  label="秒杀价格"
                  outlined
                  :rules="[
                    val => val > 0 || '秒杀价格必须大于0',
                    val => val < form.oriPrice || '秒杀价格不能高于原价'
                  ]"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.seckillStartTime"
                  type="datetime-local"
                  label="秒杀开始时间"
                  outlined
                  :rules="[val => !!val || '请选择秒杀开始时间']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.seckillEndTime"
                  type="datetime-local"
                  label="秒杀结束时间"
                  outlined
                  :rules="[
                    val => !!val || '请选择秒杀结束时间',
                    val => new Date(val) > new Date(form.seckillStartTime) || '结束时间必须晚于开始时间'
                  ]"
                />
              </div>
            </template>

            <!-- 库存 -->
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="form.totalStocks"
                type="number"
                label="商品总库存"
                outlined
                :rules="[val => val >= 0 || '库存不能为负数']"
              />
            </div>
          </div>

          <!-- 品质选择 -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.quality"
                :options="qualityOptions"
                :label="$t('product.edit.quality')"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || $t('product.edit.qualityRequired')]"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>
         <source-price-component
             :source-url="sourceUrl"
          >

         </source-price-component>
          <!-- 虚拟物品 -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-toggle
                v-model="form.isVirtual"
                :label="$t('product.edit.isVirtual')"
                :false-value="0"
                :true-value="1"
              />
            </div>
          </div>
          <!-- 提交按钮 -->
          <div class="row justify-end q-mt-md">
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
import {formatToDateTime} from "~/utils/format";
import * as timers from "node:timers";

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const prodId = ref(route.query.prodId)

// 商品类型枚举
enum ProductType {
  NORMAL = 1,    // 普通商品
  PRESELL = 2,   // 预售商品
  GROUP = 3,     // 团购商品
  SECKILL = 4    // 秒杀商品
}

// 商品类型选项
const productTypeOptions = [
  { label: '普通商品', value: ProductType.NORMAL },
  { label: '预售商品', value: ProductType.PRESELL },
  { label: '团购商品', value: ProductType.GROUP },
  { label: '秒杀商品', value: ProductType.SECKILL }
]

// 品质选项
const qualityOptions = [
  {
    label: 'S级 - 臻品',
    value: 'S',
    description: '各项指标均为顶级，具有极高的收藏价值'
  },
  {
    label: 'A级 - 精品',
    value: 'A',
    description: '品质优良，各项指标均达到行业���先水平'
  },
  {
    label: 'B级 - 良品',
    value: 'B',
    description: '品质中等，符合一般消费者的需求'
  },
  {
    label: 'C级 - 普品',
    value: 'C',
    description: '品质一般，价格较低'
  },
  {
    label: 'D级 - 次品',
    value: 'D',
    description: '品质较差，存在明显的缺陷'
  }
]
const sourceUrl=ref("");
// 表单数据
const form = ref({
  prodType: ProductType.NORMAL,
  prodName: '',
  oriPrice: 0,
  price: 0,
  brief: '',
  categoryId: 0,
  totalStocks: 0,
  seckillPrice: 0,
  faceValue: 0,
  seckillStartTime: '',
  seckillEndTime: '',
  presellStatus: 0,
  presellStartTime: '',
  presellEndTime: '',
  presellDeliveryTime: '',
  presellFinalStartTime:"",
  presellFinalEndTime:"",
  presellPrice: 0,
  presellDeposit: 0,
  presellFinalPayment: 0,
  groupPrice: 0,
  groupMinNum: 2,
  quality: '',  // 品质
  isVirtual: false  // 是否虚拟物品，默认为否
})

const submitting = ref(false)

// 加载商品数据
async function loadData() {
  try {
    const response = await api.get(`/sys/prod/detail/${prodId.value}`)
    const result = await response.data;
    //console.log('商品数据加载成功 1:',result);
    if (result.code === 200) {
      const { prodName, prodCode, brief, oriPrice, price, totalStocks } = result.data
      form.value = {
        prodId,
        prodName,
        prodCode,
        brief,
        oriPrice,
        price,
        totalStocks,
        ...result.data
      }
      form.value.price=result.data.price;
      form.value.oriPrice=result.data.oriPrice;
      form.value.prodName=result.data.prodName;
      form.value.prodType=result.data.prodType;
      sourceUrl.value=result.data.sourceUrl;
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载数据失败'
    })
  }
}

// 处理商品类型变化
function handleProdTypeChange(newType: ProductType) {
  // 重置相关价格字段
  if (newType === ProductType.GROUP) {
    form.value.price = 0
    form.value.groupPrice = form.value.oriPrice * 0.8 // 默认团购价为原价的8折
    form.value.groupMinNum = 2 // 默认最低2人成团
  } else {
    form.value.groupPrice = 0
    form.value.groupMinNum = 0
    form.value.price = form.value.oriPrice * 0.9 // 默认售价为原价的9折
  }

  // 更新预售状态
  form.value.presellStatus = newType === ProductType.PRESELL ? 1 : 0
}

// 更新预售尾款
function updateFinalPayment() {
  form.value.presellFinalPayment = form.value.presellPrice - form.value.presellDeposit
}

// 提交表单
async function handleSubmit() {
  try {
    submitting.value = true

    // 转换表单数据为API所需格式
    const submitData = {
      ...form.value,
      isVirtual: form.value.isVirtual ? 1 : 0,
      presellStatus: form.value.presellStatus ? 1 : 0,
      totalStocks: Number(form.value.totalStocks),
      oriPrice: Number(form.value.oriPrice),
      price: Number(form.value.price),
      faceValue: Number(form.value.faceValue || 0),
      seckillPrice: Number(form.value.seckillPrice || 0),
      presellPrice: Number(form.value.presellPrice || 0),
      presellDeposit: Number(form.value.presellDeposit || 0),
      presellFinalPayment: Number(form.value.presellFinalPayment || 0),
      groupPrice: Number(form.value.groupPrice || 0),
      groupMinNum: Number(form.value.groupMinNum || 0),
      // 处理时间格式
      presellStartTime: form.value.presellStartTime ? formatToDateTime(form.value.presellStartTime) : null,
      presellEndTime: form.value.presellEndTime ? formatToDateTime(form.value.presellEndTime) : null,
      presellDeliveryTime: form.value.presellDeliveryTime ? formatToDateTime(form.value.presellDeliveryTime) : null,
      presellFinalStartTime: form.value.presellFinalStartTime ? formatToDateTime(form.value.presellFinalStartTime) : null,
      presellFinalEndTime: form.value.presellFinalEndTime ? formatToDateTime(form.value.presellFinalEndTime) : null,
      seckillStartTime: form.value.seckillStartTime ? formatToDateTime(form.value.seckillStartTime) : null,
      seckillEndTime: form.value.seckillEndTime ? formatToDateTime(form.value.seckillEndTime) : null
    }

    const { data } = await api.post('/sys/prod/update/baseInfo', submitData)

    if (data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '保存成功'
      })
      router.back()
    } else {
      throw new Error(data.msg || '保存失败')
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

onMounted(() => {
  if (prodId.value) {
    loadData()
  }
})
</script>

<style lang="scss" scoped>
.basic-edit {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;

  .edit-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
}
</style>
