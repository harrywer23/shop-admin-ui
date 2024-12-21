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

              <!-- 商品品牌 -->
              <div class="info-item">
                <div class="label">商品品牌</div>
                <div class="value">
                  <span>{{ getBrandName(form.brandId) }}</span>
                  <q-btn
                    flat
                    round
                    dense
                    color="primary"
                    icon="edit"
                    @click="showBrandDialog = true"
                  >
                    <q-tooltip>修改品牌</q-tooltip>
                  </q-btn>
                </div>
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

              <!-- 商品源地址 -->
              <div class="info-item">
                <div class="label">商品源地址</div>
                <div class="value">
                  <a 
                    :href="form.sourceUrl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="source-link"
                    v-if="form.sourceUrl"
                  >
                    {{ form.sourceUrl }}
                  </a>
                  <span v-else class="text-grey">暂无源地址</span>
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
          <!-- 品牌管理 -->
          <div class="col-auto">
            <q-btn
              color="blue-grey"
              icon="branding_watermark"
              label="修改品牌"
              @click="showBrandDialog = true"
            />
          </div>

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

          <!-- 参数设置 -->
          <div class="col-auto">
            <q-btn
              color="teal"
              icon="settings"
              label="参数设置"
              @click="showParamsDialog = true"
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
          <Treeselect
            :modelValue="selectedNewCategory"
            @update:modelValue="selectedNewCategory = $event"
            :options="categories"
            :normalizer="normalizer"
            placeholder="选择分类"
            :clearable="true"
            :default-expand-level="Infinity"
            :max-height="400"
            class="category-select"
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

    <!-- 品牌选择对话框 -->
    <q-dialog v-model="showBrandDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">选择品牌</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col">
              <q-input
                v-model="brandSearch"
                label="搜索品牌"
                dense
                outlined
                clearable
                @keyup.enter="searchBrands"
              >
                <template v-slot:append>
                  <q-icon name="search" class="cursor-pointer" @click="searchBrands" />
                </template>
              </q-input>
            </div>
            <div class="col-auto">
              <q-btn color="primary" icon="add" label="新增品牌" @click="openAddBrandDialog" />
            </div>
          </div>

          <q-list separator>
            <q-item
              v-for="brand in brandList"
              :key="brand.brandId"
              clickable
              v-ripple
              @click="selectBrand(brand)"
            >
              <q-item-section avatar>
                <q-avatar>
                  <q-img 
                    :src="getImageUrl(brand.brandPic)"
                    :ratio="1"
                  >
                    <template v-slot:error>
                      <div class="absolute-full flex flex-center text-grey">
                        无图片
                      </div>
                    </template>
                  </q-img>
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ brand.brandName }}</q-item-label>
                <q-item-label caption>{{ brand.brief || '暂无描述' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="selectedBrandId" :val="brand.brandId" />
              </q-item-section>
            </q-item>
            <div v-if="brandList.length === 0" class="text-center q-pa-md text-grey">
              暂无品牌数据
            </div>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确定" color="primary" @click="confirmBrandSelection" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 新增品牌对话框 -->
    <q-dialog v-model="showAddBrandDialog">
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">新增品牌</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveBrand" class="q-gutter-md">
            <q-input
              v-model="newBrand.brandName"
              label="品牌名称"
              :rules="[val => !!val || '请输入品牌名称']"
              outlined
            />

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="newBrand.firstChar"
                  label="品牌首字母"
                  maxlength="1"
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="newBrand.seq"
                  type="number"
                  label="排序"
                  outlined
                />
              </div>
            </div>

            <image-uploader
              v-model="newBrand.brandPic"
              label="品牌图片"
              hint="建议尺寸: 200x200像素"
            />

            <q-input
              v-model="newBrand.brief"
              label="简要描述"
              type="textarea"
              outlined
            />

            <div class="row justify-end q-mt-md">
              <q-btn label="取消" flat v-close-popup />
              <q-btn label="保存" type="submit" color="primary" class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 参数设置对话框 -->
    <q-dialog v-model="showParamsDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">商品参数设置</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <!-- 添加自定义参数输入区域 -->
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col">
              <q-input
                v-model="customParamKey"
                label="自定义参数名称"
                dense
                outlined
              />
            </div>
            <div class="col">
              <q-input
                v-model="customParamValue"
                label="自定义参数值"
                dense
                outlined
              />
            </div>
            <div class="col-auto">
              <q-btn
                color="primary"
                icon="add"
                label="添加自定义"
                :disable="!customParamKey || !customParamValue"
                @click="addCustomParam"
              />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- 从预设参数中选择 -->
          <div class="text-subtitle2 q-mb-sm">从预设参数中选择</div>
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col">
              <q-select
                v-model="selectedParam"
                :options="filteredParams"
                option-label="paramKey"
                label="选择参数"
                dense
                outlined
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                @filter="filterParams"
                @new-value="createParam"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      输入新参数名称并按Enter添加
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col">
              <q-select
                v-model="selectedParamValue"
                :options="filteredParamValues"
                label="选择参数值"
                dense
                outlined
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                @filter="filterParamValues"
                @new-value="createParamValue"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      输入新参数值并按Enter添加
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-auto">
              <q-btn
                color="primary"
                icon="add"
                label="添加"
                :disable="!selectedParam || !selectedParamValue"
                @click="addProductParam"
              />
            </div>
          </div>

          <!-- 已添加的参数列表 -->
          <q-list separator>
            <q-item v-for="(param, index) in productParams" :key="index">
              <q-item-section>
                <q-item-label>{{ param.paramKey }}</q-item-label>
                <q-item-label caption>{{ param.paramValue }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="removeProductParam(index)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="保存" color="primary" @click="saveProductParams" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import ImageUploader from '~/components/ImageUploader.vue'
import { useRuntimeConfig } from '#app'
import { defineAsyncComponent } from 'vue'
// import "@zanmato/vue3-treeselect/dist/vue3-treeselect.css"

const Treeselect = defineAsyncComponent(() =>
  import('@zanmato/vue3-treeselect').then(mod => mod.default)
)

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
  quality: '',
  brandId: '',
  sourceUrl: ''
})

// 商品类型选项
const prodTypeOptions = [
  { label: '普通商品', value: 1 },
  { label: '预售商品', value: 2 },
  { label: '团购商品', value: 3 },
  { label: '秒杀商品', value: 4 }
]

// 在 script setup 中添加 categoryOptions
const categoryOptions = ref([])

// 加载商品分类
async function loadCategories() {
  try {
    const response = await api.get('/sys/category/subTree?parentId=0')
    if (response.data.code === 200) {
      const processCategories = (cats) => {
        return cats.map(cat => ({
          value: cat.categoryId,
          label: cat.categoryName,
          children: cat.children?.length ? processCategories(cat.children) : undefined
        }))
      }
      categories.value = processCategories(response.data.data)
      // 同时更新 categoryOptions
      categoryOptions.value = response.data.data.map(cat => ({
        value: cat.categoryId,
        label: cat.categoryName
      }))
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
      message: '加载商品数据失败'
    })
  }
}

// 添加新的响应式变量
const showQualityDialog = ref(false)
const selectedQuality = ref('')
const showCategoryDialog = ref(false)
const selectedNewCategory = ref('')
const categories = ref([])
const showImageDialog = ref(false)
const tempImages = ref('')
const showBrandDialog = ref(false)
const showAddBrandDialog = ref(false)
const brandSearch = ref('')
const brandList = ref([])
const selectedBrandId = ref('')
const newBrand = reactive({
  brandName: '',
  brandPic: '',
  firstChar: '',
  seq: 1,
  brief: '',
  content: ''
})

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
    description: '���质���等，符合一般消费者的需求'
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
  window.open(`/admin/product/edit/detail?prodId=${form.value.prodId}`, '_blank')
}

const handleTagEdit = () => {
  window.open(`/admin/product/edit/tags?prodId=${form.value.prodId}`, '_blank')
}

const handleDeliveryEdit = () => {
  window.open(`/admin/product/edit/delivery?prodId=${form.value.prodId}`, '_blank')
}

const handlePromoImages = () => {
  window.open(`/admin/product/edit/image?prodId=${form.value.prodId}`, '_blank')
}

const handlePresellEdit = () => {
  window.open(`/admin/product/edit/presell?prodId=${form.value.prodId}`, '_blank')
}

const handleViewSkuTag = () => {
  window.open(`/admin/product/edit/sku?prodId=${form.value.prodId}`, '_blank')
}

const handleViewSkus = () => {
  window.open(`/admin/product/sku/list?prodId=${form.value.prodId}`, '_blank')
}

const goToComments = () => {
  window.open(`/admin/product/comments/${form.value.prodId}`, '_blank')
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

// 处理分类编辑
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
      message: '修改商品状态失败'
    })
  }
}

// 添加基本信息编辑方法
const handleBasicEdit = () => {
  window.open(`/admin/product/edit/basic?prodId=${form.value.prodId}`, '_blank')
}

// 修改 colors 对象的类型定义
function getTypeColor(type) {
  const colors = {
    1: 'primary',   // 普通商品
    2: 'purple',    // 预售商品
    3: 'orange',    // 团购商品
    4: 'red'        // 秒杀商品
  }
  return colors[type] || 'grey'
}

// 修改 labels 对象的类型定义
function getTypeLabel(type) {
  const labels = {
    1: '普通商品',
    2: '预售商品',
    3: '团购商品',
    4: '秒杀商品'
  }
  return labels[type] || '未知类型'
}

// 修改 colors 对象的类型定义
function getQualityColor(quality) {
  const colors = {
    'S': 'purple',
    'A': 'primary',
    'B': 'positive',
    'C': 'warning',
    'D': 'negative'
  }
  return colors[quality] || 'grey'
}

// 修改图片上传相关的代码
const tempImageUrl = ref('')

// 处理图片上传成功
const handleImageUploadSuccess = (imageUrl) => {
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
const handleImageUploadError = (error) => {
  console.error('图片上传失败:', error)
}

// 在组件挂载时加载数据
onMounted(async () => {
  await loadCategories()
  await loadProductData()
  await searchBrands()
})

function getCategoryName(categoryId) {
  const category = categoryOptions.value.find(c => c.value === categoryId)
  return category ? category.label : '未分类'
}

// 添加品质标签映射函数
function getQualityLabel(quality) {
  const option = qualityOptions.find(opt => opt.value === quality)
  return option ? option.label : '未设置'
}

function getImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${IMAGE_BASE_URL}${url}`
}

// 加载品牌列表
async function searchBrands() {
  try {
    const params = {
      page: 1,
      limit: 100,
      brandName: brandSearch.value
    }
    const response = await api.get('/sys/brand/page', { params })
    if (response.data.code === 200) {
      brandList.value = Array.isArray(response.data.data) ? response.data.data : [response.data.data]
      console.log('��牌列表:', brandList.value)
    }
  } catch (error) {
    console.error('加载品牌列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载品牌列表失败'
    })
  }
}

// 获取品牌名称
function getBrandName(brandId) {
  const brand = brandList.value.find(b => b.brandId === brandId)
  return brand ? brand.brandName : '未设置'
}

// 选择品牌
function selectBrand(brand) {
  selectedBrandId.value = brand.brandId
}

// 确认品牌选择
async function confirmBrandSelection() {
  if (!selectedBrandId.value) {
    showBrandDialog.value = false
    return
  }

  try {
    const response = await api.put(`/sys/prod/update/brand/${form.value.prodId}/${selectedBrandId.value}`)
    if (response.data.code === 200) {
      form.value.brandId = selectedBrandId.value
      showBrandDialog.value = false
      $q.notify({
        type: 'positive',
        message: '商品品牌更新成功'
      })
    }
  } catch (error) {
    console.error('更新商品品牌失败:', error)
    $q.notify({
      type: 'negative',
      message: '更新商品品牌失败'
    })
  }
}

// 打开新增品牌对话框
function openAddBrandDialog() {
  Object.assign(newBrand, {
    brandName: '',
    brandPic: '',
    firstChar: '',
    seq: 1,
    brief: '',
    content: ''
  })
  showAddBrandDialog.value = true
}

// 保存新品牌
async function saveBrand() {
  try {
    const response = await api.post('/sys/brand/save', newBrand)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '添加品牌成功'
      })
      showAddBrandDialog.value = false
      await searchBrands() // 刷新品牌列表
    }
  } catch (error) {
    console.error('保存品牌失败:', error)
    $q.notify({
      type: 'negative',
      message: '保存品牌失败'
    })
  }
}

const normalizer = (node) => ({
  id: node.value,
  label: node.label,
  children: node.children
})

// 参数设置相关
const showParamsDialog = ref(false)
const paramsList = ref([])
const selectedParam = ref(null)
const selectedParamValue = ref(null)
const productParams = ref([])
const filteredParams = ref([])
const filteredParamValues = ref([])
const paramInputValue = ref('')
const paramValueInputValue = ref('')

// 修改参数过滤方法
function filterParams(val, update) {
  if (val === '') {
    update(() => {
      filteredParams.value = paramsList.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredParams.value = paramsList.value.filter(
      v => v.paramKey.toLowerCase().indexOf(needle) > -1
    )
  })
}

// 添加创建新参数方法
async function createParam(val, done) {
  if (val.length === 0) {
    done()
    return
  }

  try {
    const response = await api.post('/sys/param/save', {
      paramKey: val
    })

    if (response.data.code === 200) {
      await loadParamsList()
      const newParam = paramsList.value.find(p => p.paramKey === val)
      if (newParam) {
        selectedParam.value = newParam
      }
      $q.notify({
        type: 'positive',
        message: '新参数添加成功'
      })
    }
  } catch (error) {
    console.error('添加新参数失败:', error)
    $q.notify({
      type: 'negative',
      message: '添加新参数失败'
    })
  }
  done()
}

// 修改参数值过滤方法
function filterParamValues(val, update) {
  if (!selectedParam.value) {
    update(() => {
      filteredParamValues.value = []
    })
    return
  }

  if (val === '') {
    update(() => {
      filteredParamValues.value = getParamValues(selectedParam.value)
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredParamValues.value = getParamValues(selectedParam.value).filter(
      v => v.toLowerCase().indexOf(needle) > -1
    )
  })
}

// 添加创建新参数值方法
async function createParamValue(val, done) {
  if (val.length === 0 || !selectedParam.value) {
    done()
    return
  }

  try {
    const response = await api.post('/sys/param/value/save', {
      paramId: selectedParam.value.id,
      paramValue: val
    })

    if (response.data.code === 200) {
      await loadParamsList()
      selectedParamValue.value = val
      $q.notify({
        type: 'positive',
        message: '新参数值添加成功'
      })
    }
  } catch (error) {
    console.error('添加新参数值失败:', error)
    $q.notify({
      type: 'negative',
      message: '添加新参数值失败'
    })
  }
  done()
}

// 加载参数列表
async function loadParamsList() {
  try {
    const response = await api.get('/sys/param/page', { params: { page: 1, limit: 100 } })
    if (response.data.code === 200) {
      paramsList.value = response.data.data
    }
  } catch (error) {
    console.error('加载参数列表失败:', error)
  }
}

// 获取参数值选项
function getParamValues(param) {
  if (!param) return []
  return param.values?.map(v => v.paramValue) || []
}

// 添加商品参数
function addProductParam() {
  if (!selectedParam.value || !selectedParamValue.value) return
  
  productParams.value.push({
    paramKey: selectedParam.value.paramKey,
    paramValue: selectedParamValue.value
  })
  
  selectedParam.value = null
  selectedParamValue.value = null
}

// 移除商品参数
function removeProductParam(index) {
  productParams.value.splice(index, 1)
}

// 保存商品参数
async function saveProductParams() {
  try {
    const response = await api.post('/sys/prod/update/params', {
      prodId: form.value.prodId,
      params: productParams.value
    })
    
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: '商品参数更新成功'
      })
      showParamsDialog.value = false
      // 清空所有输入
      customParamKey.value = ''
      customParamValue.value = ''
      selectedParam.value = null
      selectedParamValue.value = null
    }
  } catch (error) {
    console.error('更新商品参数失败:', error)
    $q.notify({
      type: 'negative',
      message: '更新商品参数失败'
    })
  }
}

// 在组件挂载时加载参数列表
onMounted(async () => {
  await loadParamsList()
})

// 自定义参数相关
const customParamKey = ref('')
const customParamValue = ref('')

// 添加自定义参数
function addCustomParam() {
  if (!customParamKey.value || !customParamValue.value) return
  
  productParams.value.push({
    paramKey: customParamKey.value,
    paramValue: customParamValue.value
  })
  
  // 清空输入
  customParamKey.value = ''
  customParamValue.value = ''
  
  $q.notify({
    type: 'positive',
    message: '自定义参数已添加'
  })
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

      .source-link {
        color: #409eff;
        text-decoration: none;
        word-break: break-all;
        
        &:hover {
          color: #66b1ff;
          text-decoration: underline;
        }
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

// 对话框中的图上传器样式
:deep(.image-uploader) {
  .upload-trigger {
    margin: 0 auto;
  }
}

.category-select {
  width: 100%;

  :deep(.vue3-treeselect__control) {
    border-radius: 4px;
    border: 1px solid #dcdfe6;

    &:hover {
      border-color: #409eff;
    }
  }

  :deep(.vue3-treeselect__menu) {
    z-index: 7000;
  }
}
</style>
