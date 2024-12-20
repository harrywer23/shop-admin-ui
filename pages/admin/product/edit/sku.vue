<template>
  <div class="sku-edit">
    <q-card class="edit-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">SKU 管理</div>
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
        <!-- SKU 规格设置 -->
        <section class="section">
          <div class="section-header">
            <div class="section-title">
              <q-icon name="settings" size="sm" class="q-mr-sm" />
              规格设置
            </div>
          </div>
          <div class="section-content">
            <sku-edit-tag
              ref="skuTagRef"
              v-model="skuProps"
              :prod-id="prodId"
              :sku-list="skuList"
              :prop-list="propList"
              :prop-value-list="propValueList"
              @update:sku-list="updateSkuList"
              @selected-props-change="handleSelectedPropsChange"
            />
          </div>
        </section>

        <!-- SKU 列表 -->
        <section class="section q-mt-lg">
          <div class="section-header">
            <div class="section-title">
              <q-icon name="list" size="sm" class="q-mr-sm" />
              SKU 列表
            </div>
          </div>
          <div class="section-content">
            <sku-table
              ref="skuTableRef"
              v-model="skuList"
              :sku-props="skuProps"
              :prod-name="prodName"
              :prod-type="prodType"
              @delete-sku="handleDeleteSku"
            />
          </div>
        </section>

        <!-- 批量操作 -->
        <section class="section q-mt-lg">
          <div class="section-header">
            <div class="section-title">
              <q-icon name="batch_prediction" size="sm" class="q-mr-sm" />
              批量设置
            </div>
          </div>
          <div class="section-content">
            <div class="row q-col-gutter-md">
              <!-- 批量设置价格 -->
              <div class="col-12 col-md-3">
                <money-input
                  v-model="batchPrice"
                  label="批量设置价格"
                  @update:model-value="handleBatchPrice"
                />
              </div>

              <!-- 批量设置库存 -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="batchStock"
                  type="number"
                  label="批量设置库存"
                  outlined
                  @update:model-value="handleBatchStock"
                />
              </div>

              <!-- 批量设置重量 -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="batchWeight"
                  type="number"
                  label="批量设置重量(kg)"
                  outlined
                  @update:model-value="handleBatchWeight"
                />
              </div>

              <!-- 批量设置体积 -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="batchVolume"
                  type="number"
                  label="批量设置体积(cm³)"
                  outlined
                  @update:model-value="handleBatchVolume"
                />
              </div>
            </div>

            <!-- 批量操作按钮 -->
            <div class="row justify-end q-mt-md">
              <q-btn
                color="warning"
                icon="sync"
                label="同步到所有SKU"
                @click="syncToAllSkus"
              />
            </div>
          </div>
        </section>
        <source-price-component
            :source-url="sourceUrl"
        />
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
            label="保存"
            color="primary"
            :loading="submitting"
            @click="handleSubmit"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import SkuEditTag from '~/components/product/SkuEditTag.vue'
import SkuTable from '~/components/product/SkuTable.vue'
import MoneyInput from '~/components/common/MoneyInput.vue'

// 定义接口
interface ProdProp {
  propId: number | string
  propName: string
  rule: number
  shopId?: number
  prodId?: number
}

interface ProdPropValue {
  valueId: number | string
  propValue: string
  propId: number | string
  prodId?: string
}

interface Sku {
  skuId: number | string
  tempId: string
  prodId: number | string
  properties: string
  oriPrice: number
  price: number
  stocks: number
  actualStocks: number
  pic?: string
  skuName?: string
  weight?: number
  volume?: number
  status?: number
  prodType?: number
  groupPrice?: number
  groupMinNum?: number
}

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const prodId = ref(route.query.prodId)
const submitting = ref(false)

// SKU 相关数据
// 修改 SKU 相关的数据定义和初始化
interface SkuProps {
    propId: number | string
    propName: string
    values: Array<{
      valueId: number | string
      propValue: string
    }>
}

// SKU相关
const skuProps = ref<SkuProps[]>()
const skuList = ref<Sku[]>([])
const propList = ref<ProdProp[]>([])
const propValueList = ref<ProdPropValue[]>([])
const prodName = ref('')
const prodType = ref(1)

// 批量设置数据
const batchPrice = ref(0)
const batchStock = ref(0)
const batchWeight = ref(0)
const batchVolume = ref(0)

// 组件引用
const skuTagRef = ref(null)
const skuTableRef = ref(null)

// 加载商品数据
async function loadProductData() {
  try {
    //console.log('=== 开始加载商品数据 ===')
    const response = await api.get(`/sys/prod/detail/${prodId.value}`)
    const result = await response.data
    //console.log('商品数据:', result)

    if (result.code === 200) {
      const {
        prodName: name,
        prodType: type,
        skuList: skus,
        propList: props,
        propValueList: propValues
      } = result.data

      prodName.value = name
      prodType.value = type
      skuList.value = skus || []
      propList.value = props || []
      propValueList.value = propValues || []
      // 正确处理 SKU 属性数据
      if (propList && Array.isArray(propList.value)) {
        skuProps.value = propList.value
        //console.log("格式化后的 SKU 属性:", skuProps.value)
      }
      // 初始化 SKU 组件
      if (skuTagRef.value?.init) {
        skuTagRef.value.init({
          skuList: skuList.value,
          propList: propList.value,
          propValueList: propValueList.value
        })
      }
    }
  } catch (error) {
    console.error('加载商品数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载商品数据失败'
    })
  }
  //console.log('=== 商品数据加载完成 ===')
}

// 更新 SKU 列表
function updateSkuList(newList: Sku[]) {
  //console.log('更新SKU列表:', newList)
  skuList.value = newList
}

// 处理规格属性变化
function handleSelectedPropsChange(data: {
  selectedProps: ProdProp[],
  selectedPropValues: ProdPropValue[]
}) {
  //console.log('规格属性变化:', data)
  propList.value = data.selectedProps
  propValueList.value = data.selectedPropValues
}

// 提交表单
async function handleSubmit() {
  try {
    submitting.value = true
    const response = await api.post('/sys/sku/update-sku', JSON.stringify({
        prodId: prodId.value,
        skuList: skuList.value,
        propList: propList.value,
        propValueList: propValueList.value
      })
    )

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

onMounted(() => {
  if (prodId.value) {
    loadProductData()
  }
})
// 添加 SKU 属性变化的监听
watch(() => skuProps.value, (newProps) => {
  //console.log("SKU 属性发生变化:", newProps)
  // 确保 SkuTag 组件收到更新
  nextTick(() => {
    if (skuTagRef.value?.init) {
      skuTagRef.value.init(newProps)
    }
  })
}, { deep: true })

function handleDeleteSku({ skuId, tempId, properties }: { skuId: number | string, tempId: string, properties: string }) {
  console.log('父组件收到删除请求:', { skuId, tempId, properties })

  // 使用 properties 作为备用标识符
  const updatedList = skuList.value.filter(sku => {
    if (tempId && sku.tempId) {
      return sku.tempId !== tempId
    }
    if (skuId && sku.skuId) {
      return sku.skuId !== skuId
    }
    // 如果都没有，使用 properties 匹配
    return sku.properties !== properties
  })

  console.log('更新前:', skuList.value.length)
  console.log('更新后:', updatedList.length)

  // 使用新数组更新
  skuList.value = updatedList

  $q.notify({
    type: 'positive',
    message: 'SKU 已删除',
    position: 'top'
  })
}
</script>

<style lang="scss" scoped>
.sku-edit {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;

  .edit-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .section {
    background: #f8f9fa;
    border-radius: 8px;
    overflow: hidden;

    .section-header {
      padding: 16px;
      background: #f1f3f4;
      border-bottom: 1px solid #e0e0e0;

      .section-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 500;
        color: #333;

        .q-icon {
          color: var(--primary-color);
        }
      }
    }

    .section-content {
      padding: 20px;
    }
  }

  .selected-props {
    background: white;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;

    .prop-chip {
      margin: 4px;

      .prop-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .prop-name {
          font-weight: 500;
        }

        .prop-values {
          font-size: 12px;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .values-section {
    .values-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      min-height: 40px;
      padding: 8px;
      border: 1px dashed #e0e0e0;
      border-radius: 4px;
    }
  }

  :deep(.q-field--money) {
    .q-field__native {
      min-width: 120px;
    }
  }

  .section-content {
    .row {
      .col-12 {
        @media (min-width: 1024px) {
          flex: 0 0 25%;
          max-width: 25%;
        }

        .q-field {
          width: 100%;

          .q-field__inner {
            min-width: 150px;
          }
        }
      }
    }
  }
}
</style>
