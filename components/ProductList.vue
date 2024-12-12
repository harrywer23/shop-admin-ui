<template>
  <div class="product-list">
    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <!-- 搜索和排序栏 -->
      <div class="search-sort-bar">
        <!-- 左侧搜索 -->
        <div class="search-area">
          <q-input
            v-model="searchQuery"
            :placeholder="$t('common.search')"
            outlined
            dense
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template v-slot:append>
              <q-btn
                flat
                round
                dense
                icon="search"
                @click="handleSearch"
              />
            </template>
          </q-input>
        </div>

        <!-- 右侧排序 -->
        <div class="sort-area">
          <q-btn-group flat>
            <q-btn
              v-for="sort in sortOptions"
              :key="sort.value"
              :label="$t(sort.label)"
              :color="sortBy === sort.value ? 'primary' : 'grey'"
              dense
              @click="updateSort(sort.value)"
            >
              <q-icon
                v-if="sort.value === 'price'"
                :name="priceOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                size="xs"
              />
            </q-btn>
          </q-btn-group>
        </div>
      </div>

      <!-- 筛选条件栏 -->
      <div class="filter-bar">
        <!-- 分类筛选 -->
        <q-select
          v-if="showCategoryFilter"
          v-model="selectedCategory"
          :options="categoryOptions"
          :label="$t('product.list.filter.category')"
          outlined
          dense
          emit-value
          map-options
          class="filter-select"
          @update:model-value="handleCategoryChange"
        />

        <!-- 价格区间 -->
        <div class="price-range">
          <q-input
            v-model.number="priceRange.min"
            type="number"
            :placeholder="$t('product.filter.minPrice')"
            outlined
            dense
            class="price-input"
          />
          <span class="price-separator">-</span>
          <q-input
            v-model.number="priceRange.max"
            type="number"
            :placeholder="$t('product.filter.maxPrice')"
            outlined
            dense
            class="price-input"
          />
          <q-btn
            flat
            :label="$t('common.confirm')"
            color="primary"
            dense
            @click="applyPriceFilter"
          />
        </div>
      </div>

      <!-- 活动筛选标签 -->
      <div v-if="hasActiveFilters" class="active-filters">
        <q-chip
          v-if="searchQuery"
          removable
          dense
          @remove="clearSearch"
        >
          {{ $t('product.filter.keyword') }}: {{ searchQuery }}
        </q-chip>
        <q-chip
          v-if="selectedCategory"
          removable
          dense
          @remove="clearCategory"
        >
          {{ getCategoryName(selectedCategory) }}
        </q-chip>
        <q-chip
          v-if="hasPriceFilter"
          removable
          dense
          @remove="clearPriceFilter"
        >
          {{ $t('product.filter.priceRange') }}: ¥{{ priceRange.min }} - ¥{{ priceRange.max }}
        </q-chip>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="list-section">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <q-spinner-dots color="primary" size="40px" />
        <p>{{ $t('common.loading') }}</p>
      </div>

      <!-- 商品网格 -->
      <div v-else-if="products.length > 0" class="products-grid">
        <ProductCard
          v-for="product in products"
          :key="product.prodId"
          :product="product"
        />
      </div>

      <!-- 无数据状态 -->
      <div v-else class="empty-state">
        <q-icon name="sentiment_dissatisfied" size="50px" color="grey" />
        <p>{{ $t('common.noData') }}</p>
      </div>

      <!-- 分页器 -->
      <div class="pagination-section q-mt-lg flex justify-center">
        <q-pagination
            v-model="currentPage"
            :max="totalPages"
            :max-pages="6"
            boundary-numbers
            direction-links
            @update:model-value="loadProducts"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ProductCard from './product/ProductCard.vue'
import {useI18n} from "vue-i18n";

const props = defineProps({
  showCategoryFilter: {
    type: Boolean,
    default: true
  },
  initialCategory: {
    type: Number,
    default: null
  },
  initialTags: {
    type: String,
    default: null
  },
  parentId: {
    type: Number,
    default: 0
  }
})

const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

// 状态管理
const searchQuery = ref('')
const selectedCategory = ref(props.initialCategory)
const selectedTags = ref(props.initialTags)

const products = ref([])
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)
const loading = ref(false)
const sortBy = ref('default')
const priceOrder = ref('desc')
const priceRange = ref({
  min: null as number | null,
  max: null as number | null
})
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// 排序选项
const sortOptions = [
  { label: 'product.list.sort.default', value: 'default' },
  { label: 'product.list.sort.price', value: 'price' },
  { label: 'product.list.sort.sales', value: 'sales' },
  { label: 'product.list.sort.newest', value: 'newest' }
]

// 分类选项
const categoryOptions = [
  { label: 'product.list.filter.all', value: null },
  { label: '动漫', value: 1 },
  { label: '游戏', value: 2 },
  { label: '电影', value: 3 },
  { label: '小说', value: 4 },
  { label: '综合', value: 5 }
]
const categoryMap = new Map([
  [1, '动漫'],
  [2, '游戏'],
  [3, '电影'],
  [4, '小说'],
  [5, '综合']
]);
// 计算属性
const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || hasPriceFilter.value
})

const hasPriceFilter = computed(() => {
  return priceRange.value.min !== null || priceRange.value.max !== null
})

// 获取分类名称
const getCategoryName = (categoryId: number) => {
  if(categoryId==1){
    return "动漫"
  }
  if(categoryId==2){
    return "游戏"
  }
  if(categoryId==3){
    return "电影"
  }
  if(categoryId==4){
    return "小说"
  }
  if(categoryId==5){
    return "综合"
  }
  // return categoryMap.get(categoryId) ? categoryMap.get(categoryId)  : ''
  return "";
}

// 加载商品列表
const loadProducts = async () => {
  loading.value = true
  try {
    const queryParams = new URLSearchParams({
      pageNum: currentPage.value.toString(),
      pageSize: pageSize.value,
      sort: sortBy.value,
      order: priceOrder.value,
      search: searchQuery.value
    })
    // 优化分类ID的处理
    const categoryId = selectedCategory.value || props.parentId
    if (categoryId) {
      queryParams.append('categoryId', categoryId.toString())
    }
    if (priceRange.value.min) {
      queryParams.append('minPrice',  priceRange.value.min)
    }
    if (priceRange.value.max) {
      queryParams.append('maxPrice',  priceRange.value.max)
    }
    if (selectedTags.value) {
      queryParams.append('tags',  selectedTags.value)
    }
    const searchText = searchQuery.value?.trim()
    if (searchText) {
      queryParams.append('prodName', searchText)
    }

    const response = await api.get(`/prod/listByCategoryId?${queryParams}`)
    const data = await response.data
    if(data.code === 200) {
      products.value = data.data
      totalCount.value = data.total

      // 滚动到页面顶部
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } else {
      products.value = []
      totalCount.value = 0
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    $q.notify({
      type: 'negative',
      message: t('error.loadProductsFailed')
    })
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadProducts()
}

// 处理分类变更
const handleCategoryChange = () => {
  currentPage.value = 1
  loadProducts()
}

// 更新排序
const updateSort = (sort: string) => {
  if (sort === 'price') {
    priceOrder.value = priceOrder.value === 'asc' ? 'desc' : 'asc'
  }
  sortBy.value = sort
  currentPage.value = 1
  loadProducts()
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
  loadProducts()
}

// 清除筛选条件
const clearSearch = () => {
  searchQuery.value = ''
  handleSearch()
}

const clearCategory = () => {
  selectedCategory.value = null
  handleCategoryChange()
}

const clearPriceFilter = () => {
  priceRange.value = {
    min: null,
    max: null
  }
  loadProducts()
}

// 处理分页
const handlePageChange = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  loadProducts()
}

// 跳转到商品详情
const navigateToProduct = (productId: number) => {
  router.push(`/product/${productId}`)
}
// 监听标签变化
watch(() => props.initialTags, (newTags) => {
  if (newTags !== selectedTags.value) {
    selectedTags.value = newTags
    currentPage.value = 1
    loadProducts()
  }
})
// 监听初始分类变化
watch(() => props.initialCategory, (newCategory) => {
  if (newCategory !== selectedCategory.value) {
    selectedCategory.value = newCategory
    currentPage.value = 1
    loadProducts()
  }
})

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.product-list {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
}

.search-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* 搜索和排序栏样式 */
.search-sort-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.search-area {
  flex: 1;
  max-width: 400px;
}

.sort-area {
  flex: none;
}

/* 筛选条件栏样式 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-select {
  width: 200px;
  flex: none;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.price-input {
  width: 120px;
}

.price-separator {
  color: #666;
  padding: 0 4px;
}

/* 活动筛选标签样式 */
.active-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .search-sort-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-area {
    max-width: none;
  }

  .sort-area {
    overflow-x: auto;
    margin-top: 8px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .price-range {
    width: 100%;
  }

  .price-range {
    flex-wrap: wrap;
  }

  .price-input {
    flex: 1;
  }
}

/* 其他样式保持不变 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>
