<template>
  <div class="sku-list">
    <!-- 面包屑导航 -->
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">SKU 列表</div>
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

    <!-- 商品信息卡片 -->
    <q-card v-if="productInfo" class="product-info q-ma-md">
      <q-card-section>
        <div class="row items-center">
          <q-img
            :src="getImageUrl(productInfo.pic)"
            class="product-image"
            width="80px"
            height="80px"
          />
          <div class="product-details q-ml-md">
            <div class="text-h6">{{ productInfo.prodName }}</div>
            <div class="text-caption text-grey">商品编码: {{ productInfo.prodCode }}</div>
            <div class="text-caption">
              <q-chip
                :color="getProductTypeColor(productInfo.prodType)"
                text-color="white"
                size="sm"
              >
                {{ getProductTypeName(productInfo.prodType) }}
              </q-chip>
              <q-chip
                :color="productInfo.status === 1 ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
              >
                {{ productInfo.status === 1 ? '已上架' : '已下架' }}
              </q-chip>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- 根据商品类型显示不同的信息 -->
      <q-card-section v-if="productInfo.prodType !== ProductType.NORMAL">
        <q-separator class="q-my-md" />

        <!-- 预售商品信息 -->
        <template v-if="productInfo.prodType === ProductType.PRESELL">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <div class="text-caption text-grey">预售时间</div>
              <div>{{ formatDateTime(productInfo.presellStartTime) }} ~ {{ formatDateTime(productInfo.presellEndTime) }}</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-caption text-grey">预计发货</div>
              <div>{{ formatDateTime(productInfo.presellDeliveryTime) }}</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-caption text-grey">尾款支付时间</div>
              <div>{{ formatDateTime(productInfo.presellFinalStartTime) }} ~ {{ formatDateTime(productInfo.presellFinalEndTime) }}</div>
            </div>
          </div>
        </template>

        <!-- 团购商品信息 -->
        <template v-else-if="productInfo.prodType === ProductType.GROUP">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey">最低成团人数</div>
              <div>{{ productInfo.groupMinNum }} 人</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey">当前已参团</div>
              <div>{{ productInfo.groupJoinedNum || 0 }} 人</div>
            </div>
          </div>
        </template>

        <!-- 秒杀商品信息 -->
        <template v-else-if="productInfo.prodType === ProductType.SECKILL">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="text-caption text-grey">秒杀时间</div>
              <div>{{ formatDateTime(productInfo.seckillStartTime) }} ~ {{ formatDateTime(productInfo.seckillEndTime) }}</div>
            </div>
          </div>
        </template>
      </q-card-section>
    </q-card>

    <!-- SKU列表表格 -->
    <q-card class="q-ma-md">

      <q-card-section>
        <div class="text-h6">SKU列表</div>
      </q-card-section>
      <q-card-section>
        <q-input
            v-model="multiple"
            dense
            outlined
            style="min-width: 200px"
        />
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="skuList"
          :columns="columns"
          row-key="skuId"
          :loading="loading"
        >
          <!-- SKU图片 -->
          <template v-slot:body-cell-pic="props">
            <q-td :props="props">
              <div class="sku-image-container">
                <q-img
                  :src="getImageUrl(props.row.pic || productInfo?.pic)"
                  width="80px"
                  height="80px"
                  class="rounded-borders cursor-pointer"
                  @click="previewImage(props.row.pic || productInfo?.pic)"
                />
                <q-btn
                  round
                  dense
                  flat
                  color="primary"
                  icon="edit"
                  class="edit-image-btn"
                  @click="handleEditImage(props.row)"
                >
                  <q-tooltip>修改图片</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- SKU名称编辑 -->
          <template v-slot:body-cell-skuName="props">
            <q-td :props="props">
              <q-input
                v-model="props.row.skuName"
                dense
                outlined
                style="min-width: 200px"
                @update:model-value="value => handleSkuNameChange(props.row, value)"
              />
            </q-td>
          </template>
          <!-- 价格编辑 -->
          <template v-slot:body-cell-price="props">
            <q-td :props="props">
              <div class="price-edit">
                <q-input
                    v-model="props.row.rmb"
                    dense
                    outlined
                    label="人民币"
                    @update:model-value="value => headUpdatePrice(props.row, value)"
                />
                <money-input
                  v-model="props.row.price"
                  dense
                  outlined
                  label="售价"
                  @update:model-value="value => handlePriceChange(props.row, 'price', value)"
                />
                <money-input
                  v-model="props.row.oriPrice"
                  dense
                  outlined
                  label="原价"
                  @update:model-value="value => handlePriceChange(props.row, 'oriPrice', value)"
                />
              </div>
            </q-td>
          </template>

          <!-- 特殊价格编辑 -->
          <template v-slot:body-cell-specialPrice="props">
            <q-td :props="props">
              <div class="special-price-edit">
                <template v-if="productInfo?.prodType === ProductType.GROUP">
                  <money-input
                    v-model="props.row.groupPrice"
                    dense
                    outlined
                    label="团购价"
                    @update:model-value="value => handlePriceChange(props.row, 'groupPrice', value)"
                  />
                  <q-input
                    v-model.number="props.row.groupMinNum"
                    type="number"
                    dense
                    outlined
                    label="成团人数"
                    :rules="[val => val >= 2 || '最少2人']"
                    @update:model-value="value => handlePriceChange(props.row, 'groupMinNum', value)"
                  />
                </template>
                <template v-else-if="productInfo?.prodType === ProductType.PRESELL">
                  <div class="special-price-edit">
                    <money-input
                      v-model="props.row.presellPrice"
                      dense
                      outlined
                      label="预售价"
                      style="width: 150px"
                      @update:model-value="value => handlePriceChange(props.row, 'presellPrice', value)"
                    />
                    <money-input
                      v-model="props.row.presellDeposit"
                      dense
                      outlined
                      label="定金"
                      style="width: 150px"
                      @update:model-value="value => handlePriceChange(props.row, 'presellDeposit', value)"
                    />
                    <div class="text-caption text-grey q-mt-sm">
                      尾款: ¥{{ calculateFinalPayment(props.row) }}
                    </div>
                  </div>
                </template>
              </div>
            </q-td>
          </template>

          <!-- 库存编辑 -->
          <template v-slot:body-cell-actualStocks="props">
            <q-td :props="props">
              <q-input
                v-model.number="props.row.actualStocks"
                type="number"
                dense
                outlined
                style="min-width: 120px"
                @update:model-value="value => handleStockChange(props.row, value)"
              />
            </q-td>
          </template>

          <!-- 状态切换 -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <div class="status-section">
                <!-- 状态显示 -->
                <q-chip
                  :color="props.row.status === 1 ? 'positive' : 'negative'"
                  text-color="white"
                  size="sm"
                >
                  {{ props.row.status === 1 ? '已上架' : '已下架' }}
                </q-chip>

                <!-- 状态切换按钮 -->
                <q-btn
  :color="props.row.status === 1 ? 'negative' : 'positive'"
  :icon="props.row.status === 1 ? 'visibility_off' : 'visibility'"
  :loading="props.row.statusChanging"
  @click="handleStatusChange(props.row)"
/>
              </div>
            </q-td>
          </template>

          <!-- 操作列 -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                color="primary"
                label="保存"
                dense
                flat
                @click="saveSkuChanges(props.row)"
                :loading="props.row.saving"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
      <q-card-section>
        <source-price-component
            :source-url="productInfo?.sourceUrl"
        />
      </q-card-section>
    </q-card>

    <!-- 图片上传对话框 -->
    <q-dialog v-model="imageDialog.show">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">修改SKU图片</div>
        </q-card-section>

        <q-card-section>
          <image-uploader
            v-model="imageDialog.imageUrl"
            :aspect-ratio="1"
            @upload-success="handleImageUploadSuccess"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn
            flat
            label="确定"
            color="primary"
            @click="confirmSkuImage"
            :disable="!imageDialog.imageUrl"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'
import MoneyInput from '~/components/common/MoneyInput.vue'
import ImageUploader from '~/components/ImageUploader.vue'
const router = useRouter()

const route = useRoute()
const $q = useQuasar()

// 商品类型枚举
enum ProductType {
  NORMAL = 1,
  PRESELL = 2,
  GROUP = 3,
  SECKILL = 4
}

// 状态数据
const prodId = ref(route.query.prodId)
const loading = ref(false)
const productInfo = ref<any>(null)
const skuList = ref<any[]>([])
const imageDialog = ref({
  show: false,
  imageUrl: '',
  currentSku: null
})

// 表格列定义
const columns = computed(() => {
  const baseColumns = [
    {
      name: 'pic',
      label: '图片',
      align: 'center',
      field: 'pic'
    },
    {
      name: 'skuName',
      label: 'SKU名称',
      align: 'left',
      field: 'skuName'
    },
    {
      name: 'properties',
      label: '规格属性',
      align: 'left',
      field: 'properties'
    },
    {
      name: 'price',
      label: '价格信息',
      align: 'right',
      field: row => row,
      format: (row: any) => {
        const prices = [`售价: ¥${row.price}`]
        if (row.oriPrice) {
          prices.push(`原价: ¥${row.oriPrice}`)
        }
        return prices.join('\n')
      }
    }
  ]

  // 根据商品类型添加特殊价格列
  if (productInfo.value?.prodType === ProductType.PRESELL) {
    baseColumns.push({
      name: 'specialPrice',
      label: '预售价格',
      align: 'right',
      field: row => row
    })
  } else if (productInfo.value?.prodType === ProductType.GROUP) {
    baseColumns.push({
      name: 'specialPrice',
      label: '团购价格',
      align: 'right',
      field: row => row
    })
  } else if (productInfo.value?.prodType === ProductType.SECKILL) {
    baseColumns.push({
      name: 'seckillPrice',
      label: '秒杀价格',
      align: 'right',
      field: 'seckillPrice',
      format: (val: number) => `¥${val}`
    })
  }

  // 添加库存和状态列
  return [
    ...baseColumns,
    {
      name: 'actualStocks',
      label: '库存',
      align: 'right',
      field: 'actualStocks'
    },
    {
      name: 'status',
      label: '状态',
      align: 'center',
      field: 'status'
    },
    {
      name: 'actions',
      label: '操作',
      align: 'center',
      field: row => row
    }
  ]
})

// 加载数据
async function loadData() {
  loading.value = true
  try {
    // 加载商品信息
    // const productResponse = await api.get(`/prod/detail?id=${prodId.value}`)
    // if (productResponse.data.code === 200) {
    //   productInfo.value = productResponse.data.data
    // }
    const response = await api.get(`/sys/prod/detail/${prodId.value}`)
    const result = await response.data
    //console.log('商品数据:', result)

    if (result.code === 200) {
      productInfo.value = result.data
    //   content.value = result.data.content || ''
      //console.log('商品详情内容:', productInfo.value)
    }

    // 加载SKU列表
    const skuResponse = await api.get(`/sys/sku/list`, {
      params: { prodId: prodId.value }
    })
    if (skuResponse.data.code === 200) {
      skuList.value = skuResponse.data.data || []
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载数据失败'
    })
  } finally {
    loading.value = false
  }
}

// 获取商品类型名称
function getProductTypeName(type: ProductType): string {
  const types = {
    [ProductType.NORMAL]: '普通商品',
    [ProductType.PRESELL]: '预售商品',
    [ProductType.GROUP]: '团购商品',
    [ProductType.SECKILL]: '秒杀商品'
  }
  return types[type] || '未知类型'
}

// 获取商品类型颜色
function getProductTypeColor(type: ProductType): string {
  const colors = {
    [ProductType.NORMAL]: 'primary',
    [ProductType.PRESELL]: 'orange',
    [ProductType.GROUP]: 'green',
    [ProductType.SECKILL]: 'red'
  }
  return colors[type] || 'grey'
}


function previewImage(url: string) {
  if (!url) return
  window.open(getImageUrl(url), '_blank')
}

function handleEditImage(sku: any) {
  imageDialog.value = {
    show: true,
    imageUrl: sku.pic || '',
    currentSku: sku
  }
}

function handleImageUploadSuccess(url: string) {
  imageDialog.value.imageUrl = url
}

async function confirmSkuImage() {
  if (!imageDialog.value.currentSku || !imageDialog.value.imageUrl) return

  try {
    const sku = imageDialog.value.currentSku
    sku.pic = imageDialog.value.imageUrl
    sku.modified = true

    await saveSkuChanges(sku)
    imageDialog.value.show = false

    $q.notify({
      type: 'positive',
      message: 'SKU图片更新成功'
    })
  } catch (error) {
    console.error('更新SKU图片失败:', error)
    $q.notify({
      type: 'negative',
      message: '更新SKU图片失败'
    })
  }
}

// SKU 数据修改相关方法
function handlePriceChange(sku: any, field: string, value: number) {
  sku[field] = value
  sku.modified = true

  // 如果是预售相关的价格变更，重新计算尾款
  if (field === 'presellPrice' || field === 'presellDeposit') {
    calculateFinalPayment(sku)
  }
}

function handleStockChange(sku: any, value: number) {
  sku.actualStocks = value
  sku.modified = true
}
const multiple=ref(1.6);
function headUpdatePrice(sku: any,price:number) {
  sku.modified = true
  // 获取元素值并转换为浮点数
  // let multiple = 1.6;

  // 计算初始 usprice
  let uspriceInitial = (price / 7) * multiple.value;

  // 四舍五入到一位小数
  let uspriceRounded = parseFloat(uspriceInitial.toFixed(1));

  // 确保结果以 9 结尾
  let uspriceFinal;
  if (uspriceRounded % 1 !== 0.9) { // 检查小数部分是否为 .9
    uspriceFinal = Math.floor(uspriceRounded) + 0.9;
  } else {
    uspriceFinal = uspriceRounded;
  }
  sku.price=uspriceFinal;
  if(20> sku.price) {
    sku.oriPrice = uspriceFinal + 3;
  }else {
    if (50 > sku.price) {
      sku.oriPrice = uspriceFinal + 4;
    }else{
      if (100 > sku.price) {
        sku.oriPrice = uspriceFinal + 10;
      }else{
        sku.oriPrice = uspriceFinal + 20;
      }
    }
  }
}
async function handleStatusChange(sku: any) {
   const response= await api.post('/sys/sku/update/status',  JSON.stringify({
      "skuId": sku.skuId,
      "prodId": prodId.value,
      "status": sku.status === 1 ? 0 : 1
     })
   );
   //console.log(response);
   if(response.data.code===200){
    sku.statusChanging=false;
    sku.status= (sku.status===1)?0:1;
   }

}
// 保存 SKU 修改
async function saveSkuChanges(sku: any) {
  if (!sku.modified) return

  try {
    sku.saving = true
    const submitData = {
      skuId: sku.skuId,
      price: Number(sku.price || 0),
      oriPrice: Number(sku.oriPrice || 0),
      actualStocks: Number(sku.actualStocks || 0),
      status: sku.status,
      pic: sku.pic,
      groupPrice: Number(sku.groupPrice || 0),
      groupMinNum: Number(sku.groupMinNum || 0),
      presellPrice: Number(sku.presellPrice || 0),
      presellDeposit: Number(sku.presellDeposit || 0),
      presellFinalPayment: Number(sku.presellFinalPayment || 0)
    }

    const response = await api.post('/sys/sku/update', submitData)

    if (response.data.code === 200) {
      delete sku.modified
      $q.notify({
        type: 'positive',
        message: 'SKU更新成功'
      })
    } else {
      throw new Error(response.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存SKU修改失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  } finally {
    sku.saving = false
  }
}

// 格式化日期时间
function formatDateTime(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 在 setup 中添加处理函数
const handleSkuNameChange = async (sku: any, value: string) => {
  try {
    sku.skuName = value
    sku.modified = true
    await saveSkuChanges(sku)
  } catch (error) {
    console.error('修改SKU名称失败:', error)
    $q.notify({
      type: 'negative',
      message: '修改SKU名称失败'
    })
  }
}

// 计算预售尾款
function calculateFinalPayment(sku: any) {
  const presellPrice = Number(sku.presellPrice || 0)
  const presellDeposit = Number(sku.presellDeposit || 0)
  sku.presellFinalPayment = presellPrice - presellDeposit
  return sku.presellFinalPayment
}

onMounted(() => {
  if (prodId.value) {
    loadData()
  }
})
</script>

<style lang="scss" scoped>
.sku-list {
  .product-info {
    .product-image {
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .product-details {
      .text-h6 {
        margin: 0;
        line-height: 1.2;
      }

      .q-chip {
        margin-right: 8px;
      }
    }
  }

  .sku-image-container {
    position: relative;
    display: inline-block;

    .edit-image-btn {
      position: absolute;
      right: 4px;
      bottom: 4px;
      background: rgba(255, 255, 255, 0.8);
    }
  }

  .price-edit,
  .special-price-edit {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .q-input {
      width: 120px;
    }
  }

  .q-btn-toggle {
    .q-btn {
      padding: 4px 8px;
      min-height: 32px;
    }
  }

  .q-table {
    :deep(td) {
      white-space: pre-line;
      vertical-align: middle;
    }

    .price-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .original-price {
        text-decoration: line-through;
        color: #999;
        font-size: 12px;
      }
    }
  }
}
.status-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
