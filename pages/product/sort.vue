<template>
  <div class="product-list-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav">
      <q-breadcrumbs>
        <q-breadcrumbs-el :label="$t('nav.home')" to="/" />
        <q-breadcrumbs-el :label="$t('nav.tissue')" />
        <q-breadcrumbs-el label="全部商品" />
      </q-breadcrumbs>
    </div>

    <div class="page-content">
      <!-- 左侧分类导航 -->
      <div class="sidebar">
        <div class="sidebar-section">
          <h3 class="sidebar-title">{{ $t('nav.tissue') }}</h3>
          <q-list padding>
            <q-item
              v-for="category in categories"
              :key="category.categoryId"
              clickable
              v-ripple
              :active="selectedCategory === category.categoryId"
              @click="handleCategoryClick(category.categoryId)"
            >
              <q-item-section>
                {{ category.categoryName }}
              </q-item-section>
              <q-item-section side v-if="category.children">
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 价格区间筛选 -->
<!--        <div class="sidebar-section">-->
<!--          <h3 class="sidebar-title">{{ $t('product.filter.priceRange') }}</h3>-->
<!--          <div class="price-range-filter">-->
<!--            <q-input-->
<!--              v-model.number="priceRange.min"-->
<!--              type="number"-->
<!--              dense-->
<!--              outlined-->
<!--              :placeholder="$t('product.filter.minPrice')"-->
<!--            />-->
<!--            <span class="price-separator">-</span>-->
<!--            <q-input-->
<!--              v-model.number="priceRange.max"-->
<!--              type="number"-->
<!--              dense-->
<!--              outlined-->
<!--              :placeholder="$t('product.filter.maxPrice')"-->
<!--            />-->
<!--            <q-btn-->
<!--              color="primary"-->
<!--              :label="$t('common.confirm')"-->
<!--              class="full-width q-mt-sm"-->
<!--              @click="handlePriceFilter"-->
<!--            />-->
<!--          </div>-->
<!--        </div>-->

        <!-- 标签筛选 -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">{{ $t('product.filter.tags') }}</h3>
          <div class="tags-filter">
            <q-chip
              v-for="tag in tags"
              :key="tag.id"
              :selected="selectedTags.includes(tag.id)"
              clickable
              @click="toggleTag(tag.id)"
            >
              {{ tag.title }}
            </q-chip>
          </div>
        </div>
      </div>

      <!-- 右侧商品列表 -->
      <div class="main-content">
        <ProductList
          :show-category-filter="false"
          :initial-category="selectedCategory"
          :initial-price-range="priceRange"
          :initial-tags="selectedTags.join(',')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {useQuasar} from "quasar";
import {getImageUrl} from "~/utils/tools";

const $q = useQuasar()
const { t } = useI18n()

const route = useRoute()
const prodId = ref(route.query.prodId)
const parentId = ref(0)

const router = useRouter()

// 状态管理
const selectedCategory = ref(Number(route.query.category) || 1)
const priceRange = ref({
  min: null as number | null,
  max: null as number | null
})
const selectedTags = ref<number[]>([])
const categories = ref([]);
// 修改获取分类列表函数
const loadCategories = async () => {
  try {
    // if (!parentId.value) {
    //   categories.value = []
    //   return
    // }
    const response = await api.get(`/category/subTree?parentId=${parentId.value}`)
    const data = await response.data
    if(data.code === 200) {
      categories.value = data.data
    } else {
      categories.value = []
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    $q.notify({
      type: 'negative',
      message: t('error.loadCategoriesFailed')
    })
  }
}
// 模拟标签数据
const tags = ref([
  { id: 1, title: '新品' },
  { id: 2, title: '热销' },
  { id: 3, title: '限定' },
  { id: 4, title: '预售' },
  { id: 5, title: '特价' }
])

// 处理分类点击
const handleCategoryClick = (categoryId: number) => {
  selectedCategory.value = categoryId
  updateQueryParams()
}

// 处理价格筛选
const handlePriceFilter = () => {
  updateQueryParams()
}

// 切换标签
const toggleTag = (tagId: number) => {
  const index = selectedTags.value.indexOf(tagId)
  if (index === -1) {
    selectedTags.value.push(tagId)
  } else {
    selectedTags.value.splice(index, 1)
  }
  updateQueryParams()
}

// 更新URL查询参数
const updateQueryParams = () => {
  const query: Record<string, any> = {}

  if (selectedCategory.value) {
    query.category = selectedCategory.value
  }

  if (priceRange.value.min) {
    query.minPrice = priceRange.value.min
  }

  if (priceRange.value.max) {
    query.maxPrice = priceRange.value.max
  }

  if (selectedTags.value.length) {
    query.tags = selectedTags.value.join(',')
  }

  router.push({ query })
}

// 从URL参数恢复状态
const restoreFromQuery = () => {
  const { category, minPrice, maxPrice, tags } = route.query

  if (category) {
    selectedCategory.value = Number(category)
  }

  if (minPrice) {
    priceRange.value.min = Number(minPrice)
  }

  if (maxPrice) {
    priceRange.value.max = Number(maxPrice)
  }

  if (tags) {
    selectedTags.value = String(tags).split(',').map(Number)
  }
}

onMounted(() => {
  loadCategories();
  restoreFromQuery();
})
</script>

<style scoped>
.product-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb-nav {
  margin-bottom: 20px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.page-content {
  display: flex;
  gap: 20px;
}

.sidebar {
  flex: none;
  width: 240px;
}

.sidebar-section {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  padding: 16px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.price-range-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-separator {
  text-align: center;
  color: #666;
  padding: 4px 0;
}

.tags-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.main-content {
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */
}

/* 响应式布局 */
@media (max-width: 768px) {
  .page-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .price-range-filter {
    flex-direction: row;
    align-items: center;
  }
}
</style>
