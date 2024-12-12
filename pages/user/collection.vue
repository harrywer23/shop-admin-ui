<template>
  <div class="collection-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="text-h5">{{ $t('user.collection.title') }}</h1>
      <div class="header-actions">
        <q-btn-group flat>
          <q-btn
            v-for="view in viewOptions"
            :key="view.value"
            :icon="view.icon"
            :color="currentView === view.value ? 'primary' : 'grey'"
            @click="currentView = view.value"
          >
            <q-tooltip>{{ view.label }}</q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center q-col-gutter-md">
            <!-- 搜索框 -->
            <div class="col-12 col-sm-4">
              <q-input
                v-model="searchQuery"
                :placeholder="$t('user.collection.searchPlaceholder')"
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

            <!-- 时间筛选 -->
            <div class="col-12 col-sm-4">
              <q-select
                v-model="timeRange"
                :options="timeRangeOptions"
                :label="$t('user.collection.timeRange')"
                dense
                outlined
                emit-value
                map-options
                @update:model-value="filterCollections"
              />
            </div>

            <!-- 批量操作 -->
            <div class="col-12 col-sm-4 text-right">
              <q-btn
                v-if="selected.length"
                color="negative"
                :label="$t('user.collection.batchDelete')"
                @click="confirmBatchDelete"
                dense
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 收藏列表 - 网格视图 -->
    <div v-if="currentView === 'grid'" class="collection-grid">
      <q-card
        v-for="item in filteredCollections"
        :key="item.id"
        class="collection-card"
        bordered
        flat
      >
        <q-checkbox
          v-model="selected"
          :val="item.id"
          class="absolute-top-right q-ma-sm"
        />

        <q-img
          :src="getImageUrl(item.pic)"
          :ratio="1"
          class="collection-image"
          @click="viewDetail(item)"
        >
          <template v-slot:error>
            <div class="absolute-full flex flex-center bg-negative text-white">
              {{ $t('common.imageLoadError') }}
            </div>
          </template>
        </q-img>

        <q-card-section>
          <div class="text-subtitle1 ellipsis-2-lines">{{ item.prodName }}</div>
          <div class="row items-center justify-between q-mt-sm">
            <div class="text-primary text-weight-bold">¥{{ item.price }}</div>
            <div class="text-caption text-grey">
              {{ formatDate(item.createTime) }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            round
            color="grey"
            icon="delete"
            @click="confirmDelete(item)"
          >
            <q-tooltip>{{ $t('user.collection.delete') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            color="primary"
            icon="shopping_cart"
            @click="addToCart(item)"
          >
            <q-tooltip>{{ $t('user.collection.addToCart') }}</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>

    <!-- 收藏列表 - 列表视图 -->
    <div v-else class="collection-list">
      <q-list bordered separator>
        <q-item
          v-for="item in filteredCollections"
          :key="item.id"
          class="collection-item"
        >
          <q-item-section avatar>
            <q-checkbox v-model="selected" :val="item.id" />
          </q-item-section>

          <q-item-section avatar>
            <q-img
              :src="getImageUrl(item.pic)"
              style="width: 80px; height: 80px"
              @click="viewDetail(item)"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-subtitle1">{{ item.prodName }}</q-item-label>

          </q-item-section>

          <q-item-section side>
            <div class="text-primary text-weight-bold">¥{{ item.price }}</div>
          </q-item-section>
<!--          <q-item-section side>-->
<!--            <div class="text-primary text-weight-bold">{{ item }}</div>-->
<!--          </q-item-section>-->
          <q-item-section side>
            <div class="row items-center">
              <q-btn
                flat
                round
                color="grey"
                icon="delete"
                @click="confirmDelete(item)"
              >
                <q-tooltip>{{ $t('user.collection.delete') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="primary"
                icon="shopping_cart"
                @click="addToCart(item)"
              >
                <q-tooltip>{{ $t('user.collection.addToCart') }}</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 分页器 -->
    <div class="pagination-section q-mt-lg flex justify-center">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="6"
        boundary-numbers
        direction-links
        @update:model-value="loadCollections"
      />
    </div>

    <!-- 加载状态 -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'users',
  middleware: 'auth'
});
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { date } from 'quasar'

// 定义收藏项的接口
interface CollectionItem {
  id: number
  prodId: number
  prodName: string
  pic: string
  price: number
  createTime: string
}

const $q = useQuasar()
const { t } = useI18n()
const router = useRouter()

// 视图选项
const viewOptions = [
  { value: 'grid', icon: 'grid_view', label: t('user.collection.gridView') },
  { value: 'list', icon: 'list', label: t('user.collection.listView') }
]

// 时间范围选项
const timeRangeOptions = [
  { label: t('user.collection.timeRange.all'), value: 'all' },
  { label: t('user.collection.timeRange.week'), value: 'week' },
  { label: t('user.collection.timeRange.month'), value: 'month' },
  { label: t('user.collection.timeRange.threeMonths'), value: 'threeMonths' }
]

// 状态变量 - 添加类型定义并初始化为空数组
const collections = ref<CollectionItem[]>([])
const filteredCollections = ref<CollectionItem[]>([])
const currentPage = ref(1)
const pageSize = 12
const loading = ref(false)
const currentView = ref('grid')
const searchQuery = ref('')
const timeRange = ref('all')
const selected = ref<number[]>([])

// 计算属性
const totalPages = computed(() => Math.ceil(filteredCollections.value.length / pageSize))

// 格式化日期
const formatDate = (dateStr: string) => {
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm')
}

// 加载收藏列表
const loadCollections = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/prod/favorite/list')
    const { code, data } = await response.data
    if (code === 200 && Array.isArray(data)) {
      collections.value = data
      filterCollections()
    } else {
      collections.value = []
      throw new Error('Invalid data format')
    }
  } catch (error) {
    console.error('Failed to load collections:', error)
    $q.notify({
      type: 'negative',
      message: t('user.collection.loadError')
    })
  } finally {
    loading.value = false
  }
}

// 筛选收藏
const filterCollections = () => {
  let filtered = [...collections.value]

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.prodName.toLowerCase().includes(query)
    )
  }

  // 时间范围筛选
  if (timeRange.value !== 'all') {
    const now = new Date()
    const ranges: Record<string, number> = {
      week: 7,
      month: 30,
      threeMonths: 90
    }
    const days = ranges[timeRange.value] || 0
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.createTime)
      return date.getDateDiff(now, itemDate, 'days') <= days
    })
  }

  filteredCollections.value = filtered
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  filterCollections()
}

// 查看详情
const viewDetail = (item: CollectionItem) => {
  router.push(`/product/detail?prodId=${item.prodId}`)
}

// 添加到购物车
const addToCart = async (item: CollectionItem) => {
  try {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prodId: item.prodId,
        count: 1
      })
    })
    const { code, msg } = await response.json()
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: t('user.collection.addToCartSuccess')
      })
    } else {
      throw new Error(msg)
    }
  } catch (error) {
    console.error('Failed to add to cart:', error)
    $q.notify({
      type: 'negative',
      message: t('user.collection.addToCartError')
    })
  }
}

// 确认删除
const confirmDelete = (item: CollectionItem) => {
  $q.dialog({
    title: t('user.collection.deleteConfirm'),
    message: t('user.collection.deleteMessage'),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/prod/favorite/del/${item.prodId}`)
      const { code, msg } = await response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: t('user.collection.deleteSuccess')
        })
        loadCollections()
      } else {
        throw new Error(msg)
      }
    } catch (error) {
      console.error('Failed to delete collection:', error)
      $q.notify({
        type: 'negative',
        message: t('user.collection.deleteError')
      })
    }
  })
}

// 确认批量删除
const confirmBatchDelete = () => {
  if (!selected.value.length) return

  $q.dialog({
    title: t('user.collection.batchDeleteConfirm'),
    message: t('user.collection.batchDeleteMessage', { count: selected.value.length }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await fetch('/api/collections/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: selected.value
        })
      })
      const { code, msg } = await response.json()
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: t('user.collection.batchDeleteSuccess')
        })
        selected.value = []
        loadCollections()
      } else {
        throw new Error(msg)
      }
    } catch (error) {
      console.error('Failed to batch delete:', error)
      $q.notify({
        type: 'negative',
        message: t('user.collection.batchDeleteError')
      })
    }
  })
}

// 初始化
onMounted(() => {
  loadCollections()
})
</script>

<style lang="scss" scoped>
.collection-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .collection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;

    .collection-card {
      position: relative;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .collection-image {
        cursor: pointer;
      }

      .ellipsis-2-lines {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-word;
        min-height: 44px;
        max-height: 48px;
        line-height: 1.4;
      }
    }
  }

  .collection-list {
    .collection-item {
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #f5f5f5;
      }

      .q-img {
        cursor: pointer;
        border-radius: 4px;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}

// 响应式布局
@media (max-width: 600px) {
  .collection-page {
    padding: 12px;

    .collection-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
    }

    .collection-list {
      .q-item {
        padding: 8px;
      }
    }
  }
}
</style>
