<template>
  <div class="product-list">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="left-tools">
        <q-btn
          color="primary"
          icon="add"
          label="新增商品"
          @click="router.push('/admin/product/create')"
        />

        <!-- 修改分类选择器 -->
        <a-tree-select
          v-model:value="selectedCategory"
          :tree-data="categories"
          placeholder="选择分类"
          allow-clear
          :field-names="{
            label: 'label',
            value: 'value',
            children: 'children'
          }"
          class="q-ml-md category-select"
          style="width: 200px"
          tree-default-expand-all
        />

        <q-btn-group flat class="q-ml-md">
          <q-btn
            :color="filterStatus === null ? 'primary' : 'grey'"
            label="全部"
            @click="filterStatus = null"
          />
          <q-btn
            :color="filterStatus === 1 ? 'positive' : 'grey'"
            label="已上架"
            @click="filterStatus = 1"
          />
          <q-btn
            :color="filterStatus === 0 ? 'negative' : 'grey'"
            label="已下架"
            @click="filterStatus = 0"
          />
        </q-btn-group>
      </div>

      <div class="right-tools">
        <!-- 价格区间搜索 -->
        <div class="price-range">
          <q-input
            v-model.number="queryParams.minPrice"
            type="number"
            placeholder="最低价"
            dense
            outlined
            class="price-input"
            style="width: 100px"
          />
          <span class="q-mx-sm">-</span>
          <q-input
            v-model.number="queryParams.maxPrice"
            type="number"
            placeholder="最高价"
            dense
            outlined
            class="price-input"
            style="width: 100px"
          />
        </div>

        <!-- 品质搜索 -->
        <q-select
          v-model="queryParams.quality"
          :options="qualityOptions"
          label="商品品质"
          clearable
          dense
          outlined
          class="q-ml-md quality-select"
          style="width: 150px"
          emit-value
          map-options
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:selected>
            <template v-if="queryParams.quality">
              {{ getQualityLabel(queryParams.quality) }}
            </template>
          </template>
        </q-select>

        <!-- 现有的搜索框 -->
        <q-input
          v-model="searchKeyword"
          placeholder="搜索商品名称/编码"
          dense
          outlined
          class="search-input q-ml-md"
        >
          <template v-slot:append>
            <q-btn
              round
              dense
              flat
              icon="search"
              @click="handleSearch"
            />
          </template>
        </q-input>

        <q-btn
          flat
          round
          dense
          icon="refresh"
          class="q-ml-sm"
          @click="resetSearch"
        >
          <q-tooltip>重置搜索</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="product-grid">
      <div v-for="product in productList" :key="product.prodId" class="product-card">
        <!-- 商品图片 -->
        <div class="product-image">
          <CachedImage :src="product.pic" :ratio="1">
            <div class="status-badge" :class="product.status === 1 ? 'online' : 'offline'">
              {{ product.status === 1 ? '已上架' : '已下架' }}
            </div>
          </CachedImage>
        </div>

        <!-- 商品信息 -->
        <div class="product-info">
          <div class="product-name" :title="product.prodName">{{ product.prodName }}</div>
          <div class="product-code">编码: {{ product.prodCode }}</div>
          <div class="product-price">
            <span class="price">¥{{ product.price }}</span>
            <span class="original-price" v-if="product.oriPrice">¥{{ product.oriPrice }}</span>
          </div>
          <div class="product-stats">
            <span>库存: {{ product.totalStocks }}</span>
            <span>销量: {{ product.soldNum }}</span>
          </div>
          <div class="quality-tag">
            <q-chip
              :color="getQualityColor(product.quality)"
              text-color="white"
              label="品质"
              class="q-ma-sm"
            />
            <q-chip
              :color="getQualityColor(product.quality)"
              text-color="white"
              class="q-ma-sm"
            >
            {{ getQualityLabel(product.quality) }}
            </q-chip>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="product-actions">
          <q-btn-group flat class="action-group">
            <!-- 基本信息编辑 -->
            <q-btn
              color="primary"
              icon="edit"
              flat
              dense
              @click="handleBasicEdit(product)"
            >
              <q-tooltip>基本信息</q-tooltip>
            </q-btn>

            <!-- 商品详情编辑 -->
            <q-btn
              color="purple"
              icon="description"
              flat
              dense
              @click="handleDetailEdit(product)"
            >
              <q-tooltip>商品详情</q-tooltip>
            </q-btn>

            <!-- 标签管理 -->
            <q-btn
              color="deep-orange"
              icon="local_offer"
              flat
              dense
              @click="handleTagEdit(product)"
            >
              <q-tooltip>标签管理</q-tooltip>
            </q-btn>

            <!-- 规格参数 -->
            <!-- <q-btn
              color="teal"
              icon="settings"
              flat
              dense
              @click="handleSpecEdit(product)"
            >
              <q-tooltip>规格参数</q-tooltip>
            </q-btn> -->

            <!-- 运费设置 -->
            <q-btn
              color="brown"
              icon="local_shipping"
              flat
              dense
              @click="handleDeliveryEdit(product)"
            >
              <q-tooltip>运费设置</q-tooltip>
            </q-btn>

            <!-- 宣传图片 -->
            <q-btn
              color="blue"
              icon="photo_library"
              flat
              dense
              @click="handlePromoImages(product)"
            >
              <q-tooltip>宣传图片</q-tooltip>
            </q-btn>

            <!-- 预售信息(仅预售商品显示) -->
            <q-btn
              v-if="product.prodType === 2"
              color="deep-purple"
              icon="event"
              flat
              dense
              @click="handlePresellEdit(product)"
            >
              <q-tooltip>预售设置</q-tooltip>
            </q-btn>

            <!-- 上下架状态 -->
            <q-btn
              :color="product.status === 1 ? 'negative' : 'positive'"
              :icon="product.status === 1 ? 'visibility_off' : 'visibility'"
              flat
              dense
              @click="handleStatusChange(product)"
            >
              <q-tooltip>{{ product.status === 1 ? '下架' : '上架' }}</q-tooltip>
            </q-btn>
            <!-- 添加查看SKU按钮 -->
            <q-btn
                color="info"
                icon="inventory_2"
                flat
                dense
                @click="handleViewSkuTag(product)"
            >
              <q-tooltip>规格属性</q-tooltip>
            </q-btn>
            <!-- 添加查看SKU按钮 -->
            <q-btn
                color="info"
                icon="inventory_2"
                flat
                dense
                @click="handleViewSkus(product)"
            >
              <q-tooltip>查看SKU</q-tooltip>
            </q-btn>
            <!-- 查看商品 -->
            <q-btn
              color="info"
              icon="remove_red_eye"
              flat
              dense
              @click="handleView(product)"
            >
              <q-tooltip>查看商品</q-tooltip>
            </q-btn>



            <!-- 添加评论管理按钮 -->
            <q-btn
              flat
              round
              color="info"
              icon="comment"
              @click="goToComments(product)"
            >
              <q-tooltip>评论管理</q-tooltip>
            </q-btn>
            <!-- 删除商品 -->
            <q-btn
                color="negative"
                icon="delete"
                flat
                dense
                @click="handleDelete(product)"
            >
              <q-tooltip>删除商品</q-tooltip>
            </q-btn>

            <!-- 添加品质修改按钮 -->
            <q-btn
              color="amber"
              icon="stars"
              flat
              dense
              @click="handleQualityEdit(product)"
            >
              <q-tooltip>修改品质</q-tooltip>
            </q-btn>

            <!-- 在操作按钮组中添加修改分类按钮 -->
            <q-btn
              color="deep-purple"
              icon="category"
              flat
              dense
              @click="handleCategoryEdit(product)"
            >
              <q-tooltip>修改分类</q-tooltip>
            </q-btn>
          </q-btn-group>
        </div>
      </div>
    </div>

    <!-- 分页器 -->
    <div class="pagination">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="7"
        boundary-numbers
        direction-links
        @update:modelValue="loadProducts()"
      />
    </div>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">确定要删除该商品吗？</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="确定" color="negative" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 运费设置对话框 -->
    <q-dialog v-model="showDeliveryDialog" maximized persistent>
      <q-card class="delivery-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">运费设置</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="delivery-content">
            <!-- 配送方式选择 -->
            <div class="delivery-mode q-mb-lg">
              <div class="section-title q-mb-sm">配送方式</div>
              <div class="delivery-options">
                <q-checkbox
                  v-model="deliveryForm.hasShopDelivery"
                  label="商家配送"
                  class="q-mr-lg"
                />
                <q-checkbox
                  v-model="deliveryForm.hasUserPickUp"
                  label="用户自提"
                />
              </div>
            </div>

            <!-- 运费模板设置 -->
            <div v-if="deliveryForm.hasShopDelivery" class="transport-template">
              <div class="section-title q-mb-sm">运费模板</div>
              <prod-transport
                :prod-id="currentProduct?.prodId"
                v-model="deliveryForm.deliveryTemplateId"
                @change="handleTransportChange"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white">
          <q-btn flat label="取消" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="保存"
            color="primary"
            :loading="savingDelivery"
            @click="saveDeliverySettings"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 添加品质编辑对话框 -->
    <q-dialog v-model="showQualityDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">修改商品品质</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="selectedQuality"
            :options="qualityOptions"
            option-label="label"
            option-value="value"
            label="商品品质"
            emit-value
            map-options
            outlined
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
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确定" @click="saveQuality" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 修改分类修改对话框 -->
    <q-dialog v-model="showCategoryDialog" position="standard">
      <q-card class="category-dialog">
        <q-card-section>
          <div class="text-h6">修改商品分类</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <a-tree-select
            v-model:value="selectedNewCategory"
            :tree-data="categories"
            placeholder="选择分类"
            allow-clear
            :field-names="{
              label: 'label',
              value: 'value',
              children: 'children'
            }"
            style="width: 100%"
            tree-default-expand-all
            :popup-style="{ zIndex: 7000 }"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确定" @click="saveCategory" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ProdTransport from '~/components/product/ProdTransport.vue'
import {tansParams} from "~/utils/tools";
import CachedImage from "~/components/common/CachedImage.vue";

const router = useRouter()
const $q = useQuasar()
const token = useCookie('token');
// ��义分类接口
interface Category {
  categoryId: string
  categoryName: string
  parentId: string
  seq: number
  status: number
  icon?: File | null
  children?: Category[]
}
const queryParams = ref({
    pageNum: 1,
    pageSize: 20,
    device: 2,
     search: null,
    status:null,
    categoryId:null,
    minPrice: null,
    maxPrice: null,
    quality: null
});


// 状态和数据
const productList = ref([])
const currentPage = ref(1)
const pageSize = ref(12)
const totalPages = ref(1)
const filterStatus = ref(null)
const searchKeyword = ref('')
const deleteDialog = ref(false)
const productToDelete = ref(null)
// 分类树数据
const categoryTree = ref<Category[]>([])
// 添加分类相关数据
const categories = ref([])
const selectedCategory = ref(null)

// 运费设置相关
const showDeliveryDialog = ref(false)
const savingDelivery = ref(false)
const currentProduct = ref<any>(null)
const deliveryForm = ref({
  hasShopDelivery: false,
  hasUserPickUp: false,
  deliveryTemplateId: null as number | null,
  transportInfo: null as any
})

// 添加新的响应式变量
const showQualityDialog = ref(false)
const selectedQuality = ref(null)
const currentEditingProduct = ref(null)

// 修改品质选项数组的值
const qualityOptions = [
  {
    label: 'S级 - 臻品',
    value: 'S',  // 保持大写字母
    description: '各项指标均为顶级，具有极高的收藏价值'
  },
  {
    label: 'A级 - 精品',
    value: 'A',  // 保持大写字母
    description: '品质优良，各项指标均达到行业领先水平'
  },
  {
    label: 'B级 - 良品',
    value: 'B',  // 保持大写字母
    description: '品质中等，符合一般消费者的需求'
  },
  {
    label: 'C级 - 普品',
    value: 'C',  // 保持大写字母
    description: '品质一般，价格较低'
  },
  {
    label: 'D级 - 次品',
    value: 'D',  // 保持大写字母
    description: '品质较差，存在明显的缺陷'
  }
]

// 监听筛选条件变化
watch([currentPage, filterStatus, selectedCategory, searchKeyword], () => {
  loadProducts()
}, { deep: true })

// 加载分类列表
async function loadCategories() {
  try {
    const response = await api.get(`/category/subTree?parentId=0`)
    const result = response.data

    if (result.code === 200) {
      // 处理多级分类数据
      const processCategories = (cats: any[]) => {
        return cats.map(cat => ({
          label: cat.categoryName,
          value: cat.categoryId,
          children: cat.children?.length ? processCategories(cat.children) : undefined,
          isLeaf: !cat.children?.length
        }))
      }
      categories.value = processCategories(result.data)
    }
  } catch (error) {
    console.error('加载分类列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载分类列表失败'
    })
  }
}

// 修改加载商品列表方法
async function loadProducts() {
  try {
    // 构建查询参数
    // const params = new URLSearchParams({
    //   pageNum: currentPage.value.toString(),
    //   limit: pageSize.value.toString()
    // })

    // 添加可选参数
    if (filterStatus.value !== null) {
      queryParams.value.status = filterStatus.value;
    }else {
      queryParams.value.status = null;
    }
    if (selectedCategory.value) {
      queryParams.value.categoryId = selectedCategory.value;
    }else {
      queryParams.value.categoryId = null;
    }
    if (searchKeyword.value) {
      queryParams.value.search = searchKeyword.value;
    }else {
      queryParams.value.search = null;
    }
    queryParams.value.pageSize=pageSize.value;
    queryParams.value.pageNum=currentPage.value;
    //console.log(queryParams)
    const response = await api.get(`/sys/prod/adminListByCategoryId?`+ tansParams(queryParams.value))
    if (response.data.code == 200) {
        productList.value = response.data.data
        totalPages.value = Math.ceil(response.data.total / pageSize.value)
    }
  } catch (error) {
    console.error('加载商品列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载商品列表失败'
    })
  }
}

// 添加搜索处理方法
const handleSearch = () => {
  // 验证价格区间
  if (queryParams.value.minPrice && queryParams.value.maxPrice) {
    if (queryParams.value.minPrice > queryParams.value.maxPrice) {
      $q.notify({
        type: 'negative',
        message: '最低价不能大于最高价'
      })
      return
    }
  }

  // 确保品质参数是大写字母
  if (queryParams.value.quality) {
    queryParams.value.quality = queryParams.value.quality.toUpperCase()
  }

  currentPage.value = 1 // 重置页码
  loadProducts()
}

// 监听价格和品质变化
watch([
  () => queryParams.value.minPrice,
  () => queryParams.value.maxPrice,
  () => queryParams.value.quality
], () => {
  handleSearch()
})

// 重置搜索条件
const resetSearch = () => {
  queryParams.value = {
    ...queryParams.value,
    prodName: null,
    minPrice: null,
    maxPrice: null,
    quality: null
  }
  handleSearch()
}

// 在组件挂载时加载数据
onMounted(() => {
  loadCategories()
  loadProducts()
})

// 处理编辑
function handleEdit(product) {
  router.push(`/admin/product/edit?prodId=${product.prodId}&categoryId=${product.categoryId}`)
}

// 处理状态变
async function handleStatusChange(product) {
  try {
    const response = await api.put(`/sys/prod/prod/status/${product.prodId}/${product.status === 1 ? 0 : 1}`)
    const result = await response.data

    if (result.code === 200) {
      product.status = product.status === 1 ? 0 : 1
      $q.notify({
        type: 'positive',
        message: `商品已${product.status === 1 ? '上架' : '下架'}`
      })
    }
  } catch (error) {
    console.error('修改商品状态失败:', error)
    $q.notify({
      type: 'negative',
      message: '修改商品状态失败'
    })
  }
}

// 处理查看
function handleView(product) {
  window.open(`/admin/product/detail?prodId=${product.prodId}&categoryId=${product.categoryId}`, '_blank')
}

// 处理订单列表
function handleOrders(product) {
  router.push(`/admin/orders?prodId=${product.prodId}`)
}

// 处理删除
 function handleDelete(product) {
     productToDelete.value = product
     deleteDialog.value = true
}

// 确认删除
async function confirmDelete() {
  if (!productToDelete.value) return

  try {
    const response = await api.delete(`/sys/prod/prod/${productToDelete.value.prodId}`)
    const result = await response.data

    if (result.code === 200) {
      $q.notify({
        type: 'positive',
        message: '商品删除成功'
      })
      loadProducts()
    }
  } catch (error) {
    console.error('删除商品失败:', error)
    $q.notify({
      type: 'negative',
      message: '删除商品失败'
    })
  } finally {
    deleteDialog.value = false
    productToDelete.value = null
  }
}

// 基本信息编辑
const handleBasicEdit = (product) => {
  router.push(`/admin/product/edit/basic?prodId=${product.prodId}`)
}

// 商品详情编辑
const handleDetailEdit = (product) => {
  router.push(`/admin/product/edit/detail?prodId=${product.prodId}`)
}

// 标签管理
const handleTagEdit = (product) => {
  router.push(`/admin/product/edit/tags?prodId=${product.prodId}`)
}

// 规格参数
const handleSpecEdit = (product) => {
  router.push(`/admin/product/edit/spec?prodId=${product.prodId}`)
}

// 运费设置
const handleDeliveryEdit = (product: any) => {
  currentProduct.value = product
  // 解析当前配送方式
  try {
    const deliveryMode = JSON.parse(product.deliveryMode || '{}')
    deliveryForm.value = {
      hasShopDelivery: !!deliveryMode.hasShopDelivery,
      hasUserPickUp: !!deliveryMode.hasUserPickUp,
      deliveryTemplateId: product.deliveryTemplateId,
      transportInfo: product.transportInfo || null
    }
  } catch (error) {
    console.error('解析配送方式失败:', error)
    deliveryForm.value = {
      hasShopDelivery: false,
      hasUserPickUp: false,
      deliveryTemplateId: null,
      transportInfo: null
    }
  }
  showDeliveryDialog.value = true
}

// 宣传图片
const handleImageEdit = (product) => {
  router.push(`/admin/product/edit/image?prodId=${product.prodId}`)
}

// 预售信息(仅预售商品显示)
const handlePresellEdit = (product) => {
  router.push(`/admin/product/edit/presell?prodId=${product.prodId}`)
}

// 处理运输方式变更
const handleTransportChange = (transport: {
  methodId: number
  method: { name: string }
  rule: any
}) => {
  if (!transport || !transport.methodId) {
    console.warn('无效的运输方式数据:', transport)
    return
  }

  //console.log('选择运输方式:', transport)

  // 更新运费模板ID
  deliveryForm.value.deliveryTemplateId = Number(transport.methodId)

  // 更新运输信息
  deliveryForm.value.transportInfo = {
    methodId: Number(transport.methodId),
    methodName: transport.method?.name || '',
    rule: transport.rule || null
  }

  // 确保商家配送已启用
  deliveryForm.value.hasShopDelivery = true

  $q.notify({
    type: 'positive',
    message: `已选择运费方式: ${transport.method?.name || '未选择方式'}`,
    position: 'top',
    timeout: 1500
  })
}

// 保存运费设置
async function saveDeliverySettings() {
  if (!currentProduct.value) return

  try {
    savingDelivery.value = true

    // 验证配送方式
    if (!deliveryForm.value.hasShopDelivery && !deliveryForm.value.hasUserPickUp) {
      throw new Error('请至少选择一种配送方式')
    }

    if (deliveryForm.value.hasShopDelivery && !deliveryForm.value.deliveryTemplateId) {
      throw new Error('请选择运费模板')
    }

    const response = await api.put(`/sys/prod/prod/delivery/${currentProduct.value.prodId}`,JSON.stringify({
        deliveryMode: JSON.stringify({
          hasShopDelivery: deliveryForm.value.hasShopDelivery,
          hasUserPickUp: deliveryForm.value.hasUserPickUp
        }),
        deliveryTemplateId: deliveryForm.value.deliveryTemplateId,
        transportInfo: deliveryForm.value.transportInfo
      }))

    const result = await response.data

    if (result.code === 200) {
      $q.notify({
        type: 'positive',
        message: '运费设置保存成功'
      })
      showDeliveryDialog.value = false
      loadProducts() // 重新加载商品列表
    } else {
      throw new Error(result.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存运费设置失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存运费设置失败'
    })
  } finally {
    savingDelivery.value = false
  }
}

// 处理宣传图片管理
function handlePromoImages(product) {
  router.push(`/admin/product/edit/image?prodId=${product.prodId}`)
}

function handleViewSkuTag(product) {
  router.push(`/admin/product/edit/sku?prodId=${product.prodId}`)
}


// 修改查看SKU按钮的处理方法
function handleViewSkus(product: any) {
  router.push(`/admin/product/sku/list?prodId=${product.prodId}`)
}



// 添加图片预览功能
function previewImage(url: string) {
  if (!url) return
  window.open(getImageUrl(url), '_blank')
}

// 跳转到评论管理页面
const goToComments = (product: any) => {
  router.push(`/admin/product/comments/${product.prodId}`)
}

// 处理品质编辑
const handleQualityEdit = (product) => {
  currentEditingProduct.value = product
  selectedQuality.value = product.quality
  showQualityDialog.value = true
}

// 保存品质
const saveQuality = async () => {
  try {
    // 确保发送的品质值是大写字母
    const qualityValue = selectedQuality.value.toUpperCase()
    const response = await api.get(`/sys/prod/update/quality/${currentEditingProduct.value.prodId}/${qualityValue}`)

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '商品品质修改成功'
      })
      currentEditingProduct.value.quality = qualityValue
      showQualityDialog.value = false
      await loadProducts() // 重新加载列表
    }
  } catch (error) {
    console.error('修改商品品质失败:', error)
    $q.notify({
      type: 'negative',
      message: '修改商品品质失败'
    })
  }
}

// 在商品信息区域添加品质显示
const getQualityLabel = (quality: string) => {
  const option = qualityOptions.find(opt => opt.value === quality)
  return option ? option.label : '未设置'
}

// 修改品质颜色映射
const getQualityColor = (quality: string) => {
  const colors = {
    'S': 'purple',
    'A': 'primary',
    'B': 'positive',
    'C': 'warning',
    'D': 'negative'
  }
  return colors[quality] || 'grey'
}

// 添加分类修改对话框
const showCategoryDialog = ref(false)
const selectedNewCategory = ref(null)

// 处理分类编辑
const handleCategoryEdit = (product) => {
  currentEditingProduct.value = product
  selectedNewCategory.value = product.categoryId
  showCategoryDialog.value = true
}

// 保存分类
const saveCategory = async () => {
  try {
    const response = await api.get(`/sys/prod/update/category/${currentEditingProduct.value.prodId}/${selectedNewCategory.value}`)

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '商品分类修改成功'
      })
      currentEditingProduct.value.categoryId = selectedNewCategory.value
      showCategoryDialog.value = false
      await loadProducts() // 重新加载列表
    }
  } catch (error) {
    console.error('修改商品分类失败:', error)
    $q.notify({
      type: 'negative',
      message: '修改商品分类失败'
    })
  }
}
</script>

<style lang="scss" scoped>
.product-list {
  padding: 20px;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .left-tools {
      display: flex;
      align-items: center;
      gap: 16px;

      .category-select {
        width: 200px;
      }
    }

    .right-tools {
      display: flex;
      align-items: center;
      gap: 8px;

      .price-range {
        display: flex;
        align-items: center;
      }

      .price-input {
        width: 100px;
      }

      .quality-select {
        width: 150px;
      }

      .search-input {
        width: 200px;
      }
    }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .product-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateY(-2px);
      }

      .product-image {
        position: relative;

        .status-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: white;

          &.online {
            background: #21ba45;
          }

          &.offline {
            background: #c10015;
          }
        }
      }

      .product-info {
        padding: 15px;

        .product-name {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .product-code {
          color: #909399;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .product-price {
          margin-bottom: 8px;

          .price {
            color: #f56c6c;
            font-size: 18px;
            font-weight: 500;
          }

          .original-price {
            color: #909399;
            font-size: 14px;
            text-decoration: line-through;
            margin-left: 8px;
          }
        }

        .product-stats {
          color: #606266;
          font-size: 13px;
          display: flex;
          gap: 16px;
        }

        .quality-tag {
          margin-top: 8px;

          .q-chip {
            font-size: 12px;
          }
        }
      }

      .product-actions {
        padding: 10px 15px;
        border-top: 1px solid #ebeef5;
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}

.delivery-dialog {
  .delivery-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 16px;
  }

  .delivery-options {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
  }

  .transport-template {
    margin-top: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
  }
}

.product-actions {
  padding: 10px 15px;
  border-top: 1px solid #ebeef5;

  .action-group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: flex-end;

    // 当按钮溢出时自动换行
    .q-btn {
      margin: 2px;
    }
  }
}

// 优化操作按钮组的响应式布局
@media (max-width: 600px) {
  .product-actions {
    .action-group {
      justify-content: center;
    }
  }
}

// 响应式布局
@media (max-width: 1200px) {
  .right-tools {
    flex-wrap: wrap;
    gap: 8px;

    .price-range,
    .quality-select,
    .search-input {
      margin: 4px;
    }
  }
}

@media (max-width: 600px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;

    .left-tools,
    .right-tools {
      width: 100%;
      margin-bottom: 8px;
    }
  }
}

.category-dialog {
  min-width: 350px;
  z-index: 6000;  // 确保对话框在较高层级
}
</style>

<style lang="scss">
// 添加全局样式
.ant-select-dropdown {
  z-index: 7000 !important; // 确保下拉菜单在对话框之上
}

.ant-tree-select-dropdown {
  z-index: 7000 !important; // 确保树形选择器下拉菜单在对话框之上
}
</style>
