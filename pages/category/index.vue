<template>
  <div class="category-page">
    <div class="category-container">
      <!-- 左侧分类导航 -->
      <div class="category-nav">
        <q-list bordered>
          <q-item
            v-for="category in categories"
            :key="category.category_id"
            clickable
            :active="currentCategory?.category_id === category.category_id"
            @click="selectCategory(category)"
          >
            <q-item-section>
              {{ category.categoryName }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- 右侧商品列表 -->
      <div class="product-list">
        <!-- 筛选条件 -->
        <div class="filter-section">
          <q-btn-group flat>
            <q-btn
              :label="sortLabel"
              icon="sort"
              flat
              color="primary"
            >
              <q-menu>
                <q-list>
                  <q-item
                    v-for="sort in sortOptions"
                    :key="sort.value"
                    clickable
                    v-close-popup
                    @click="currentSort = sort.value"
                  >
                    <q-item-section>{{ sort.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>

            <q-btn
              :label="priceRangeLabel"
              icon="attach_money"
              flat
              color="primary"
            >
              <q-menu>
                <q-list>
                  <q-item
                    v-for="range in priceRanges"
                    :key="range.value"
                    clickable
                    v-close-popup
                    @click="currentPriceRange = range.value"
                  >
                    <q-item-section>{{ range.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-btn-group>
        </div>

        <!-- 商品网格 -->
        <div class="product-grid">
          <q-card
            v-for="product in products"
            :key="product.prodId"
            class="product-card"
            @click="goToProduct(product.prodId)"
          >
            <q-img
              :src="product.pic"
              :ratio="1"
              style="height: 200px"
            />

            <q-card-section>
              <div class="text-subtitle2 ellipsis-2-lines">
                {{ product.prodName }}
              </div>
              <div class="text-h6 text-primary">
                ¥{{ product.price }}
              </div>
              <div class="text-caption text-grey">
                已售 {{ product.soldNum }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <q-pagination
            v-model="currentPage"
            :max="totalPages"
            :max-pages="6"
            boundary-numbers
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态定义
const categories = ref<any[]>([])
const currentCategory = ref<any>(null)
const products = ref<any[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const currentSort = ref('default')
const currentPriceRange = ref('all')

// 排序选项
const sortOptions = [
  { label: '默认排序', value: 'default' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
  { label: '销量优先', value: 'sales' },
  { label: '最新上架', value: 'newest' }
]

// 价格区间
const priceRanges = [
  { label: '全部', value: 'all' },
  { label: '0-100元', value: '0-100' },
  { label: '100-500元', value: '100-500' },
  { label: '500-1000元', value: '500-1000' },
  { label: '1000元以上', value: '1000-up' }
]

// 计算属性
const sortLabel = computed(() => {
  return sortOptions.find(opt => opt.value === currentSort.value)?.label
})

const priceRangeLabel = computed(() => {
  return priceRanges.find(range => range.value === currentPriceRange.value)?.label
})

// 方法定义
const getCategories = async () => {
  try {
    const response = await fetch('/api/categories')
    categories.value = await response.json()
    if (categories.value.length > 0) {
      currentCategory.value = categories.value[0]
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const getProducts = async () => {
  try {
    const params = new URLSearchParams({
      category_id: currentCategory.value?.category_id,
      page: currentPage.value.toString(),
      sort: currentSort.value,
      price_range: currentPriceRange.value
    })

    const response = await fetch(`/api/products?${params}`)
    const data = await response.json()
    products.value = data.items
    totalPages.value = Math.ceil(data.total / data.pageSize)
  } catch (error) {
    console.error('获取商品列表失败:', error)
  }
}

const selectCategory = (category: any) => {
  currentCategory.value = category
  currentPage.value = 1
  getProducts()
}

const goToProduct = (prodId: number) => {
  router.push(`/product/${prodId}`)
}

// 监听筛选条件变化
watch([currentSort, currentPriceRange, currentPage], () => {
  getProducts()
})

onMounted(() => {
  getCategories()
})
</script>

<style scoped>
.category-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.category-container {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
}

.filter-section {
  margin-bottom: 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.product-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
