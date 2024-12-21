<template>
  <div class="brand-management q-pa-md">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">品牌管理</div>
        <q-space />
        <q-btn color="primary" icon="add" label="添加品牌" @click="openDialog()" />
      </q-card-section>

      <q-card-section>
        <!-- 搜索栏 -->
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-12 col-sm-3">
            <q-input
              v-model="searchForm.brandName"
              label="品牌名称"
              dense
              outlined
              clearable
              @keyup.enter="loadBrands"
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="searchForm.status"
              :options="statusOptions"
              label="状态"
              dense
              outlined
              clearable
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn color="primary" icon="search" label="搜索" @click="loadBrands" />
            <q-btn flat color="grey" class="q-ml-sm" icon="refresh" label="重置" @click="resetSearch" />
          </div>
        </div>

        <!-- 品牌列表 -->
        <q-table
          :rows="brands"
          :columns="columns"
          row-key="brandId"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- 自定义列 -->
          <template v-slot:body-cell-brandPic="props">
            <q-td :props="props">
              <q-img
                :src="getImageUrl(props.row.brandPic)"
                style="width: 50px; height: 50px"
                fit="contain"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center text-grey">无图片</div>
                </template>
              </q-img>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.status === 1 ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
              >
                {{ props.row.status === 1 ? '正常' : '下线' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn-group flat>
                <q-btn flat color="primary" icon="edit" @click="openDialog(props.row)">
                  <q-tooltip>编辑</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  :color="props.row.status === 1 ? 'negative' : 'positive'"
                  :icon="props.row.status === 1 ? 'visibility_off' : 'visibility'"
                  @click="toggleStatus(props.row)"
                >
                  <q-tooltip>{{ props.row.status === 1 ? '下线' : '上线' }}</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 品牌编辑对话框 -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editingBrand.brandId ? '编辑品牌' : '添加品牌' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveBrand" class="q-gutter-md">
            <q-input
              v-model="editingBrand.brandName"
              label="品牌名称"
              :rules="[val => !!val || '请输入品牌名称']"
              outlined
            />

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="editingBrand.firstChar"
                  label="品牌首字母"
                  maxlength="1"
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="editingBrand.seq"
                  type="number"
                  label="排序"
                  outlined
                />
              </div>
            </div>

            <image-uploader
              v-model="editingBrand.brandPic"
              label="品牌图片"
              hint="建议尺寸: 200x200像素"
            />

            <q-input
              v-model="editingBrand.brief"
              label="简要描述"
              type="textarea"
              outlined
            />

            <q-editor
              v-model="editingBrand.content"
              label="详细内容"
              min-height="200px"
            />

            <div class="row justify-end q-mt-md">
              <q-btn label="取消" flat v-close-popup />
              <q-btn label="保存" type="submit" color="primary" class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import ImageUploader from '~/components/ImageUploader.vue'
import { api } from '~/utils/axios';
// import { useRuntimeConfig } from '#app'

const $q = useQuasar()
// const config = useRuntimeConfig()
// const IMAGE_BASE_URL = config.public.imageBaseUrl

// 添加图片基础URL
const IMAGE_BASE_URL = 'https://image.aiavr.uk/xinshijie'

// 表格列定义
const columns = [
  { name: 'brandId', label: 'ID', field: 'brandId', align: 'left' },
  { name: 'brandPic', label: '品牌图片', field: 'brandPic', align: 'center' },
  { name: 'brandName', label: '品牌名称', field: 'brandName', align: 'left' },
  { name: 'firstChar', label: '首字母', field: 'firstChar', align: 'center' },
  { name: 'brief', label: '简要描述', field: 'brief', align: 'left' },
  { name: 'seq', label: '排序', field: 'seq', align: 'center' },
  { name: 'status', label: '状态', field: 'status', align: 'center' },
  { name: 'recTime', label: '创建时间', field: 'recTime', align: 'center' },
  { name: 'actions', label: '操作', align: 'center' }
]

// 状态选项
const statusOptions = [
  { label: '正常', value: 1 },
  { label: '下线', value: 0 }
]

// 响应式数据
const loading = ref(false)
const brands = ref([])
const showDialog = ref(false)
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 搜索表单
const searchForm = reactive({
  brandName: '',
  status: null
})

// 编辑的品牌数据
const editingBrand = reactive({
  brandId: '',
  brandName: '',
  brandPic: '',
  firstChar: '',
  seq: 1,
  status: 1,
  brief: '',
  content: ''
})

// 加载品牌列表
async function loadBrands(props?: any) {
  loading.value = true
  try {
    const params = {
      page: props?.pagination?.page || pagination.value.page,
      limit: props?.pagination?.rowsPerPage || pagination.value.rowsPerPage,
      ...searchForm
    }

    const response = await api.get('/sys/brand/page', { params })
    console.log('Brand API response:', response.data) // 添加调试日志
    
    if (response.data.code === 200) {
      // 确保数据是数组
      const brandData = Array.isArray(response.data.data) ? response.data.data : [response.data.data]
      brands.value = brandData
      pagination.value.rowsNumber = brandData.length
      pagination.value.page = params.page
      pagination.value.rowsPerPage = params.limit
    }
  } catch (error) {
    console.error('加载品牌列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载品牌列表失败'
    })
  } finally {
    loading.value = false
  }
}

// 表格分页请求
function onRequest(props: any) {
  loadBrands(props)
}

// 重置搜索
function resetSearch() {
  searchForm.brandName = ''
  searchForm.status = null
  loadBrands()
}

// 打开编辑对话框
function openDialog(brand?: any) {
  if (brand) {
    Object.assign(editingBrand, brand)
  } else {
    Object.assign(editingBrand, {
      brandId: '',
      brandName: '',
      brandPic: '',
      firstChar: '',
      seq: 1,
      status: 1,
      brief: '',
      content: ''
    })
  }
  showDialog.value = true
}

// 保存品牌
async function saveBrand() {
  try {
    const url = editingBrand.brandId
      ? `/sys/brand/update`
      : `/sys/brand/save`

    const response = await api[editingBrand.brandId ? 'put' : 'post'](url, editingBrand)

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: `${editingBrand.brandId ? '更新' : '添加'}品牌成功`
      })
      showDialog.value = false
      loadBrands()
    }
  } catch (error) {
    console.error('保存品牌失败:', error)
    $q.notify({
      type: 'negative',
      message: '保存品牌失败'
    })
  }
}

// 切换品牌状态
async function toggleStatus(brand: any) {
  try {
    const newStatus = brand.status === 1 ? 0 : 1
    const response = await api.put(`/sys/brand/status/${brand.brandId}/${newStatus}`)

    if (response.data.code === 200) {
      brand.status = newStatus
      $q.notify({
        type: 'positive',
        message: `品牌已${newStatus === 1 ? '上线' : '下线'}`
      })
    }
  } catch (error) {
    console.error('更新品牌状态失败:', error)
    $q.notify({
      type: 'negative',
      message: '更新品牌状态失败'
    })
  }
}

// 获取图片URL
function getImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return IMAGE_BASE_URL + url
}

// 初始加载
onMounted(() => {
  loadBrands()
})
</script>

<style lang="scss" scoped>
.brand-management {
  .q-table {
    background: white;
  }
}
</style>
