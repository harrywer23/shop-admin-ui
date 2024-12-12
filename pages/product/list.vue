<template>
  <div class="product-list-page">
    <!-- 分类过滤 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center">
            <div class="text-subtitle2 q-mr-md">{{ $t('product.list.filter.category') }}:</div>
            <!-- 分类级联选择 -->
            <div class="category-cascade">
              <!-- 一级分类网格 -->
              <div class="primary-categories" :class="{ 'is-collapsed': isCollapsed }">
                <q-btn
                  v-for="cat in categories"
                  :key="cat.categoryId"
                  :color="isSelectedCategory(cat.categoryId) ? 'primary' : 'grey-7'"
                  @click="selectCategory(cat)"
                  class="category-btn q-ma-xs"
                  flat
                  dense
                >
                  <q-avatar size="20px" class="q-mr-xs" v-if="cat.pic">
                    <q-img :src="getImageUrl(cat.pic)" />
                  </q-avatar>
                  <q-icon
                    v-else
                    name="category"
                    size="20px"
                    class="q-mr-xs"
                  />
                  <span class="category-name">{{getCurrentLanguageName(cat.translations, cat.categoryName) }}</span>
                  <q-tooltip>{{ getCurrentLanguageName(cat.translations, cat.categoryName) }}</q-tooltip>
                </q-btn>
              </div>

              <!-- 展开/收起按钮 -->
              <div
                class="expand-button"
                v-if="categories.length > initialVisibleCount"
              >
                <q-btn
                  flat
                  dense
                  :label="isCollapsed ? $t('common.showMore') : $t('common.showLess')"
                  :icon-right="isCollapsed ? 'expand_more' : 'expand_less'"
                  @click="toggleCollapse"
                  color="grey-7"
                  size="sm"
                />
              </div>

              <!-- 二级分类 -->
              <div
                v-if="currentCategory?.children && currentCategory.children.length > 0"
                class="subcategory-list q-mt-sm"
              >
                <q-btn
                  v-for="subCat in currentCategory.children"
                  :key="subCat.categoryId"
                  :color="selectedCategory === subCat.categoryId ? 'primary' : 'grey-7'"
                  flat
                  dense
                  @click="selectCategory(subCat)"
                  class="q-ma-xs"
                >
                  <q-avatar size="16px" class="q-mr-xs" v-if="subCat.pic">
                    <q-img :src="getImageUrl(subCat.pic)" />
                  </q-avatar>
                  <q-icon
                    v-else
                    name="subdirectory_arrow_right"
                    size="16px"
                    class="q-mr-xs"
                  />
                  {{ getCurrentLanguageName(subCat.translations, subCat.categoryName)  }}
                </q-btn>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 排序工具栏 -->
    <div class="sort-toolbar q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-col-gutter-md">
            <!-- 搜索框 -->
            <div class="col-12 col-sm-4">
              <q-input
                v-model="searchQuery"
                :placeholder="$t('product.list.search.placeholder')"
                dense
                outlined
                clearable
                @update:model-value="handleSearch"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <!-- 排序按钮组 -->
            <div class="col-12 col-sm-6">
              <div class="sort-buttons">
                <q-btn-group flat>
                  <q-btn
                    :color="sortType === 'default' ? 'primary' : 'grey-7'"
                    :label="$t('product.list.sort.default')"
                    @click="updateSort('default')"
                  />
                  <q-btn
                    :color="sortType.startsWith('price') ? 'primary' : 'grey-7'"
                    @click="togglePriceSort"
                  >
                    {{ $t('product.list.sort.price') }}
                    <q-icon
                      :name="priceSortIcon"
                      class="q-ml-xs"
                    />
                  </q-btn>
                  <q-btn
                    :color="sortType === 'sales' ? 'primary' : 'grey-7'"
                    :label="$t('product.list.sort.sales')"
                    @click="updateSort('sales')"
                  />
                  <q-btn
                    :color="sortType === 'newest' ? 'primary' : 'grey-7'"
                    :label="$t('product.list.sort.newest')"
                    @click="updateSort('newest')"
                  />
                </q-btn-group>
              </div>
            </div>

            <!-- 总数显示 -->
            <div class="col-12 col-sm-2 text-right">
              <div class="total-count text-grey-7">
                {{ $t('product.list.totalItems', { count: totalCount }) }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 商品列表 -->
    <div class="product-grid">
      <ProductListCard
        v-for="product in products"
        :key="product.prodId"
        :product="product"
      />
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

    <!-- 添加全局loading -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import {useRoute} from "#vue-router";
import ProductListCard from '~/components/product/ProductListCard.vue'
import {getCurrentLanguageName,getImageUrl} from "~/utils/tools";
const route = useRoute()
const parentId = ref(route.query.parentId || 1)
const $q = useQuasar()
const { t } = useI18n()

// 定义分类接口
interface Category {
  categoryId: number | string;
  categoryName: string;
  translations: Translations
  children?: Category[];
  parentId?: number;
  pic?: string;
}

// 状态变量
const products = ref<any[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = 12
const selectedCategory = ref<number | string | null>(null)
const sortType = ref('default')
const categories = ref<Category[]>([])
const currentCategory = ref<Category | null>(null)
const loading = ref(false)

// 分类展示相关
const initialVisibleCount = 20 // 增加初始显示数量，使其能显示两行
const isCollapsed = ref(true)


// 展开/收起切换
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}


// 修改获取分类列表函数
const loadCategories = async () => {
  try {
    if (!parentId.value) {
      categories.value = []
      return
    }
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

// 选择分类
const selectCategory = (category: Category) => {
  if (category.children?.length) {
    currentCategory.value = category
    // 如果有子分类，不进行筛选
    if (selectedCategory.value !== category.categoryId) {
      selectedCategory.value = category.categoryId
      currentPage.value = 1
      loadProducts()
    }
  } else {
    // 选择最终分类，清除当前一级分类
    if (category.parentId) {
      currentCategory.value = categories.value.find(
        cat => cat.categoryId === category.parentId
      ) || null
    } else {
      currentCategory.value = null
    }
    selectedCategory.value = category.categoryId
    currentPage.value = 1
    loadProducts()
  }
}

// 判断分类是否被选中
const isSelectedCategory = (categoryId: number | string) => {
  return selectedCategory.value === categoryId ||
         currentCategory.value?.categoryId === categoryId
}

// 计算属性
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))
const priceSortIcon = computed(() => {
  if (sortType.value === 'price_asc') return 'arrow_upward'
  if (sortType.value === 'price_desc') return 'arrow_downward'
  return 'unfold_more'
})

// 搜索相关
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)

// 处理搜索
const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (searchQuery.value === null) {
    searchQuery.value = ''
  }

  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 300)
}

// 加载商品列表
const loadProducts = async () => {
  loading.value = true
  try {
    const queryParams = new URLSearchParams({
      pageNum: currentPage.value.toString(),
      pageSize: pageSize,
      sort: sortType.value
    })

    // 优化分类ID的处理
    const categoryId = selectedCategory.value || parentId.value
    if (categoryId) {
      queryParams.append('categoryId', categoryId.toString())
    }

    const searchText = searchQuery.value?.trim()
    if (searchText) {
      queryParams.append('search', searchText)
    }

    const response = await api.get(`/prod/listByCategoryId?${queryParams.toString()}`)
    const data = await response.data
    if(data.code === 200) {
      products.value = data.data
      totalCount.value = data.total
      // 使用更安全的滚动方式
      if (typeof window !== 'undefined') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      } else if (document.documentElement) {
        document.documentElement.scrollTop = 0
      } else if (document.body) {
        document.body.scrollTop = 0
      }
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

// 更新排序方式
const updateSort = (type: string) => {
  sortType.value = type
  currentPage.value = 1
  loadProducts()
}

// 切换价格排序
const togglePriceSort = () => {
  if (sortType.value === 'price_asc') {
    sortType.value = 'price_desc'
  } else if (sortType.value === 'price_desc') {
    sortType.value = 'default'
  } else {
    sortType.value = 'price_asc'
  }
  currentPage.value = 1
  loadProducts()
}

// 过滤商品
const filterProducts = () => {
  currentPage.value = 1
  loadProducts()
}

// 修改 watch 写法
watch(
  () => route.query.parentId,
  (newParentId) => {
    //console.log("------watch parentId changed-------------------", newParentId)
    parentId.value = newParentId || 1
    // 重置分页和分类状态
    currentPage.value = 1
    selectedCategory.value = null
    currentCategory.value = null
    // 重新加载数据
    loadCategories()
    loadProducts()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.product-list-page {
  position: relative;
  min-height: 200px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  // 添加多行文本省略样式
  .ellipsis-2-lines {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
    max-height: 2.8em; // line-height * 2
    word-break: break-word;
  }

  .filter-section {
    .q-btn-toggle {
      .q-btn {
        min-width: 100px;
      }
    }
  }

  .sort-toolbar {
    .q-card-section {
      padding: 12px 16px;
    }

    .sort-buttons {
      .q-btn {
        min-width: 80px;
      }
    }

    // 移动端适配
    @media (max-width: 600px) {
      .sort-buttons {
        margin-top: 8px;

        .q-btn {
          min-width: 70px;
          font-size: 0.9rem;
        }
      }

      .total-count {
        margin-top: 8px;
        text-align: left;
      }
    }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
    min-height: 200px;
    position: relative;

    .content-loader {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
  }

  .category-cascade {
    width: 100%; // 确保占满容器宽度

    .primary-categories {
      display: flex;  // 改用 flex 布局
      flex-wrap: wrap; // 允许换行
      gap: 8px;
      padding: 8px;

      &.is-collapsed {
        max-height: 88px; // 调整为正好显示两行
        overflow: hidden;
        transition: max-height 0.3s ease;
      }

      .category-btn {
        flex: 0 0 auto; // 不伸缩，保持原始大小
        min-width: 100px; // 最小宽度
        max-width: 200px; // 增加最大宽度
        height: 32px; // 固定高度
        margin: 2px; // 统一间距
        padding: 0 8px; // 增加水平内边距

        ::v-deep .q-btn__content {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start; // 左对齐内容

          .category-name {
            flex: 1;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-right: 4px; // 为了防止文字紧贴右边
          }
        }

        // 添加图标相关样式
        .q-avatar {
          flex-shrink: 0; // 防止图标被压缩
          background: #fff;
          border-radius: 4px;
          margin-right: 4px; // 增加图标和文字的间距

          img {
            object-fit: contain;
            padding: 2px;
          }
        }

        .q-icon {
          flex-shrink: 0; // 防止图标被压缩
          opacity: 0.7;
          margin-right: 4px; // 增加图标和文字的间距
        }

        &:hover {
          .q-icon {
            opacity: 1;
          }
        }

        // 添加悬停提示的样式
        &:hover .category-tooltip {
          display: block;
        }
      }
    }

    .subcategory-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 8px;
      margin-top: 8px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      border-radius: 4px; // 添加圆角
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05); // 添加内阴影

      .q-btn {
        flex: 0 0 auto;
        min-width: 90px;
        height: 28px;
        border-radius: 14px; // 圆角按钮

        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        &.q-btn--active {
          font-weight: 500;
        }

        // 添加图标相关样式
        .q-avatar {
          background: #fff;
          border-radius: 3px;

          img {
            object-fit: contain;
            padding: 1px;
          }
        }

        .q-icon {
          opacity: 0.6;
        }

        &:hover {
          .q-icon {
            opacity: 1;
          }
        }
      }
    }

    .expand-button {
      width: 100%;
      display: flex;
      justify-content: center;
      padding: 4px 0;
      background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%);
      margin-top: -32px; // 覆盖在分类上方
      position: relative;
      z-index: 1;

      .q-btn {
        background: white;
        border-radius: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    }
  }
}

// 响应式布局优化
@media (max-width: 600px) {
  .product-list-page {
    padding: 10px;

    .product-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 10px;
    }

    .category-cascade {
      .primary-categories {
        gap: 4px;
        padding: 4px;

        .category-btn {
          min-width: 80px; // 移动端减小最小宽度
          height: 28px; // 移动端减小高度
          font-size: 12px; // 移动端缩小字体

          .q-avatar {
            size: 16px;
          }
          .q-icon {
            size: 16px;
          }
        }
      }

      &.is-collapsed {
        max-height: 76px; // 移动端调整折叠高度
      }

      .subcategory-list {
        gap: 4px;
        padding: 8px 4px;

        .q-btn {
          min-width: 70px;
          height: 24px;
          font-size: 12px;

          .q-avatar {
            size: 14px;
          }
          .q-icon {
            size: 14px;
          }
        }
      }
    }
  }
}
</style>
