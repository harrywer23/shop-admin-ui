<template>
  <div class="product-brief">
    <q-card class="brief-card q-mb-md">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">商品简述</div>
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

      <!-- 添加商品基本信息展示区域 -->
      <q-card-section>
        <div class="row q-col-gutter-lg">
          <!-- 商品主图 -->
          <div class="col-12 col-md-4">
            <div class="image-container">
              <q-img
                :src="getImageUrl(form.pic)"
                :ratio="1"
                class="rounded-borders"
                fit="cover"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center text-grey">
                    暂无图片
                  </div>
                </template>
              </q-img>
              <!-- 添加编辑按钮 -->
              <div class="image-actions">
                <q-btn
                  color="primary"
                  icon="edit"
                  flat
                  dense
                  @click="showImageDialog = true"
                >
                  <q-tooltip>修改主图</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="col-12 col-md-8">
            <div class="product-info">
              <!-- 商品名称 -->
              <div class="info-item">
                <div class="label">商品名称</div>
                <div class="value text-h5">{{ form.prodName }}</div>
              </div>

              <!-- 商品类型 -->
              <div class="info-item">
                <div class="label">商品类型</div>
                <div class="value">
                  <q-chip
                    :color="getTypeColor(form.prodType)"
                    text-color="white"
                  >
                    {{ getTypeLabel(form.prodType) }}
                  </q-chip>
                </div>
              </div>

              <!-- 商品分类 -->
              <div class="info-item">
                <div class="label">商品分类</div>
                <div class="value">{{ getCategoryName(form.categoryId) }}</div>
              </div>

              <!-- 价格信息 -->
              <div class="info-item">
                <div class="label">价格信息</div>
                <div class="value price-info">
                  <span class="price">¥{{ form.price }}</span>
                  <span class="original-price" v-if="form.oriPrice">
                    原价: ¥{{ form.oriPrice }}
                  </span>
                </div>
              </div>

              <!-- 商品品质 -->
              <div class="info-item">
                <div class="label">商品品质</div>
                <div class="value">
                  <q-chip
                    :color="getQualityColor(form.quality)"
                    text-color="white"
                  >
                    {{ getQualityLabel(form.quality) }}
                  </q-chip>
                </div>
              </div>

              <!-- 商品状态 -->
              <div class="info-item">
                <div class="label">商品状态</div>
                <div class="value">
                  <q-chip
                    :color="form.status === 1 ? 'positive' : 'negative'"
                    text-color="white"
                  >
                    {{ form.status === 1 ? '已上架' : '已下架' }}
                  </q-chip>
                </div>
              </div>

              <!-- 商品简介 -->
              <div class="info-item">
                <div class="label">商品简介</div>
                <div class="value brief-text">{{ form.brief || '暂无简介' }}</div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 添加操作卡片 -->
    <q-card class="actions-card">
      <q-card-section>
        <div class="text-h6">商品操作</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-sm">
          <!-- 基本信息编辑 -->
          <div class="col-auto">
            <q-btn-dropdown
              color="primary"
              icon="edit"
              label="基本信息"
            >
              <q-list>
                <q-item clickable v-close-popup @click="handleBasicEdit">
                  <q-item-section avatar>
                    <q-icon name="edit" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>基本信息</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>

          <!-- 商品详情编辑 -->
          <div class="col-auto">
            <q-btn
              color="purple"
              icon="description"
              label="商品详情"
              @click="handleDetailEdit"
            />
          </div>

          <!-- 标签管理 -->
          <div class="col-auto">
            <q-btn
              color="deep-orange"
              icon="local_offer"
              label="标签管理"
              @click="handleTagEdit"
            />
          </div>

          <!-- 运费设置 -->
          <div class="col-auto">
            <q-btn
              color="brown"
              icon="local_shipping"
              label="运费设置"
              @click="handleDeliveryEdit"
            />
          </div>

          <!-- 宣传图片 -->
          <div class="col-auto">
            <q-btn
              color="blue"
              icon="photo_library"
              label="宣传图片"
              @click="handlePromoImages"
            />
          </div>

          <!-- 预售信息(仅预售商品显示) -->
          <div v-if="form.prodType === 2" class="col-auto">
            <q-btn
              color="deep-purple"
              icon="event"
              label="预售设置"
              @click="handlePresellEdit"
            />
          </div>

          <!-- 规格属性 -->
          <div class="col-auto">
            <q-btn
              color="info"
              icon="inventory_2"
              label="规格属性"
              @click="handleViewSkuTag"
            />
          </div>

          <!-- SKU列表 -->
          <div class="col-auto">
            <q-btn
              color="info"
              icon="list"
              label="SKU列表"
              @click="handleViewSkus"
            />
          </div>

          <!-- 评论管理 -->
          <div class="col-auto">
            <q-btn
              color="info"
              icon="comment"
              label="评论管理"
              @click="goToComments"
            />
          </div>

          <!-- 品质修改 -->
          <div class="col-auto">
            <q-btn
              color="amber"
              icon="stars"
              label="修改品质"
              @click="handleQualityEdit"
            />
          </div>

          <!-- 修改分类 -->
          <div class="col-auto">
            <q-btn
              color="deep-purple"
              icon="category"
              label="修改分类"
              @click="handleCategoryEdit"
            />
          </div>

          <!-- 上下架状态 -->
          <div class="col-auto">
            <q-btn
              :color="form.status === 1 ? 'negative' : 'positive'"
              :icon="form.status === 1 ? 'visibility_off' : 'visibility'"
              :label="form.status === 1 ? '下架' : '上架'"
              @click="handleStatusChange"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 添加必要的对话框 -->
    <!-- 品质编辑对话框 -->
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

        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确定" @click="saveQuality" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 分类修改对话框 -->
    <q-dialog v-model="showCategoryDialog">
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
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确定" @click="saveCategory" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 修改图片上传对话框 -->
    <q-dialog v-model="showImageDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">修改商品主图</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <image-uploader
            v-model="tempImageUrl"
            :multiple="false"
            hint="支持jpg、png格式，建议尺寸800x800像素"
            @upload-success="handleImageUploadSuccess"
            @upload-error="handleImageUploadError"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确定" @click="confirmUpdateMainImage" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import ImageUploader from '~/components/ImageUploader.vue'
import { useRuntimeConfig } from '#app'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const saving = ref(false)
const mainImage = ref(null)

const config = useRuntimeConfig()
const IMAGE_BASE_URL = config.public.imageBaseUrl || 'https://image.aiavr.uk/xinshijie'

// 表单数据
const form = ref({
  prodId: '',
  prodName: '',
  prodType: 1,
  categoryId: '',
  oriPrice: 0,
  price: 0,
  pic: '',
  brief: '',
  status: 1,
  quality: ''
})

// 商品类型选项
const prodTypeOptions = [
  { label: '普通商品', value: 1 },
  { label: '预售商品', value: 2 },
  { label: '团购商品', value: 3 },
  { label: '秒杀商品', value: 4 }
]

// 商品分类选项
interface CategoryOption {
  label: string
  value: string
}
const categoryOptions = ref<CategoryOption[]>([])

// 加载商品分类
async function loadCategories() {
  try {
    // 加载分类列表用于下拉选择
    const categoryResponse = await api.get('/sys/category/list')
    if (categoryResponse.data.code === 200) {
      categoryOptions.value = categoryResponse.data.data.map(item => ({
        label: item.categoryName,
        value: item.categoryId
      }))
    }

    // 加载分类树用于修改分类对话框
    const treeResponse = await api.get('/sys/category/subTree?parentId=0')
    if (treeResponse.data.code === 200) {
      const processCategories = (cats: CategoryTree[]) => {
        return cats.map(cat => ({
          label: cat.categoryName,
          value: cat.categoryId,
          children: cat.children?.length ? processCategories(cat.children) : undefined
        }))
      }
      categories.value = processCategories(treeResponse.data.data)
    }
  } catch (error) {
    console.error('加载分类列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载分类列表失败'
    })
  }
}

// 加载商品数据
async function loadProductData() {
  const prodId = route.query.prodId
  if (!prodId) return

  try {
    const response = await api.get(`/sys/prod/detail/${prodId}`)
    const result = await response.data
    if (result.code === 200) {
      form.value = {
        ...form.value,
        ...result.data
      }
    }
  } catch (error) {
    console.error('加载商品数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载商��数据失败'
    })
  }
}

// 添加新的响应式变量
const showQualityDialog = ref(false)
const selectedQuality = ref<string>('')
const showCategoryDialog = ref(false)
const selectedNewCategory = ref<string>('')
const categories = ref([])
const showImageDialog = ref(false)
const tempImages = ref<string>('')

// 品质选项
const qualityOptions = [
  {
    label: 'S级 - 臻品',
    value: 'S',
    description: '各项指标均为顶级，具有极高的收藏价值'
  },
  {
    label: 'A级 - 精品',
    value: 'A',
    description: '品质优良，各项指标均达到行业领先水平'
  },
  {
    label: 'B级 - 良品',
    value: 'B',
    description: '品质中等，符合一般消费者的需求'
  },
  {
    label: 'C级 - 普品',
    value: 'C',
    description: '品质一般，价格较低'
  },
  {
    label: 'D级 - 次品',
    value: 'D',
    description: '品质较差，存在明显的缺陷'
  }
]

// 添加操作方法
const handleDetailEdit = () => {
  window.open(`/sys/product/edit/detail?prodId=${form.value.prodId}`, '_blank')
}

const handleTagEdit = () => {
  window.open(`/sys/product/edit/tags?prodId=${form.value.prodId}`, '_blank')
}

const handleDeliveryEdit = () => {
  window.open(`/sys/product/edit/delivery?prodId=${form.value.prodId}`, '_blank')
}

const handlePromoImages = () => {
  window.open(`/sys/product/edit/image?prodId=${form.value.prodId}`, '_blank')
}

const handlePresellEdit = () => {
  window.open(`/sys/product/edit/presell?prodId=${form.value.prodId}`, '_blank')
}

const handleViewSkuTag = () => {
  window.open(`/sys/product/edit/sku?prodId=${form.value.prodId}`, '_blank')
}

const handleViewSkus = () => {
  window.open(`/sys/product/sku/list?prodId=${form.value.prodId}`, '_blank')
}

const goToComments = () => {
  window.open(`/sys/product/comments/${form.value.prodId}`, '_blank')
}

// 处理品质编辑
const handleQualityEdit = () => {
  selectedQuality.value = form.value.quality
  showQualityDialog.value = true
}

// 保存品质
const saveQuality = async () => {
  try {
    const qualityValue = selectedQuality.value.toUpperCase()
    const response = await api.get(`/sys/prod/update/quality/${form.value.prodId}/${qualityValue}`)

    if (response.data.code === 200) {
      form.value.quality = qualityValue
      showQualityDialog.value = false
      $q.notify({
        type: 'positive',
        message: '商品品质修改成功'
      })
    }
  } catch (error) {
    console.error('修改商品品质失败:', error)
    $q.notify({
      type: 'negative',
      message: '修改商品品质失败'
    })
  }
}

// 处理分类编���
const handleCategoryEdit = () => {
  selectedNewCategory.value = form.value.categoryId
  showCategoryDialog.value = true
}

// 保存分类
const saveCategory = async () => {
  try {
    const response = await api.get(`/sys/prod/update/category/${form.value.prodId}/${selectedNewCategory.value}`)

    if (response.data.code === 200) {
      form.value.categoryId = selectedNewCategory.value
      showCategoryDialog.value = false
      $q.notify({
        type: 'positive',
        message: '商品分类修改成功'
      })
      await loadCategories() // 重新加载分类列表
    }
  } catch (error) {
    console.error('修改商品分类失败:', error)
    $q.notify({
      type: 'negative',
      message: '修改商品分类失败'
    })
  }
}

// 处理上下架
const handleStatusChange = async () => {
  try {
    const newStatus = form.value.status === 1 ? 0 : 1
    const response = await api.get(`/sys/prod/update/status/${form.value.prodId}/${newStatus}`)

    if (response.data.code === 200) {
      form.value.status = newStatus
      $q.notify({
        type: 'positive',
        message: `商品已${newStatus === 1 ? '上架' : '下架'}`
      })
    }
  } catch (error) {
    console.error('修改商品状态失败:', error)
    $q.notify({
      type: 'negative',
      message: '修改商品状��失败'
    })
  }
}

// 添加基本信息编辑方法
const handleBasicEdit = () => {
  window.open(`/sys/product/edit/basic?prodId=${form.value.prodId}`, '_blank')
}

// 添加 CategoryTree 接口定义
interface CategoryTree {
  categoryId: string
  categoryName: string
  children?: CategoryTree[]
}

// 修改 colors 对象的类型定义
function getTypeColor(type: number): string {
  const colors: Record<number, string> = {
    1: 'primary',   // 普通商品
    2: 'purple',    // 预售商品
    3: 'orange',    // 团购商品
    4: 'red'        // 秒杀商品
  }
  return colors[type] || 'grey'
}

// 修改 labels 对象的类型定义
function getTypeLabel(type: number): string {
  const labels: Record<number, string> = {
    1: '普通商品',
    2: '预售商品',
    3: '团购商品',
    4: '秒杀商品'
  }
  return labels[type] || '未知类型'
}

// 修改 colors 对象的类型定义
function getQualityColor(quality: string): string {
  const colors: Record<string, string> = {
    'S': 'purple',
    'A': 'primary',
    'B': 'positive',
    'C': 'warning',
    'D': 'negative'
  }
  return colors[quality] || 'grey'
}

// 修改图片上传相关的代码
const tempImageUrl = ref<string>('')

// 处理图片上传成功
const handleImageUploadSuccess = (imageUrl: string) => {
  tempImageUrl.value = imageUrl
}

// 添加确认更新主图的方法
const confirmUpdateMainImage = async () => {
  console.log('确认更新主图');
  console.log('tempImageUrl:', tempImageUrl.value)
  if (!tempImageUrl.value) {
    showImageDialog.value = false
    return
  }

  try {
    const response = await api.post(`/sys/prod/update/pic/${form.value.prodId}`, null, {
      params: {
        pic: tempImageUrl.value
      }
    })

    if (response.data.code === 200) {
      form.value.pic = tempImageUrl.value
      showImageDialog.value = false

      $q.notify({
        type: 'positive',
        message: '商品主图更新成功'
      })

      await loadProductData()
    } else {
      throw new Error(response.data.msg || '更新失败')
    }
  } catch (error) {
    console.error('更新商品主图失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '更新商品主图失败'
    })
  }
}

// 处理图片上传失败
const handleImageUploadError = (error: any) => {
  console.error('图片上传失败:', error)
}

// 在组件挂载时加载数据
onMounted(async () => {
  await loadCategories()
  await loadProductData()
})

function getCategoryName(categoryId: string): string {
  const category = categoryOptions.value.find(c => c.value === categoryId)
  return category ? category.label : '未分类'
}

// ��加品质标签映射函数
function getQualityLabel(quality: string): string {
  const option = qualityOptions.find(opt => opt.value === quality)
  return option ? option.label : '未设置'
}

function getImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${IMAGE_BASE_URL}${url}`
}
</script>

<style lang="scss" scoped>
.product-brief {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;

  .brief-card,
  .actions-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .actions-card {
    .q-btn,
    .q-btn-dropdown {
      min-width: 120px;
    }

    .q-item {
      min-height: 40px;
    }
  }

  .product-info {
    .info-item {
      margin-bottom: 20px;

      .label {
        color: #666;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .value {
        color: #333;
        font-size: 16px;

        &.price-info {
          .price {
            color: #f56c6c;
            font-size: 24px;
            font-weight: 500;
          }

          .original-price {
            color: #999;
            font-size: 14px;
            text-decoration: line-through;
            margin-left: 8px;
          }
        }
      }

      .brief-text {
        font-size: 14px;
        line-height: 1.6;
        color: #666;
        white-space: pre-wrap;
      }
    }
  }
}

.category-dialog {
  min-width: 350px;
}

.image-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;

  &:hover {
    .image-actions {
      opacity: 1;
    }
  }

  .image-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.3s;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 4px;
    padding: 4px;

    .q-btn {
      color: white;
    }
  }
}

// 对话框中的图片上传器样式
:deep(.image-uploader) {
  .upload-trigger {
    margin: 0 auto;
  }
}
</style>
