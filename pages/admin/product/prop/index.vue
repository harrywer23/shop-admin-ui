<template>
  <div class="prop-management">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">商品属性管理</div>
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

    <!-- 属性列表 -->
    <q-table
      :rows="props"
      :columns="columns"
      row-key="propId"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- 属性值列 -->
      <template v-slot:body-cell-values="props">
        <q-td :props="props">
          <q-chip
            v-for="value in props.row.values"
            :key="value.valueId"
            :label="value.propValue"
            class="q-ma-xs"
          />
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
              @click="showPropDialog('edit', props.row)"
            >
              <q-tooltip>编辑</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="warning"
              icon="list"
              @click="showValueDialog(props.row)"
            >
              <q-tooltip>管理属性值</q-tooltip>
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

    <!-- 属性编辑对话框 -->
    <q-dialog v-model="propDialog.show" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ propDialog.mode === 'add' ? '新增属性' : '编辑属性' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handlePropSubmit" class="q-gutter-md">
            <!-- 属性名称国际化输入 -->
            <div class="translations-section">
              <div class="text-subtitle2 q-mb-sm">属性名称</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="propDialog.data.translationsI18n.zh"
                    label="中文名称"
                    :rules="[val => !!val || '请输入中文名称']"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="propDialog.data.translationsI18n.en"
                    label="English Name"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="propDialog.data.translationsI18n.zhTw"
                    label="繁體中文名稱"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="propDialog.data.translationsI18n.ja"
                    label="日本語名称"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="propDialog.data.translationsI18n.ko"
                    label="한국어 이름"
                    outlined
                    dense
                  />
                </div>
              </div>
            </div>

            <!-- 排序 -->
            <q-input
              v-model.number="propDialog.data.seq"
              type="number"
              label="排序"
              outlined
              dense
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="取消" color="primary" v-close-popup />
              <q-btn :label="propDialog.mode === 'add' ? '创建' : '保存'" color="primary" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 属性值管理对话框 -->
    <q-dialog v-model="valueDialog.show" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">属性值管理 - {{ valueDialog.currentProp?.propName }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <!-- 添加属性值表单 -->
          <q-form @submit="handleValueSubmit" class="q-mb-md">
            <div class="row q-col-gutter-md">
              <!-- 属性值国际化输入 -->
              <div class="col-12">
                <div class="translations-section">
                  <div class="text-subtitle2 q-mb-sm">属性值</div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="valueDialog.data.translationsI18n.zh"
                        label="中文值"
                        :rules="[val => !!val || '请输入中文值']"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="valueDialog.data.translationsI18n.en"
                        label="English Value"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="valueDialog.data.translationsI18n.zhTw"
                        label="繁體中文值"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="valueDialog.data.translationsI18n.ja"
                        label="日本語値"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="valueDialog.data.translationsI18n.ko"
                        label="한국어 값"
                        outlined
                        dense
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="row justify-end">
                  <q-btn color="primary" type="submit" label="添加" />
                </div>
              </div>
            </div>
          </q-form>

          <!-- 属性值列表 -->
          <q-list bordered separator>
            <q-item v-for="value in valueDialog.values" :key="value.valueId">
              <q-item-section>
                <q-item-label>{{ value.propValue }}</q-item-label>
                <q-item-label caption>
                  EN: {{ value.translationsI18n?.en || '-' }} |
                  繁中: {{ value.translationsI18n?.zhTw || '-' }} |
                  日: {{ value.translationsI18n?.ja || '-' }} |
                  韓: {{ value.translationsI18n?.ko || '-' }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  @click="confirmDeleteValue(value)"
                >
                  <q-tooltip>删除</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '~/utils/axios'
import {useRouter} from "#vue-router";

const $q = useQuasar()
const router = useRouter()

// 接口定义
interface Translations {
  zh: string
  en: string
  zhTw: string
  ja: string
  ko: string
}

interface PropValue {
  valueId: number | null
  propId: number
  propValue: string
  translations: string
  translationsI18n: Translations
}

interface Prop {
  propId: number | null
  propName: string
  seq: number
  translations: string
  translationsI18n: Translations
  values: PropValue[]
}

// 表格列定义
const columns = [
  { name: 'propId', label: 'ID', field: 'propId', sortable: true },
  { name: 'propName', label: '属性名称', field: 'propName', sortable: true },
  { name: 'values', label: '属性值', field: 'values' },
  { name: 'seq', label: '排序', field: 'seq', sortable: true },
  { name: 'actions', label: '操作', field: 'actions' }
]

// 状态变量
const props = ref<Prop[]>([])
const loading = ref(false)
const pagination = ref({
  sortBy: 'seq',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 属性对话框
const propDialog = ref({
  show: false,
  mode: 'add' as 'add' | 'edit',
  data: {
    propId: null as number | null,
    propName: '',
    seq: 0,
    translations: '{}',
    translationsI18n: {
      zh: '',
      en: '',
      zhTw: '',
      ja: '',
      ko: ''
    }
  }
})

// 属性值对话框
const valueDialog = ref({
  show: false,
  currentProp: null as Prop | null,
  values: [] as PropValue[],
  data: {
    valueId: null as number | null,
    propId: null as number | null,
    propValue: '',
    translations: '{}',
    translationsI18n: {
      zh: '',
      en: '',
      zhTw: '',
      ja: '',
      ko: ''
    }
  }
})

// 加载属性列表
const loadProps = async () => {
  loading.value = true
  try {
    const response = await api.get('/sys/prod/prop/list', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sort: pagination.value.sortBy,
        order: pagination.value.descending ? 'desc' : 'asc'
      }
    })
    const { code, data, total } = response.data

    if (code === 200) {
      props.value = data.map((prop: Prop) => ({
        ...prop,
        translationsI18n: prop.translations ? JSON.parse(prop.translations) : {},
        values: prop.values.map(value => ({
          ...value,
          translationsI18n: value.translations ? JSON.parse(value.translations) : {}
        }))
      }))
      pagination.value.rowsNumber = total
    }
  } catch (error) {
    console.error('加载属性列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载属性列表失败'
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
  await loadProps()
}

// 显示属性编辑对话框
const showPropDialog = (mode: 'add' | 'edit', prop?: Prop) => {
  propDialog.value.mode = mode
  if (mode === 'edit' && prop) {
    propDialog.value.data = {
      ...prop,
      translationsI18n: prop.translations ? JSON.parse(prop.translations) : {
        zh: prop.propName,
        en: '',
        zhTw: '',
        ja: '',
        ko: ''
      }
    }
  } else {
    propDialog.value.data = {
      propId: null,
      propName: '',
      seq: 0,
      translations: '{}',
      translationsI18n: {
        zh: '',
        en: '',
        zhTw: '',
        ja: '',
        ko: ''
      }
    }
  }
  propDialog.value.show = true
}

// 提交属性表单
const handlePropSubmit = async () => {
  try {
    const url = propDialog.value.mode === 'add' ? '/sys/prod/prop/add' : '/sys/prod/prop/update'

    const submitData = {
      ...propDialog.value.data,
      propName: propDialog.value.data.translationsI18n.zh,
      translations: JSON.stringify(propDialog.value.data.translationsI18n)
    }

    const response = await api.post(url, submitData)

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: propDialog.value.mode === 'add' ? '创建成功' : '更新成功'
      })
      propDialog.value.show = false
      loadProps()
    } else {
      throw new Error(msg || '保存失败')
    }
  } catch (error) {
    console.error('保存属性失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  }
}

// 显示属性值管理对话框
const showValueDialog = async (prop: Prop) => {
  valueDialog.value.currentProp = prop
  valueDialog.value.values = prop.values
  valueDialog.value.data = {
    valueId: null,
    propId: prop.propId,
    propValue: '',
    translations: '{}',
    translationsI18n: {
      zh: '',
      en: '',
      zhTw: '',
      ja: '',
      ko: ''
    }
  }
  valueDialog.value.show = true
}

// 提交属性值表单
const handleValueSubmit = async () => {
  try {
    const submitData = {
      ...valueDialog.value.data,
      propValue: valueDialog.value.data.translationsI18n.zh,
      translations: JSON.stringify(valueDialog.value.data.translationsI18n)
    }

    const response = await api.post('/sys/prod/prop/value/add', submitData)

    const { code, msg } = response.data
    if (code === 200) {
      $q.notify({
        type: 'positive',
        message: '添加成功'
      })
      // 重新加载属性值列表
      if (valueDialog.value.currentProp) {
        const propResponse = await api.get(`/sys/prod/prop/${valueDialog.value.currentProp.propId}`)
        if (propResponse.data.code === 200) {
          valueDialog.value.values = propResponse.data.data.values.map((value: PropValue) => ({
            ...value,
            translationsI18n: value.translations ? JSON.parse(value.translations) : {}
          }))
        }
      }
      // 清空表单
      valueDialog.value.data = {
        valueId: null,
        propId: valueDialog.value.currentProp?.propId || null,
        propValue: '',
        translations: '{}',
        translationsI18n: {
          zh: '',
          en: '',
          zhTw: '',
          ja: '',
          ko: ''
        }
      }
    } else {
      throw new Error(msg || '添加失败')
    }
  } catch (error) {
    console.error('添加属性值失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '添加失败'
    })
  }
}

// 确认删除属性
const confirmDelete = (prop: Prop) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除属性 "${prop.propName}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/sys/prod/prop/${prop.propId}`)

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        loadProps()
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除属性失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 确认删除属性值
const confirmDeleteValue = (value: PropValue) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除属性值 "${value.propValue}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/sys/prod/prop/value/${value.valueId}`)

      const { code, msg } = response.data
      if (code === 200) {
        $q.notify({
          type: 'positive',
          message: '删除成功'
        })
        // 从列表中移除
        valueDialog.value.values = valueDialog.value.values.filter(v => v.valueId !== value.valueId)
      } else {
        throw new Error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除属性值失败:', error)
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : '删除失败'
      })
    }
  })
}

// 初始化
onMounted(() => {
  loadProps()
})
</script>

<style lang="scss" scoped>
.prop-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .translations-section {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fafafa;

    .text-subtitle2 {
      color: #666;
      font-weight: 500;
    }
  }
}
</style>
