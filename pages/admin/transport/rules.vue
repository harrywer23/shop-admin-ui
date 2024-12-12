<template>
  <div class="transport-rules">
    <div class="page-header">
      <h1 class="text-h5">运费规则管理</h1>
      <q-btn
        color="primary"
        icon="add"
        label="新增规则"
        @click="showRuleDialog('add')"
      />
    </div>

    <!-- 运费规则列表 -->
    <q-table
      :rows="rules"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- 区域列 -->
      <template v-slot:body-cell-area="props">
        <q-td :props="props">
          {{ formatArea(props.row) }}
        </q-td>
      </template>

      <!-- 计费信息列 -->
      <template v-slot:body-cell-fee="props">
        <q-td :props="props">
          首{{ props.row.firstUnit }}{{ getUnitLabel() }}：¥{{ props.row.firstFee }}
          <br v-if="props.row.additionalUnit">
          <template v-if="props.row.additionalUnit">
            续{{ props.row.additionalUnit }}{{ getUnitLabel() }}：¥{{ props.row.additionalFee }}
          </template>
        </q-td>
      </template>

      <!-- 免运费条件列 -->
      <template v-slot:body-cell-freeCondition="props">
        <q-td :props="props">
          <template v-if="props.row.freeType">
            {{ getFreeTypeLabel(props.row.freeType) }}：
            {{ props.row.freeCondition }}{{ getFreeUnitLabel(props.row.freeType) }}
          </template>
          <template v-else>
            无
          </template>
        </q-td>
      </template>

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
              @click="showRuleDialog('edit', props.row)"
            >
              <q-tooltip>编辑</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="warning"
              icon="block"
              @click="showExcludeDialog(props.row)"
            >
              <q-tooltip>排除地区</q-tooltip>
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

    <!-- 运费规则编辑对话框 -->
    <q-dialog v-model="ruleDialog.show" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ ruleDialog.mode === 'add' ? '新增运费规则' : '编辑运费规则' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleRuleSubmit" class="q-gutter-md">
            <!-- 规则说明 -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">规则说明：</div>
                <div class="text-caption text-grey-8">
                  <ul class="q-mb-none">
                    <li>不选择国家时,表示规则适用于全国</li>
                    <li>选择国家后可以进一步选择省份和城市,精确设置区域运费</li>
                    <li>首{{ getUnitLabel() }}和首费用为必填项,续{{ getUnitLabel() }}和续费用可选
                      <div class="text-grey-6 q-pl-sm">
                        例：首2kg收费10元，续重1kg收费5元，则3kg商品运费为15元
                      </div>
                    </li>
                    <li>订单金额限制: 设置此规则适用的订单金额范围
                      <div class="text-grey-6 q-pl-sm">
                        例1：最低订单金额设为100，最高金额不填，表示订单满100元才使用此规则<br>
                        例2：最低订单金额设为100，最高金额设为200，表示订单金额在100-200元之间使用此规则
                      </div>
                    </li>
                    <li>计量限制: 设置此规则适用的重量/件数范围
                      <div class="text-grey-6 q-pl-sm">
                        例：最小{{ getUnitLabel() }}设为1，最大{{ getUnitLabel() }}设为10，表示商品{{ getUnitLabel() }}在1-10之间时使用此规则
                      </div>
                    </li>
                    <li>免运费条件: 可设置满额/满件/满重包邮
                      <div class="text-grey-6 q-pl-sm">
                        例1：选择"满额包邮"并设置条件值为200，表示订单满200元免运费<br>
                        例2：选择"满件包邮"并设置条件值为5，表示购买5件或以上免运费
                      </div>
                    </li>
                    <li>同一区域可以设置多条规则,系统会自动匹配最优惠的规则
                      <div class="text-grey-6 q-pl-sm">
                        例：同一地区设置了普通运费规则和满减规则，系统会自动计算哪个规则更优惠
                      </div>
                    </li>
                  </ul>
                </div>
              </q-card-section>
            </q-card>

            <!-- 区域选择 -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="ruleDialog.data.countryId"
                  :options="countryOptions"
                  label="国家(不选择表示全国)"
                  option-label="name"
                  option-value="id"
                  clearable
                  outlined
                  dense
                  @update:model-value="onCountryChange"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="ruleDialog.data.provinceId"
                  :options="provinceOptions"
                  label="省份"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  @update:model-value="onProvinceChange"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="ruleDialog.data.cityId"
                  :options="cityOptions"
                  label="城市"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- 首重/首件费用 -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="ruleDialog.data.firstUnit"
                  type="number"
                  :label="`首${getUnitLabel()}`"
                  :rules="[
                    val => val >= 0 || `首${getUnitLabel()}不能小于0`
                  ]"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="ruleDialog.data.firstFee"
                  type="number"
                  label="首费用(元)"
                  :rules="[
                    val => val >= 0 || '首费用不能小于0'
                  ]"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- 续重/续件费用 -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="ruleDialog.data.additionalUnit"
                  type="number"
                  :label="`续${getUnitLabel()}`"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="ruleDialog.data.additionalFee"
                  type="number"
                  label="续费用(元)"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- 订单金额限制 -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="ruleDialog.data.minOrderAmount"
                  type="number"
                  label="最低订单金额"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="ruleDialog.data.maxOrderAmount"
                  type="number"
                  label="最高订单金额"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- 计量限制 -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="ruleDialog.data.minUnit"
                  type="number"
                  :label="`最小${getUnitLabel()}`"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="ruleDialog.data.maxUnit"
                  type="number"
                  :label="`最大${getUnitLabel()}`"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- 免运费设置 -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="ruleDialog.data.freeType"
                  :options="freeTypeOptions"
                  label="免运费类型"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-if="ruleDialog.data.freeType"
                  v-model.number="ruleDialog.data.freeCondition"
                  type="number"
                  :label="`免运费条件值(${getFreeUnitLabel(ruleDialog.data.freeType)})`"
                  :rules="[
                    val => val > 0 || '条件值必须大于0'
                  ]"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- 状态 -->
            <q-toggle
              v-model="ruleDialog.data.status"
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
                :label="ruleDialog.mode === 'add' ? '创建' : '保存'"
                color="primary"
                type="submit"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 排除地区对话框 -->
    <q-dialog v-model="excludeDialog.show">
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">排除地区</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- 地区选择 -->
            <div class="col-12">
              <q-select
                v-model="excludeDialog.selectedArea"
                :options="excludeAreaOptions"
                label="选择地区"
                option-label="name"
                option-value="id"
                outlined
                dense
              />
            </div>

            <!-- 已排除地区列表 -->
            <div class="col-12">
              <q-list bordered separator>
                <q-item
                  v-for="area in excludeDialog.excludedAreas"
                  :key="area.id"
                >
                  <q-item-section>
                    {{ area.name }}
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="removeExcludedArea(area)"
                    >
                      <q-tooltip>删除</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="取消"
            color="primary"
            v-close-popup
          />
          <q-btn
            label="添加"
            color="primary"
            @click="addExcludedArea"
            :disable="!excludeDialog.selectedArea"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { api } from '~/utils/axios'

const $q = useQuasar()
const route = useRoute()

// 获取运输方式ID
const transportId = computed(() => route.query.id)

// 状态变量
const rules = ref([])
const loading = ref(false)
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 区域选项
const countryOptions = ref([])
const provinceOptions = ref([])
const cityOptions = ref([])

// 免运费类型选项
const freeTypeOptions = [
  { label: '无', value: 0 },
  { label: '满额包邮', value: 1 },
  { label: '满件包邮', value: 2 },
  { label: '满重包邮', value: 3 }
]

// 运费规则对话框
const ruleDialog = ref({
  show: false,
  mode: 'add',
  data: {
    id: null,
    transportId: null,
    countryId: null,
    provinceId: null,
    cityId: null,
    firstUnit: 1,
    firstFee: 0,
    additionalUnit: null,
    additionalFee: null,
    minOrderAmount: 0,
    maxOrderAmount: null,
    minUnit: null,
    maxUnit: null,
    status: true,
    freeType: 0,
    freeCondition: null
  }
})

// 排除地区对话框
const excludeDialog = ref({
  show: false,
  currentRule: null,
  selectedArea: null,
  excludedAreas: []
})

// 表格列定义
const columns = ref([
  {
    name: 'area',
    label: '适用区域',
    field: 'area',
    align: 'left'
  },
  {
    name: 'fee',
    label: '计费信息',
    field: 'fee',
    align: 'left'
  },
  {
    name: 'freeCondition',
    label: '免运费条件',
    field: 'freeCondition',
    align: 'left'
  },
  {
    name: 'status',
    label: '状态',
    field: 'status',
    align: 'center'
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center'
  }
])

// 加载运费规则列表
const loadRules = async () => {
  loading.value = true
  try {
    const response = await api.get(`/admin/transport/rules/list/${transportId.value}`)
    const { code, data, total } = response.data

    if (code === 200) {
      rules.value = data
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载运费规则失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载运费规则失败'
    })
  } finally {
    loading.value = false
  }
}

// 加载区域数据
const loadAreas = async (parentId = 0, level = 1) => {
  try {
    const response = await api.get('/admin/areas', {
      params: { parentId, level }
    })
    const { code, data } = response.data
    if (code === 200) {
      return data
    }
    return []
  } catch (error) {
    console.error('加载区域数据失败:', error)
    return []
  }
}

// 处理区域选择变化
const onCountryChange = async (country: any) => {
  if (!country) return
  ruleDialog.value.data.provinceId = null
  ruleDialog.value.data.cityId = null
  provinceOptions.value = await loadAreas(country.id, 2)
}

const onProvinceChange = async (province: any) => {
  if (!province) return
  ruleDialog.value.data.cityId = null
  cityOptions.value = await loadAreas(province.id, 3)
}

// 格式化区域显示
const formatArea = (rule: any) => {
  const parts = []
  if (rule.country) parts.push(rule.country)
  if (rule.province) parts.push(rule.province)
  if (rule.city) parts.push(rule.city)
  return parts.length > 0 ? parts.join(' / ') : '全国'
}

// 获取单位标签
const getUnitLabel = () => {
  const transport = rules.value[0]?.transport
  if (!transport) return ''
  switch (transport.calcType) {
    case 1: return 'kg'
    case 2: return '件'
    case 3: return 'm³'
    default: return 'kg'
  }
}

// 获取免运费类型标签
const getFreeTypeLabel = (type: number) => {
  const option = freeTypeOptions.find(opt => opt.value === type)
  return option ? option.label : '无'
}

// 获取免运费单位标签
const getFreeUnitLabel = (type: number) => {
  switch (type) {
    case 1: return '���'
    case 2: return '件'
    case 3: return 'kg'
    default: return ''
  }
}

// 显示运费规则对话框
const showRuleDialog = (mode: 'add' | 'edit', rule?: any) => {
  ruleDialog.value.mode = mode
  if (mode === 'edit' && rule) {
    // 编辑模式,复制现有数据
    ruleDialog.value.data = { ...rule }
    // 加载省市数据
    if(rule.countryId) {
      onCountryChange({ id: rule.countryId })
    }
    if(rule.provinceId) {
      onProvinceChange({ id: rule.provinceId })
    }
  } else {
    // 新增模式,重置表单
    ruleDialog.value.data = {
      id: null,
      transportId: transportId.value,
      countryId: null,
      provinceId: null,
      cityId: null,
      firstUnit: 1,
      firstFee: 0,
      additionalUnit: null,
      additionalFee: null,
      minOrderAmount: 0,
      maxOrderAmount: null,
      minUnit: null,
      maxUnit: null,
      status: 1,
      freeType: 0,
      freeCondition: null
    }
  }
  ruleDialog.value.show = true
}

// 提交运费规则
const handleRuleSubmit = async () => {
  try {
    // 表单验证
    if (typeof ruleDialog.value.data.firstUnit !== 'number' || ruleDialog.value.data.firstUnit < 0) {
      throw new Error('首重/首件不能小于0')
    }
    if (typeof ruleDialog.value.data.firstFee !== 'number' || ruleDialog.value.data.firstFee < 0) {
      throw new Error('首费用不能小于0')
    }
    
    // 验证续重/续件费用
    if (ruleDialog.value.data.additionalUnit !== null && 
        (typeof ruleDialog.value.data.additionalUnit !== 'number' || ruleDialog.value.data.additionalUnit <= 0)) {
      throw new Error('续重/续件必须大于0')
    }
    if (ruleDialog.value.data.additionalFee !== null && 
        (typeof ruleDialog.value.data.additionalFee !== 'number' || ruleDialog.value.data.additionalFee < 0)) {
      throw new Error('续费用不能小于0')
    }

    // 验证订单金额限制
    if (typeof ruleDialog.value.data.minOrderAmount !== 'number' || ruleDialog.value.data.minOrderAmount < 0) {
      throw new Error('最低订单金额不能小于0')
    }
    if (ruleDialog.value.data.maxOrderAmount !== null && 
        (typeof ruleDialog.value.data.maxOrderAmount !== 'number' || 
         ruleDialog.value.data.maxOrderAmount <= ruleDialog.value.data.minOrderAmount)) {
      throw new Error('最高订单金额必须大于最低订单金额')
    }

    // 验证计量限制
    if (ruleDialog.value.data.minUnit !== null && 
        (typeof ruleDialog.value.data.minUnit !== 'number' || ruleDialog.value.data.minUnit < 0)) {
      throw new Error(`最小${getUnitLabel()}不能小于0`)
    }
    if (ruleDialog.value.data.maxUnit !== null && ruleDialog.value.data.minUnit !== null && 
        (typeof ruleDialog.value.data.maxUnit !== 'number' || 
         ruleDialog.value.data.maxUnit <= ruleDialog.value.data.minUnit)) {
      throw new Error(`最大${getUnitLabel()}必须大于最小${getUnitLabel()}`)
    }

    // 验证免运费条件
    if (ruleDialog.value.data.freeType && 
        (typeof ruleDialog.value.data.freeCondition !== 'number' || ruleDialog.value.data.freeCondition <= 0)) {
      throw new Error('请设置正确的免运费条件值')
    }

    const url = ruleDialog.value.mode === 'add'
      ? '/admin/transport/rules/add'
      : '/admin/transport/rules/update'

    const response = await api.post(url, {
      ...ruleDialog.value.data,
      transportId: transportId.value
    })

    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: ruleDialog.value.mode === 'add' ? '创建成功' : '更新成功'
      })
      ruleDialog.value.show = false
      loadRules()
    } else {
      throw new Error(response.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存运费规则失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  }
}

// 切换状态
const toggleStatus = async (rule: any) => {
  try {
    const response = await api.post('/admin/transport/rule/status', {
      id: rule.id,
      status: !rule.status
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: rule.status ? '已禁用' : '已启用'
      })
      loadRules()
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
const confirmDelete = (rule: any) => {
  $q.dialog({
    title: '确认删除',
    message: '确定要删除该运费规则吗？此操作不可恢复。',
    cancel: {
      label: '取消',
      flat: true
    },
    ok: {
      label: '确认删除',
      color: 'negative'
    },
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/admin/transport/rules/delete/${rule.id}`)

      if (response.data.code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        // 重新加载列表
        loadRules()
      } else {
        throw new Error(response.data.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除运费规则失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 显示排除地区对话框
const showExcludeDialog = async (rule: any) => {
  excludeDialog.value.currentRule = rule
  excludeDialog.value.selectedArea = null

  try {
    // 加载已排除地区
    const response = await api.get(`/admin/transport/rule/excludes/${rule.id}`)
    const { code, data } = response.data
    if (code === 200) {
      excludeDialog.value.excludedAreas = data
    }

    // 加载可选地区
    excludeDialog.value.show = true
  } catch (error) {
    console.error('加载排除地区失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载排除地区失败'
    })
  }
}

// 添加排除地区
const addExcludedArea = async () => {
  if (!excludeDialog.value.selectedArea) return

  try {
    const response = await api.post('/admin/transport/rule/exclude/add', {
      ruleId: excludeDialog.value.currentRule.id,
      areaId: excludeDialog.value.selectedArea.id
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '添加成功'
      })
      // 重新加载排除地区
      const excludesResponse = await api.get(`/admin/transport/rule/excludes/${excludeDialog.value.currentRule.id}`)
      if (excludesResponse.data.code === 200) {
        excludeDialog.value.excludedAreas = excludesResponse.data.data
      }
    } else {
      throw new Error(msg || '添加失败')
    }
  } catch (error) {
    console.error('添加排除地区失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '添加失败'
    })
  }
}

// 移除排除地区
const removeExcludedArea = async (area: any) => {
  try {
    const response = await api.delete('/admin/transport/rule/exclude/delete', {
      params: {
        ruleId: excludeDialog.value.currentRule.id,
        areaId: area.id
      }
    })

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '移除成功'
      })
      // 从列表中移除
      excludeDialog.value.excludedAreas = excludeDialog.value.excludedAreas
        .filter((a: any) => a.id !== area.id)
    } else {
      throw new Error(msg || '移除失败')
    }
  } catch (error) {
    console.error('移除排除地区失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '移除失败'
    })
  }
}

// 添加分页请求处理函数
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  await loadRules()
}

// 初始化
onMounted(async () => {
  countryOptions.value = await loadAreas()
  loadRules()
})
</script>

<style lang="scss" scoped>
.transport-rules {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  // 添加规则说明样式
  ul {
    padding-left: 1.2em;
    
    li {
      margin-bottom: 4px;
      line-height: 1.5;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
