<template>
  <div class="address-management">
    <div class="page-header">
      <h1 class="text-h5">地址管理</h1>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- 国家筛选 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.countryId"
                :options="countryOptions"
                label="国家"
                option-label="name"
                option-value="id"
                dense
                outlined
                clearable
                @update:model-value="onCountryChange"
              />
            </div>

            <!-- 省份筛选 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.provinceId"
                :options="provinceOptions"
                label="省份"
                option-label="name"
                option-value="id"
                dense
                outlined
                clearable
                @update:model-value="onProvinceChange"
              />
            </div>

            <!-- 城市筛选 -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.cityId"
                :options="cityOptions"
                label="城市"
                option-label="name"
                option-value="id"
                dense
                outlined
                clearable
              />
            </div>

            <!-- 搜索按钮 -->
            <div class="col-12 col-sm-3">
              <q-btn
                color="primary"
                icon="search"
                label="搜索"
                @click="loadAddresses"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 地址列表 -->
    <q-table
      :rows="addresses"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- 状态列 -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.status ? 'positive' : 'negative'"
            text-color="white"
            dense
          >
            {{ props.row.status ? '启用' : '禁用' }}
          </q-chip>
        </q-td>
      </template>

      <!-- 操作列 -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              @click="showAddressDialog('edit', props.row)"
            >
              <q-tooltip>编辑</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              :color="props.row.status ? 'negative' : 'positive'"
              :icon="props.row.status ? 'visibility_off' : 'visibility'"
              @click="toggleStatus(props.row)"
            >
              <q-tooltip>{{ props.row.status ? '禁用' : '启用' }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>删除</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- 地址编辑对话框 -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ dialogMode === 'add' ? '新增地址' : '编辑地址' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <!-- 国家选择 -->
            <q-select
              v-model="formData.countryId"
              :options="countryOptions"
              label="国家"
              option-label="name"
              option-value="id"
              :rules="[val => !!val || '请选择国家']"
              outlined
              dense
              @update:model-value="onFormCountryChange"
            />

            <!-- 省份选择 -->
            <q-select
              v-model="formData.provinceId"
              :options="formProvinceOptions"
              label="省份"
              option-label="name"
              option-value="id"
              outlined
              dense
              @update:model-value="onFormProvinceChange"
            />

            <!-- 城市选择 -->
            <q-select
              v-model="formData.cityId"
              :options="formCityOptions"
              label="城市"
              option-label="name"
              option-value="id"
              outlined
              dense
            />

            <!-- 邮政编码 -->
            <q-input
              v-model="formData.postCode"
              label="邮政编码"
              outlined
              dense
            />

            <!-- 详细地址 -->
            <q-input
              v-model="formData.addr"
              type="textarea"
              label="详细地址"
              :rules="[val => !!val || '请输入详细地址']"
              outlined
              autogrow
            />

            <!-- 状态 -->
            <q-toggle
              v-model="formData.status"
              :false-value="0"
              :true-value="1"
              label="启用"
            />

            <!-- 按钮 -->
            <div class="row justify-end q-gutter-sm">
              <q-btn
                flat
                label="取消"
                color="primary"
                v-close-popup
              />
              <q-btn
                :label="dialogMode === 'add' ? '创建' : '保存'"
                color="primary"
                type="submit"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'

const $q = useQuasar()

// 地址接口定义
interface Area {
  id: number
  name: string
  code: string
  level: number
  parentId: number
}

interface Address {
  id: number | null
  countryId: number | null
  country: string | null
  provinceId: number | null
  province: string | null
  cityId: number | null
  city: string | null
  postCode: string
  addr: string
  status: boolean
}

// 表格列定义
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'country', label: '国家', field: 'country', sortable: true },
  { name: 'province', label: '省份', field: 'province', sortable: true },
  { name: 'city', label: '城市', field: 'city', sortable: true },
  { name: 'postCode', label: '邮政编码', field: 'postCode' },
  { name: 'addr', label: '详细地址', field: 'addr' },
  { name: 'status', label: '状态', field: 'status' },
  { name: 'actions', label: '操作', field: 'actions' }
]

// 状态变量
const addresses = ref<Address[]>([])
const loading = ref(false)
const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formData = ref<Address>({
  id: null,
  countryId: null,
  country: null,
  provinceId: null,
  province: null,
  cityId: null,
  city: null,
  postCode: '',
  addr: '',
  status: true
})

// 筛选条件
const filters = ref({
  countryId: null as number | null,
  provinceId: null as number | null,
  cityId: null as number | null
})

// 分页设置
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 地区选项
const countryOptions = ref<Area[]>([])
const provinceOptions = ref<Area[]>([])
const cityOptions = ref<Area[]>([])
const formProvinceOptions = ref<Area[]>([])
const formCityOptions = ref<Area[]>([])

// 加载地址列表
const loadAddresses = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sort: pagination.value.sortBy,
      order: pagination.value.descending ? 'desc' : 'asc',
      ...filters.value
    }

    const response = await api.get('/admin/userAddr/list', { params })
    const { code, data, total } = response.data

    if (code === 200) {
      addresses.value = data
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载地址列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载地址列表失败'
    })
  } finally {
    loading.value = false
  }
}

// 处理分页和排序
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  await loadAddresses()
}

// 加载国家列表
const loadCountries = async () => {
  try {
    const response = await api.get('/admin/areas', { params: { level: 1 } })
    const { code, data } = response.data
    if (code === 200) {
      countryOptions.value = data
    }
  } catch (error) {
    console.error('加载国家列表失败:', error)
  }
}

// 加载省份列表
const loadProvinces = async (countryId: number) => {
  try {
    const response = await api.get('/admin/areas', {
      params: {
        level: 2,
        parentId: countryId
      }
    })
    const { code, data } = response.data
    if (code === 200) {
      provinceOptions.value = data
    }
  } catch (error) {
    console.error('加载省份列表失败:', error)
  }
}

// 加载城市列表
const loadCities = async (provinceId: number) => {
  try {
    const response = await api.get('/admin/areas', {
      params: {
        level: 3,
        parentId: provinceId
      }
    })
    const { code, data } = response.data
    if (code === 200) {
      cityOptions.value = data
    }
  } catch (error) {
    console.error('加载城市列表失败:', error)
  }
}

// 国家选择变更
const onCountryChange = async (countryId: number) => {
  filters.value.provinceId = null
  filters.value.cityId = null
  provinceOptions.value = []
  cityOptions.value = []
  if (countryId) {
    await loadProvinces(countryId)
  }
}

// 省份选择变更
const onProvinceChange = async (provinceId: number) => {
  filters.value.cityId = null
  cityOptions.value = []
  if (provinceId) {
    await loadCities(provinceId)
  }
}

// 表单国家选择变更
const onFormCountryChange = async (countryId: number) => {
  formData.value.provinceId = null
  formData.value.cityId = null
  formProvinceOptions.value = []
  formCityOptions.value = []
  if (countryId) {
    const response = await api.get('/admin/areas', {
      params: {
        level: 2,
        parentId: countryId
      }
    })
    const { code, data } = response.data
    if (code === 200) {
      formProvinceOptions.value = data
    }
  }
}

// 表单省份选择变更
const onFormProvinceChange = async (provinceId: number) => {
  formData.value.cityId = null
  formCityOptions.value = []
  if (provinceId) {
    const response = await api.get('/admin/areas', {
      params: {
        level: 3,
        parentId: provinceId
      }
    })
    const { code, data } = response.data
    if (code === 200) {
      formCityOptions.value = data
    }
  }
}

// 显示地址编辑对话框
const showAddressDialog = (mode: 'add' | 'edit', address?: Address) => {
  dialogMode.value = mode
  if (mode === 'edit' && address) {
    formData.value = { ...address }
    // 加载省份和城市选项
    onFormCountryChange(address.countryId!)
    onFormProvinceChange(address.provinceId!)
  } else {
    formData.value = {
      id: null,
      countryId: null,
      country: null,
      provinceId: null,
      province: null,
      cityId: null,
      city: null,
      postCode: '',
      addr: '',
      status: true
    }
  }
  showDialog.value = true
}

// 提交表单
const handleSubmit = async () => {
  try {
    const url = dialogMode.value === 'add' ? '/admin/userAddr/add' : '/admin/userAddr/update'

    // 获取地区名称
    const country = countryOptions.value.find(c => c.id === formData.value.countryId)
    const province = formProvinceOptions.value.find(p => p.id === formData.value.provinceId)
    const city = formCityOptions.value.find(c => c.id === formData.value.cityId)

    const submitData = {
      ...formData.value,
      country: country?.name,
      province: province?.name,
      city: city?.name
    }

    const response = await api.post(url, submitData)

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: dialogMode.value === 'add' ? '创建成功' : '更新成功'
      })
      showDialog.value = false
      loadAddresses()
    } else {
      throw new Error(msg || '保存失败')
    }
  } catch (error) {
    console.error('保存地址失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  }
}

// 切换状态
const toggleStatus = async (address: Address) => {
  try {
    const response = await api.post('/admin/userAddr/status', {
      id: address.id,
      status: !address.status
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: address.status ? '已禁用' : '已启用'
      })
      loadAddresses()
    } else {
      throw new Error(msg || '操作失败')
    }
  } catch (error) {
    console.error('切换状态失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '操作失败'
    })
  }
}

// 确认删除
const confirmDelete = (address: Address) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除该地址吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/userAddr/${address.id}`)

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadAddresses()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('��除地址失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 初始化
onMounted(async () => {
  await loadCountries()
  await loadAddresses()
})
</script>

<style lang="scss" scoped>
.address-management {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
  }

  .filter-section {
    margin-bottom: 20px;
  }
}
</style>
