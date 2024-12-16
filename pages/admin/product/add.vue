<template>
  <div class="prod-info">
    <q-card class="form-card">
      <q-form @submit.prevent="submitForm" class="q-pa-md">
        <!-- 顶部状态栏 -->
        <div class="status-bar q-mb-lg">
          <div class="text-h6">{{ dataForm.prodId ? '编辑商品' : '新增商品' }}</div>
        </div>

        <!-- 分段表单内容 -->
        <div class="form-sections q-gutter-y-lg">
          <!-- 商品图片部分 -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-title">
                <q-icon name="photo_camera" size="sm" class="q-mr-sm" />
                商品图片
              </div>
            </div>
            <div class="section-content">
              <image-uploader
                  v-model="dataForm.pic"
                  class="q-mb-md"
              />
              <div class="text-caption text-grey-6">
                建议尺寸: 800x800像素，支持jpg、png格式
              </div>
            </div>
          </section>

          <!-- 在商品图片部分添加宣传图片上传 -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-title">
                <q-icon name="photo_library" size="sm" class="q-mr-sm" />
                宣传图片
              </div>
            </div>
            <div class="section-content">
              <!-- 图片上传组件 -->
              <div class="promo-images">
                <!-- 已上传图片预览 -->
                <div class="image-list" v-if="dataForm.imgs">
                  <div
                    v-for="(img, index) in imgList"
                    :key="index"
                    class="image-item"
                  >
                    <q-img
                      :src="getImageUrl(img)"
                      spinner-color="primary"
                      spinner-size="24px"
                    />
                    <div class="image-actions">
                      <q-btn
                        round
                        flat
                        dense
                        color="negative"
                        icon="delete"
                        @click="removeImage(index)"
                      >
                        <q-tooltip>删除图片</q-tooltip>
                      </q-btn>
                      <q-btn
                        round
                        flat
                        dense
                        color="primary"
                        icon="visibility"
                        @click="previewImage(img)"
                      >
                        <q-tooltip>预览图片</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>

                <!-- 上传按钮 -->
                <q-file
                  v-model="uploadFiles"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif"
                  style="display: none"
                  @update:model-value="handleFileUpload"
                  ref="fileInput"
                />

                <div class="upload-trigger" @click="triggerUpload">
                  <q-icon name="add_photo_alternate" size="32px" color="grey-6" />
                  <div class="upload-text">
                    点击上传宣传图片
                    <div class="upload-hint">
                      支持jpg、png格式，建议尺寸800x800像素
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 图片预览对话框 -->
            <q-dialog v-model="previewVisible">
              <q-card class="preview-dialog">
                <q-card-section class="row items-center">
                  <div class="text-h6">图片预览</div>
                  <q-space />
                  <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <q-card-section>
                  <q-img
                    :src="previewUrl"
                    spinner-color="primary"
                    spinner-size="24px"
                  />
                </q-card-section>
              </q-card>
            </q-dialog>
          </section>

          <!-- 基本信息部分 -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-title">
                <q-icon name="info" size="sm" class="q-mr-sm" />
                基本信息
              </div>
            </div>
            <div class="section-content">
              <div class="row q-col-gutter-md">
                <!-- 分类显示 -->
                <div class="col-12">
                  <div class="category-card" v-if="dataForm.categoryName">
                    <q-icon name="category" class="q-mr-sm" />
                    <span class="text-weight-medium">当前分类:</span>
                    <span class="category-name q-ml-sm">{{ dataForm.categoryName }}</span>
                  </div>
                </div>

                <!-- 标签选择 -->
                <div class="col-12">
                  <q-select
                      v-model="dataForm.tagList"
                      :options="tags"
                      option-label="title"
                      option-value="id"
                      label="产品分组"
                      multiple
                      filled
                      use-chips
                      class="full-width"
                  />
                </div>

                <!-- 产品名称 -->
                <div class="col-12">
                  <q-input
                      v-model="dataForm.prodName"
                      label="产品名称"
                      filled
                      :rules="[
                      val => !!val || '产品名称不能为空',
                      val => val.length <= 100 || '产品名称不能超过100个字符'
                    ]"
                  />
                </div>

                <!-- 产品卖点 -->
                <div class="col-12">
                  <q-input
                      v-model="dataForm.brief"
                      type="textarea"
                      label="产品卖点"
                      filled
                      autogrow
                      class="full-width"
                  />
                </div>

                <!-- 商品类型选择 -->
                <div class="col-12">
                  <q-select
                    v-model="dataForm.prodType"
                    :options="productTypeOptions"
                    label="商品类型"
                    filled
                    emit-value
                    map-options
                    @update:model-value="handleProductTypeChange"
                  />
                </div>

                <!-- 在商品类型选择后添加秒杀设置 -->
                <template v-if="dataForm.prodType === ProductType.SECKILL">
                  <div class="col-12">
                    <div class="seckill-settings">
                      <div class="section-title q-mb-md">
                        <q-icon name="timer" size="sm" class="q-mr-sm" />
                        秒杀时间设置
                      </div>
                      <div class="row q-col-gutter-md">
                        <!-- 秒杀开始时间 -->
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="dataForm.seckillStartTime"
                            type="datetime-local"
                            label="秒杀开始时间"
                            filled
                            :rules="[
                              val => !!val || '请选择秒杀开始时间',
                              val => new Date(val) > new Date() || '开始时间必须大于当前时间'
                            ]"
                          />
                        </div>

                        <!-- 秒杀结束时间 -->
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="dataForm.seckillEndTime"
                            type="datetime-local"
                            label="秒杀结束时间"
                            filled
                            :rules="[
                              val => !!val || '请选择秒杀结束时间',
                              val => new Date(val) > new Date(dataForm.seckillStartTime) || '结束时间必须晚于开始时间'
                            ]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 价格信息 -->
                <div class="col-12">
                  <div class="price-inputs row q-col-gutter-md">
                    <!-- 原价 -->
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="dataForm.oriPrice"
                        label="商品原价"
                        filled
                        :rules="[
                          val => val >= 0 || '原价不能为负数'
                        ]"
                        mask="#.##"
                        fill-mask="0"
                        reverse-fill-mask
                        hint="Mask: #.##"
                      >
                        <template v-slot:prepend>
                          <q-icon name="attach_money" />
                        </template>
                      </q-input>
                    </div>

                    <!-- 售价 -->
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="dataForm.price"
                        label="商品售价"
                        filled
                        :rules="[
                          val => val >= 0 || '售价不能为负数',
                          val => !dataForm.oriPrice || val <= dataForm.oriPrice || '售价不能高于原价'
                        ]"
                        mask="#.##"
                        fill-mask="0"
                        reverse-fill-mask
                        hint="Mask: #.##"
                      >
                        <template v-slot:prepend>
                          <q-icon name="sell" />
                        </template>
                      </q-input>
                    </div>

                    <!-- 总库存 -->
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model.number="dataForm.totalStocks"
                        type="number"
                        label="商品总库存"
                        filled
                        :rules="[
                          val => val >= 0 || '库存不能为负数'
                        ]"
                      >
                        <template v-slot:prepend>
                          <q-icon name="inventory_2" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                </div>

                <!-- 在基本信息部分添加商品编码 -->
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="dataForm.prodCode"
                    label="商品编码"
                    filled
                    :rules="[
                      val => val.length <= 50 || '商品编码不能超过50个字符'
                    ]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="qr_code" />
                    </template>
                    <template v-slot:append>
                      <q-btn
                        round
                        dense
                        flat
                        icon="autorenew"
                        @click="generateProdCode"
                      >
                        <q-tooltip>生成编码</q-tooltip>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </section>

          <!-- 预售设置部分 -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-title">
                <q-icon name="schedule" size="sm" class="q-mr-sm" />
                预售设置
              </div>
            </div>
            <div class="section-content">
              <!-- 预售开关 -->
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-toggle
                      v-model="dataForm.presellStatus"
                      label="开启预售"
                      color="primary"
                      :false-value="0"
                      :true-value="1"
                  />
                </div>

                <!-- 预售信息 -->
                <template v-if="dataForm.presellStatus">
                  <div class="col-12 col-md-6">
                    <q-input
                        v-model.number="dataForm.presellPrice"
                        type="number"
                        label="预售价格"
                        filled
                        :rules="[val => val > 0 || '预售价格必须大于0']"
                        @update:model-value="updateValue()"
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                        v-model.number="dataForm.presellDeposit"
                        type="number"
                        label="预售定金"
                        filled
                        :rules="[
                        val => val > 0 || '定金必须大于0',
                        val => val < dataForm.presellPrice || '定金不能大于预售价格'
                      ]"
                       @update:model-value="updateValue()"
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                        disable
                        v-model.number="dataForm.presellFinalPayment"
                        type="number"
                        label="尾款金额"
                        filled
                        readonly
                    />

<!--                    <q-td :props="dataForm">-->
<!--          <div class="text-subtitle2">-->
<!--            {{ ( }}-->
<!--          </div>-->
<!--        </q-td>-->
                  </div>

                  <!-- 预售时间设置 -->
                  <div class="col-12 col-md-6">
                    <q-input
                        v-model="dataForm.presellStartTime"
                        type="datetime-local"
                        label="预售开始时间"
                        filled
                        :rules="[val => !!val || '请选择预售开始时间']"
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                        v-model="dataForm.presellEndTime"
                        type="datetime-local"
                        label="预售结束时间"
                        filled
                        :rules="[
                        val => !!val || '择预售结束时间',
                        val => new Date(val) > new Date(dataForm.presellStartTime) || '结束时间必须晚于开始时间'
                      ]"
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                        v-model="dataForm.presellDeliveryTime"
                        type="datetime-local"
                        label="预计发时间"
                        filled
                        :rules="[
                        val => !!val || '请选择预计发货时间',
                        val => new Date(val) > new Date(dataForm.presellEndTime) || '发货时必须晚预售结束时间'
                      ]"
                    />
                  </div>

                  <!-- 尾款支付时间 -->
                  <div class="col-12 col-md-6">
                    <q-input
                        v-model="dataForm.presellFinalStartTime"
                        type="datetime-local"
                        label="尾款支付开始时间"
                        filled
                        :rules="[
                        val => !!val || '请选择尾款支付开始时间',
                        val => new Date(val) > new Date(dataForm.presellEndTime) || '尾款支付开始时间必须晚于预售结束时间'
                      ]"
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                        v-model="dataForm.presellFinalEndTime"
                        type="datetime-local"
                        label="尾款支付截止时间"
                        filled
                        :rules="[
                        val => !!val || '请选择尾款支付截止时间',
                        val => new Date(val) > new Date(dataForm.presellFinalStartTime) || '尾款支付截止时间必须晚于开始时间'
                      ]"
                    />
                  </div>
                </template>
              </div>
            </div>
          </section>

          <!-- 配送方式部分 -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-title">
                <q-icon name="local_shipping" size="sm" class="q-mr-sm" />
                配送方式
              </div>
            </div>
            <div class="section-content">
              <div class="delivery-options">
                <q-checkbox
                    v-model="dataForm.deliveryMode.hasShopDelivery"
                    label="商家配送"
                    class="q-mr-lg"
                />
                <q-checkbox
                    v-model="dataForm.deliveryMode.hasUserPickUp"
                    label="用户自提"
                />
              </div>

              <prod-transport
                  v-if="dataForm.deliveryMode.hasShopDelivery"
                  :productId="productId"
                  v-model="dataForm.deliveryTemplateId"
                  @change="handleTransportChange"
                  class="q-mt-md"
              />
            </div>
          </section>

          <!-- SKU设置部分 -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-title">
                <q-icon name="inventory_2" size="sm" class="q-mr-sm" />
                规���设置
              </div>
            </div>
            <div class="section-content">
              <sku-tag
  ref="skuTagRef"
  v-model="skuProps"
  @update:sku-list="updateSkuList"
  @selected-props-change="handleSelectedPropsChange"
/>
            </div>
          </section>

          <!-- SKU列表部分 -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-title">
                <q-icon name="list" size="sm" class="q-mr-sm" />
                SKU列表
              </div>
            </div>
            <div class="section-content">
              <sku-table
                  ref="skuTableRef"
                  v-model="dataForm.skuList"
                  :sku-props="skuProps"
                  :prod-name="dataForm.prodName"
                  :is-presell="dataForm.presellStatus"
                  :prod-type="dataForm.prodType"
              />
            </div>
          </section>

          <!-- 商品详情部分 -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-title">
                <q-icon name="description" size="sm" class="q-mr-sm" />
                商品详情
              </div>
            </div>
            <div class="section-content">
              <tiny-mce
                  ref="contentRef"
                  v-model="dataForm.content"
                  class="full-width"
              />
            </div>
          </section>
        </div>
      </q-form>
    </q-card>

    <!-- 添加固定底部按钮组 -->
    <div class="fixed-bottom-bar">
      <div class="button-container">
        <div class="left-buttons">
          <q-toggle
            v-model="dataForm.isVirtual"
            :false-value="2"
            :true-value="1"
            label="虚拟商品"
            color="primary"
            class="q-mr-lg"
          />
          <q-btn-group flat>
            <q-btn
              :color="dataForm.status === 1 ? 'positive' : 'grey-7'"
              :label="dataForm.status === 1 ? '已上架' : '已下架'"
              :icon="dataForm.status === 1 ? 'visibility' : 'visibility_off'"
              @click="handleStatusChange(dataForm.status === 1 ? 0 : 1)"
            />
          </q-btn-group>
        </div>

        <div class="right-buttons">
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
            label="保存商品"
            type="submit"
            @click="submitForm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { idList } from '~/utils/index'
import ImageUploader from '~/components/ImageUploader.vue'
import ProdTransport from '~/components/product/ProdTransport.vue'
import SkuTag from '~/components/product/SkuTag.vue'
import SkuTable from '~/components/product/SkuTable.vue'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const emit = defineEmits(['refreshDataList'])
const categoryId = ref(route.query.categoryId);
const prodId = ref(route.query.prodId);
// 表单数据
// 修改表单数据型定义
interface SkuTableInstance {
  // updateProductName?: (name: string) => void  // 设为可选方法
  init?: () => void
}
function updateValue() {
 dataForm.value.presellFinalPayment= (dataForm.value.presellPrice - dataForm.value.presellDeposit).toFixed(2)
}
interface SkuTagInstance {
  init: (skuList: any[]) => void
}

interface Tag {
  id: string
  title: string
  status: boolean
}

// 商品类型枚举
enum ProductType {
  NORMAL = 1,    // 一般商品
  PRESELL = 2,   // 预售商品
  GROUP = 3,     // 团购商品
  SECKILL = 4    // 秒杀商品
}

// 修改商品表单接口
interface ProductForm {
  prodName: string
  brief: string
  pic: string
  imgs: string
  categoryId: number | null
  categoryName: string
  prodId: number
  skuList: any[]
  tagList: Array<Tag | string>
  content: string
  status: number
  deliveryMode: {
    hasShopDelivery: boolean
    hasUserPickUp: boolean
  }
  deliveryTemplateId: number | null
  transportInfo?: {
    methodId: number
    methodName: string
    rule: any
  }
  presellStatus: boolean
  presellPrice: number
  presellDeposit: number
  presellFinalPayment: number
  presellStartTime: string
  presellEndTime: string
  presellDeliveryTime: string
  presellFinalStartTime: string
  presellFinalEndTime: string
  prodType: ProductType  // 商品类型
  groupPrice?: number    // 团购价格
  groupMinNum?: number   // 最低成团人数
  seckillEndTime?: string  // 秒杀结束时间
  seckillStartTime?: string  // 秒杀开始时间
  isVirtual: number  // 是否虚拟商品
  oriPrice: number    // 商品原价
  price: number       // 商品售价
  totalStocks: number  // 商品总库存
  prodCode: string  // 商品编码
}

// 初始化表单数据
const dataForm = ref<ProductForm>({
  prodName: '',
  brief: '',
  pic: '',
  imgs: '',
  categoryId: null,
  categoryName: '',
  prodId: 0,
  skuList: [],
  tagList: [],
  content: '',
  status: 1,
  deliveryMode: {
    hasShopDelivery: false,
    hasUserPickUp: false
  },
  deliveryTemplateId: null,
  presellStatus: 0,
  presellPrice: 0,
  presellDeposit: 0,
  presellFinalPayment: 0,
  presellStartTime: '',
  presellEndTime: '',
  presellDeliveryTime: '',
  presellFinalStartTime: '',
  presellFinalEndTime: '',
  prodType: ProductType.NORMAL,
  groupPrice: 0,
  groupMinNum: 2,
  seckillEndTime: '',
  seckillStartTime: '',
  isVirtual: 2,  // 默认非虚拟商品
  oriPrice: 0,
  price: 0,
  totalStocks: 0,
  prodCode: ''  // 商品编码初始值
})

interface ProdTag {
  id: string
  title: string
  shopId: string
  status: boolean
  isDefault: boolean
  prodCount: string
  style: number
  seq: number
  createTime: string
  updateTime: string
  deleteTime: string | null
}
interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}
// 分类相关
const category = reactive<{
  list: any[]
  selected: any[]
  props: {
    value: string
    label: string
  }
}>({
  list: [],
  selected: [],
  props: {
    value: 'categoryId',
    label: 'categoryName'
  }
})

// 标签列表
const tags = ref<Tag[]>([])

// 组件引用
const skuTableRef = ref<SkuTableInstance | null>(null)
const skuTagRef = ref<SkuTagInstance | null>(null)
const contentRef = ref(null)

// 提交状态
const submitting = ref(false)

// SKU相关
const skuProps = ref({})

// 商品ID
const productId = ref(0)

// 监听路由参数变化
watch(() => route.query.prodId, (newId) => {
  if(newId) {
    productId.value = parseInt(newId as string)
  }
}, { immediate: true })

onMounted(() => {
  const prodId = route.query.prodId
  if(prodId) {
    dataForm.value.prodId = Number(prodId)
  }
  if (categoryId.value) {
    fetchCategoryName()
  }
  getDataList()
})
// 在 script setup 中添加
// 添加处理方法
const handleSelectedPropsChange = ({ selectedProps, selectedPropValues }) => {
  // 保存到表单数据
  dataForm.value.propList = selectedProps
  dataForm.value.propValueList = selectedPropValues
}
// 获取数据
// 修改数据获取方法
const getDataList = async () => {
  try {
    await getTagList()
    if (dataForm.value.prodId) {
      const response = await api.get(`/sys/prod/info/${dataForm.value.prodId}`)
      const data = await response.data

      // 格式化时间字段
      const formattedData = {
        ...data,
        presellStartTime: formatDateTime(data.presellStartTime),
        presellEndTime: formatDateTime(data.presellEndTime),
        presellDeliveryTime: formatDateTime(data.presellDeliveryTime),
        presellFinalStartTime: formatDateTime(data.presellFinalStartTime),
        presellFinalEndTime: formatDateTime(data.presellFinalEndTime)
      }

      dataForm.value = {
        ...formattedData,
        status: Number(data.status),
        deliveryMode: JSON.parse(data.deliveryMode),
        prodName: data.prodName || ''
      }

      if (skuTagRef.value?.init) {
        skuTagRef.value.init(data.skuList)
      }

      if (skuTableRef.value?.init) {
        skuTableRef.value.init()
      }

      category.selected = idList(
          category.list,
          dataForm.value.categoryId,
          'categoryId',
          'children'
      ).reverse()

      dataForm.value.tagList = data.tagList
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '获取数据失败'
    })
  }
}

const fetchCategoryName = async () => {
  try {
    const response = await api.get(`/category/getInfo/${categoryId.value}`)
    if (response.data.code === 200) {
      dataForm.value.categoryName = response.data.data.categoryName;
      dataForm.value.categoryId = categoryId.value;
    }
  } catch (error) {
    console.error('获取分类信息失败:', error)
  }
}

// 获取标签列表
const getTagList = async () => {
  try {
    const response = await api.get('/sys/prod/prodTag/list')
    const result: ApiResponse<ProdTag[]> = await response.data

    if (result.code === 200) {
      // 转换数据格式以适配选择器
      tags.value = result.data.map(tag => ({
        id: tag.id,
        title: tag.title,
        status: tag.status,
        // 可以根据需要添加其他字段
      }))
    } else {
      throw new Error(result.msg || '获取标签列表失败')
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '获取标签列表失败',
      position: 'top'
    })
  }
}

// 修改 SKU 相关的型定义
interface SkuRow {
  skuId: number | string
  prodType: number
  properties: string
  oriPrice: number
  price: number
  actualStocks: number
  presellPrice?: number
  presellDeposit?: number
  presellFinalPayment?: number
  pic?: string
  groupPrice?: number
  groupMinNum?: number
  seckillPrice?: number
  skuName: string
}

// 修改 SKU 列表更新方法
const updateSkuList = (newSkuList: SkuRow[]) => {
  //console.log('收到新的SKU列表:', newSkuList)

  // 保留已有SKU的价格等信息
  dataForm.value.skuList = newSkuList.map(newSku => {
    const existingSku = dataForm.value.skuList.find(
      oldSku => oldSku.properties === newSku.properties
    )

    if (existingSku) {
      // 根据商品类型设置不同的价格字段
      const skuData: SkuRow = {
        ...newSku,
        skuId: existingSku.skuId || Date.now() + Math.floor(Math.random() * 1000),
        oriPrice: existingSku.oriPrice || 0,
        price: existingSku.price || 0,
        actualStocks: existingSku.actualStocks || 0,
        pic: existingSku.pic || '',
        prodType: dataForm.value.prodType
      }

      // 根据商品类型添加特定字段
      if (dataForm.value.prodType === ProductType.PRESELL) {
        skuData.presellPrice = existingSku.presellPrice || 0
        skuData.presellDeposit = existingSku.presellDeposit || 0
        skuData.presellFinalPayment = existingSku.presellFinalPayment || 0
      } else if (dataForm.value.prodType === ProductType.GROUP) {
        skuData.groupPrice = existingSku.groupPrice || 0
        skuData.groupMinNum = existingSku.groupMinNum || 2
      } else if (dataForm.value.prodType === ProductType.SECKILL) {
        skuData.seckillPrice = existingSku.seckillPrice || 0
      }

      return skuData
    }

    // 新的 SKU，设置默认值
    const newSkuData: SkuRow = {
      ...newSku,
      skuId: Date.now() + Math.floor(Math.random() * 1000),
      oriPrice: 0,
      price: 0,
      actualStocks: 0,
      pic: '',
      prodType: dataForm.value.prodType
    }

    // 根据商品类型添加特定字段
    if (dataForm.value.prodType === ProductType.PRESELL) {
      newSkuData.presellPrice = 0
      newSkuData.presellDeposit = 0
      newSkuData.presellFinalPayment = 0
    } else if (dataForm.value.prodType === ProductType.GROUP) {
      newSkuData.groupPrice = 0
      newSkuData.groupMinNum = 2
    } else if (dataForm.value.prodType === ProductType.SECKILL) {
      newSkuData.seckillPrice = 0
    }

    return newSkuData
  })

  //console.log('更新后的SKU列表:', dataForm.value.skuList)
}

// 表单提交
const submitForm = async () => {
  try {

    // 表单验证
    if (!dataForm.value.pic) {
      console.warn('验证失败: 未上传商品图片')
      $q.notify({
        type: 'warning',
        message: '请选择图片上传'
      })
      return
    }

    if (!dataForm.value.deliveryMode) {
      console.warn('验证失败: 未选择配送方式')
      $q.notify({
        type: 'warning',
        message: '请选择配送方式'
      })
      return
    }

    if (dataForm.value.deliveryMode.hasShopDelivery && !dataForm.value.deliveryTemplateId) {
      console.warn('验证失败: 选择商家配送但未选择运费模板')
      $q.notify({
        type: 'warning',
        message: '请选择运费模板'
      })
      return
    }

    if (dataForm.value.prodType === ProductType.SECKILL) {
      if (!dataForm.value.seckillStartTime) {
        $q.notify({
          type: 'warning',
          message: '请设置秒杀开始时间'
        })
        return
      }
      if (!dataForm.value.seckillEndTime) {
        $q.notify({
          type: 'warning',
          message: '请设置秒杀结束时间'
        })
        return
      }
      if (new Date(dataForm.value.seckillEndTime) <= new Date(dataForm.value.seckillStartTime)) {
        $q.notify({
          type: 'warning',
          message: '秒杀结束时间必须晚于开始时间'
        })
        return
      }
    }

    submitting.value = true

    // 构造提交参数
    const param = {
      ...dataForm.value,
      // 处理标签列表
      tagList: dataForm.value.tagList.map(tag =>
        typeof tag === 'object' ? tag.id : tag
      ),
      // 处理配送信息
      deliveryModeStr: JSON.stringify(dataForm.value.deliveryMode),
      // 字类型
      status: Number(dataForm.value.status),
      prodId: Number(dataForm.value.prodId || 0),
      // 处理时间格式
      presellStartTime: dataForm.value.presellStartTime ? formatToDateTime(dataForm.value.presellStartTime) : null,
      presellEndTime: dataForm.value.presellEndTime ? formatToDateTime(dataForm.value.presellEndTime) : null,
      presellDeliveryTime: dataForm.value.presellDeliveryTime ? formatToDateTime(dataForm.value.presellDeliveryTime) : null,
      presellFinalStartTime: dataForm.value.presellFinalStartTime ? formatToDateTime(dataForm.value.presellFinalStartTime) : null,
      presellFinalEndTime: dataForm.value.presellFinalEndTime ? formatToDateTime(dataForm.value.presellFinalEndTime) : null,
      seckillStartTime: dataForm.value.seckillStartTime ? formatToDateTime(dataForm.value.seckillStartTime) : null,
      seckillEndTime: dataForm.value.seckillEndTime ? formatToDateTime(dataForm.value.seckillEndTime) : null
    }

    // 删除不需要的字段
    const { deliveryMode, transportInfo, ...submitData } = param
    const config = useRuntimeConfig()
    const method = submitData.prodId ? 'PUT' : 'POST'
    const response = await fetch(`${API_CONSTANTS.BASE_URL}/prod/addProd`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submitData)
    })

    const result = await response.data
    //console.log("提交响应:", result)

    if (result.code === 200) {
      //console.log('提交成功')
      $q.notify({
        type: 'positive',
        message: '操作成功',
        timeout: 1500
      })
      router.push('/prod/prodList')
      emit('refreshDataList')
    } else {
      throw new Error(result.msg || '提交失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '提交失败',
      position: 'top',
      timeout: 2000
    })
    return false
  } finally {
    submitting.value = false
    //console.log("=== 表单提交结束 ===")
  }
}

// 处理状态切换
const handleStatusChange = (value: number) => {
  dataForm.value.status = value
  $q.notify({
    type: value === 1 ? 'positive' : 'warning',
    message: value === 1 ? '商品已上架' : '商品已下架',
    position: 'top',
    timeout: 1500
  })
}

// 处理运输方式变更
const handleTransportChange = (transport: {
  methodId: number
  method: { name: string }
  rule: any
}) => {
  dataForm.value.deliveryTemplateId = transport.methodId
  dataForm.value.transportInfo = {
    methodId: transport.methodId,
    methodName: transport.method.name,
    rule: transport.rule
  }

  $q.notify({
    type: 'positive',
    message: `已选择运费方式: ${transport.method.name}`,
    position: 'top',
    timeout: 1500
  })
}

onMounted(() => {
  if (categoryId.value) {
    fetchCategoryName()
  }
})

// 添加日期格式化函数
function formatToDateTime(date: string | null): string {
  if (!date) return ''

  const d = new Date(date)

  // 格式化年月日
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  // 格式化时分秒
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 商品类型选项
const productTypeOptions = [
  { label: '一般商品', value: ProductType.NORMAL },
  { label: '预售商品', value: ProductType.PRESELL },
  { label: '团购商品', value: ProductType.GROUP },
  { label: '秒杀商品', value: ProductType.SECKILL }
]

// 修改商品类型变更处理，同时更新 SKU 列表
const handleProductTypeChange = (type: ProductType) => {
  // 重置相关字段
  if (type === ProductType.NORMAL) {
    dataForm.value.presellStatus = false
    dataForm.value.groupPrice = 0
    dataForm.value.groupMinNum = 2
    dataForm.value.seckillStartTime = ''
    dataForm.value.seckillEndTime = ''
  } else if (type === ProductType.PRESELL) {
    dataForm.value.presellStatus = true
    dataForm.value.groupPrice = 0
    dataForm.value.groupMinNum = 2
    dataForm.value.seckillStartTime = ''
    dataForm.value.seckillEndTime = ''
  } else if (type === ProductType.GROUP) {
    dataForm.value.presellStatus = false
    dataForm.value.seckillStartTime = ''
    dataForm.value.seckillEndTime = ''
  } else if (type === ProductType.SECKILL) {
    dataForm.value.presellStatus = false
    dataForm.value.groupPrice = 0
    dataForm.value.groupMinNum = 2
  }

  // 更新现有 SKU 列表的商品类型
  if (dataForm.value.skuList.length > 0) {
    dataForm.value.skuList = dataForm.value.skuList.map(sku => ({
      ...sku,
      prodType: type,
      // 重置特定类型的价格字段
      ...(type === ProductType.PRESELL ? {
        presellPrice: 0,
        presellDeposit: 0,
        presellFinalPayment: 0
      } : {}),
      ...(type === ProductType.GROUP ? {
        groupPrice: 0,
        groupMinNum: 2
      } : {}),
      ...(type === ProductType.SECKILL ? {
        seckillPrice: 0
      } : {})
    }))
  }
}

// 添加生成商品编码的方法
function generateProdCode() {
  // 生成规则：SPU + 时间戳 + 随机数
  const prefix = 'SPU'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  dataForm.value.prodCode = `${prefix}${timestamp}${random}`
}

//-------上传宣传图片---start---
// 在 script setup 中添加
const uploadFiles = ref<File[]>([])
const fileInput = ref<any>(null)
const previewVisible = ref(false)
const previewUrl = ref('')

// 计算已上传的图片列表
const imgList = computed(() => {
  return dataForm.value.imgs ? dataForm.value.imgs.split(',') : []
})

// 触发文件选择
function triggerUpload() {
  fileInput.value.$el.querySelector('input').click()
}

// 处理文件上传
async function handleFileUpload(files: File[]) {
  if (!files.length) return

  try {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await api.post('/sys/upload/batch', formData)

    const result = await response.data
    if (result.code === 200) {
      // 添加新上传的图片
      const newImages = result.data.map((item: any) => item.url)
      const currentImages = imgList.value
      dataForm.value.imgs = [...currentImages, ...newImages].join(',')

      $q.notify({
        type: 'positive',
        message: '图片上传成功'
      })
    } else {
      throw new Error(result.msg || '上传失败')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    $q.notify({
      type: 'negative',
      message: '图片上传失败'
    })
  } finally {
    uploadFiles.value = [] // 清空选择的文件
  }
}

// 删除图片
function removeImage(index: number) {
  const images = imgList.value
  images.splice(index, 1)
  dataForm.value.imgs = images.join(',')
}

// 预览图片
function previewImage(url: string) {
  previewUrl.value = url
  previewVisible.value = true
}
//-------上传宣传图片---end---
</script>

<style lang="scss" scoped>
.prod-info {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .form-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);

    .left-section {
      display: flex;
      align-items: center;

      .text-h6 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }

      .button-group {
        display: flex;
        align-items: center;

        .q-toggle {
          margin-right: 24px;
        }
      }
    }

    .right-section {
      display: flex;
      align-items: center;
    }
  }

  .form-section {
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

  .category-card {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #e3f2fd;
    border-radius: 4px;
    color: #1976d2;

    .category-name {
      font-weight: 500;
    }
  }

  .delivery-options {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }

  :deep(.q-field) {
    .q-field__control {
      height: auto;
      min-height: 56px;
    }
  }

  @media (max-width: 600px) {
    padding: 10px;

    .status-bar {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .form-section {
      border-radius: 4px;

      .section-content {
        padding: 16px;
      }
    }
  }

  // 添加固定底部按钮组样式
  .fixed-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;

    .button-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left-buttons {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .right-buttons {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }

  // 为底部按钮组留出空间
  .form-card {
    margin-bottom: 80px;
  }
}
//-------上传宣传图片---start---
.promo-images {
  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;

    .image-item {
      position: relative;
      width: 200px;
      height: 200px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      .q-img {
        width: 100%;
        height: 100%;
      }

      .image-actions {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.3s;

        .q-btn {
          background: rgba(255,255,255,0.9);
          &:hover {
            background: white;
          }
        }
      }

      &:hover .image-actions {
        opacity: 1;
      }
    }
  }

  .upload-trigger {
    width: 200px;
    height: 200px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: var(--primary-color);
      background: #f5f7fa;
    }

    .upload-text {
      margin-top: 12px;
      text-align: center;
      color: #606266;

      .upload-hint {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
}

.preview-dialog {
  width: 90vw;
  max-width: 800px;
}
//-------上传宣传图片---end---
</style>
