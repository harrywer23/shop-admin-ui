<template>
  <div class="category-products-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="category-title">{{ categoryName }}</h1>
        <div class="total-count">{{ $t('product.list.totalItems', { count: totalCount }) }}</div>
      </div>

      <!-- 搜索和筛选区域 -->
      <div class="search-filter-section">
        <!-- 搜索框 -->
        <q-input
          v-model="searchQuery"
          :placeholder="$t('common.search')"
          dense
          outlined
          class="search-input"
        >
          <template v-slot:append>
            <q-icon name="search" @click="handleSearch" class="cursor-pointer" />
          </template>
        </q-input>

        <!-- 价格区间筛选 -->
        <div class="price-filter">
          <q-input
            v-model.number="priceRange.min"
            type="number"
            dense
            outlined
            :placeholder="$t('product.filter.minPrice')"
            class="price-input"
          />
          <span class="price-separator">-</span>
          <q-input
            v-model.number="priceRange.max"
            type="number"
            dense
            outlined
            :placeholder="$t('product.filter.maxPrice')"
            class="price-input"
          />
          <q-btn
            flat
            :label="$t('common.confirm')"
            color="primary"
            @click="applyPriceFilter"
          />
        </div>

        <!-- 排序选项 -->
        <div class="sort-options">
          <q-btn-group flat>
            <q-btn
              :label="$t('product.list.sort.default')"
              :color="sortBy === 'default' ? 'primary' : 'grey'"
              @click="updateSort('default')"
            />
            <q-btn
              :label="$t('product.list.sort.price')"
              :color="sortBy === 'price' ? 'primary' : 'grey'"
              @click="updateSort('price')"
            >
              <q-icon :name="priceOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'" size="xs" />
            </q-btn>
            <q-btn
              :label="$t('product.list.sort.sales')"
              :color="sortBy === 'sales' ? 'primary' : 'grey'"
              @click="updateSort('sales')"
            />
            <q-btn
              :label="$t('product.list.sort.newest')"
              :color="sortBy === 'newest' ? 'primary' : 'grey'"
              @click="updateSort('newest')"
            />
          </q-btn-group>
        </div>
      </div>
    </div>

    <!-- 筛选标签 -->
    <div v-if="hasActiveFilters" class="active-filters">
      <q-chip
        v-if="searchQuery"
        removable
        @remove="clearSearch"
      >
        {{ $t('product.filter.keyword') }}: {{ searchQuery }}
      </q-chip>
      <q-chip
        v-if="hasPriceFilter"
        removable
        @remove="clearPriceFilter"
      >
        {{ $t('product.filter.priceRange') }}: ¥{{ priceRange.min }} - ¥{{ priceRange.max }}
      </q-chip>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <q-spinner-dots color="primary" size="40px" />
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- 商品列表 -->
    <div v-else-if="products.length > 0" class="products-grid">
      <div v-for="product in products"
           :key="product.prodId"
           class="product-card"
           @click="navigateToProduct(product.prodId)">
        <q-img
          :src="product.pic"
          :ratio="1"
          class="product-image"
        >
          <template v-slot:loading>
            <q-spinner-dots color="white" />
          </template>
        </q-img>
        <div class="product-info">
          <div class="product-name">{{ product.prodName }}</div>
          <div class="product-brief">{{ product.brief }}</div>
          <div class="product-price">
            <span class="current-price">¥{{ product.price }}</span>
            <span class="original-price">¥{{ product.ori_price }}</span>
          </div>
          <div class="product-sales">
            {{ $t('product.soldCount', { count: product.soldNum }) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="empty-state">
      <q-icon name="sentiment_dissatisfied" size="50px" color="grey" />
      <p>{{ $t('common.noData') }}</p>
    </div>

    <!-- 分页 -->
    <div v-if="products.length > 0" class="pagination">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="5"
        boundary-numbers
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// 状态管理
const categoryId = ref(Number(route.query.categoryId))
const categoryName = ref('')
const products = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const loading = ref(false)
const sortBy = ref('default')
const priceOrder = ref('desc')
const searchQuery = ref('')
const priceRange = ref({
  min: null as number | null,
  max: null as number | null
})

// 计算属性
const hasActiveFilters = computed(() => {
  return searchQuery.value || hasPriceFilter.value
})

const hasPriceFilter = computed(() => {
  return priceRange.value.min !== null || priceRange.value.max !== null
})

// 加载分类商品
const loadCategoryProducts = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/categoryProducts', {
      params: {
        categoryId: categoryId.value,
        page: currentPage.value,
        sort: sortBy.value,
        order: priceOrder.value,
        search: searchQuery.value,
        minPrice: priceRange.value.min,
        maxPrice: priceRange.value.max
      }
    })
    products.value = response.products
    totalCount.value = response.total
    totalPages.value = Math.ceil(response.total / 12)
  } catch (error) {
    console.error('Failed to load category products:', error)
    $q.notify({
      type: 'negative',
      message: $t('common.loadError')
    })
  } finally {
    loading.value = false
  }
}

// 更新排序方式
const updateSort = (sort: string) => {
  if (sort === 'price') {
    priceOrder.value = priceOrder.value === 'asc' ? 'desc' : 'asc'
  }
  sortBy.value = sort
  currentPage.value = 1
  loadCategoryProducts()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadCategoryProducts()
}

// 应用价格筛选
const applyPriceFilter = () => {
  if (priceRange.value.min && priceRange.value.max &&
      priceRange.value.min > priceRange.value.max) {
    $q.notify({
      type: 'warning',
      message: $t('product.filter.invalidPriceRange')
    })
    return
  }
  currentPage.value = 1
  loadCategoryProducts()
}

// 清除筛选条件
const clearSearch = () => {
  searchQuery.value = ''
  handleSearch()
}

const clearPriceFilter = () => {
  priceRange.value = {
    min: null,
    max: null
  }
  loadCategoryProducts()
}

// 处理分页
const handlePageChange = (page: number) => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  loadCategoryProducts()
}

// 跳转到商品详情
const navigateToProduct = (productId: number) => {
  router.push(`/product/${productId}`)
}

// 监听路由参数变化
watch(() => route.query.categoryId, (newId) => {
  if (newId) {
    categoryId.value = Number(newId)
    currentPage.value = 1
    loadCategoryProducts()
  }
})

onMounted(() => {
  loadCategoryProducts()
})
</script>

<style scoped>
.category-products-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.category-title {
  font-size: 24px;
  margin: 0;
}

.total-count {
  color: #666;
  font-size: 14px;
}

.search-filter-section {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 200px;
}

.price-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  width: 100px;
}

.price-separator {
  color: #666;
}

.active-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.product-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-brief {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.current-price {
  color: #ff4081;
  font-size: 18px;
  font-weight: bold;
}

.original-price {
  color: #999;
  font-size: 14px;
  text-decoration: line-through;
}

.product-sales {
  font-size: 12px;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .search-filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .price-filter {
    width: 100%;
  }

  .sort-options {
    overflow-x: auto;
  }
}
</style>
