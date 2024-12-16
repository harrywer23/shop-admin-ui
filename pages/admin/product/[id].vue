<template>
  <div class="product-detail anime-card">
    <ProductDetail
      v-if="product"
      :product="product"
      @add-to-cart="handleAddToCart"
      @buy-now="handleBuyNow"
    />

    <div v-if="product" class="product-tabs">
      <q-tabs
        v-model="tab"
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="details" :label="t('productDetail.tabs.details')" />
        <q-tab name="params" :label="t('productDetail.tabs.params')" />
        <q-tab name="comments" :label="t('productDetail.tabs.comments')" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="details">
          <div v-html="product.content"></div>
        </q-tab-panel>

        <q-tab-panel name="params">
          <ProductParams :params="productParams" />
        </q-tab-panel>

        <q-tab-panel name="comments">
          <ProductComments
            :product-id="String(route.params.id)"
            @update:comments="updateComments"
          />
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <div v-else class="loading-state">
      <q-spinner-dots color="primary" size="40px" />
      <p>{{ t('common.loading') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import ProductDetail from '~/components/product/ProductDetail.vue'
import ProductParams from '~/components/product/ProductParams.vue'
import ProductComments from '~/components/product/ProductComments.vue'

// 定义接口类型
interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}


const route = useRoute()
const $q = useQuasar()
const { t } = useI18n()
const tab = ref('details')
const productParams = ref<any[]>([])
const product = ref<any>({})

// 获取商品详情
const getProductDetail = async () => {
  try {
    const prodId = route.params.id
    const response = await api.get(`/api/product/${prodId}/detail`)
    product.value =await response.data
    //console.log("product:",product)
  } catch (error) {
    console.error('获取商品详情失败:', error)
    $q.notify({
      type: 'negative',
      message: t('common.loadError')
    })
  }
}

// 加载商品参数
const loadProductParams = async () => {
  try {
    const response = await api.get<ApiResponse<any>>(`/sys/prod/${route.params.id}/params`)
    const data =await response.data

    if (data.code === 200) {
      productParams.value = data.data
    } else {
      console.error('Failed to load product params:', data.message)
    }
  } catch (error) {
    console.error('加载商品参数失败:', error)
    // 参数加载失败不影响整体显示，只提示错误
    $q.notify({
      type: 'warning',
      message: '加载商品参数失败',
      position: 'top'
    })
  }
}

// 更新评论的处理函数
const updateComments = (comments: any) => {
  // 处理评论更新逻辑
}

// 添加购物车和立即购买的处理方法
const handleAddToCart = (sku: any) => {
  // 处理添加到购物车的逻辑
  //console.log('Adding to cart:', sku)
  $q.notify({
    type: 'positive',
    message: '已添加到购物车'
  })
}

const handleBuyNow = (sku: any) => {
  // 处理立即购买的逻辑
  //console.log('Buying now:', sku)
  // 可以跳转到结算页面
  // navigateTo('/checkout')
}

// 生命周期钩子
onMounted(async () => {
  try {
    await Promise.all([
      getProductDetail(),
      loadProductParams()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
    // 错误已经在各个函数中处理过，这里不需要重复处理
  }
})
</script>

<style scoped lang="scss">
.product-detail {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  p {
    margin-top: 1rem;
    color: #666;
  }
}

.product-tabs {
  margin-top: 2rem;
}

// 响应式布局
@media (max-width: 768px) {
  .product-detail {
    padding: 1rem;
  }
}
</style>
