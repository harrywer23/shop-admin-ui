<template>
  <div class="category-list">
    <q-card class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="text-h6">{{ $t('分类管理') }}</div>
        <q-space />
        <q-btn color="primary" :label="$t('添加分类')" @click="openCategoryDialog()" />
      </div>

      <q-tree
        :nodes="categoryTree"
        node-key="categoryId"
        default-expand-all
      >
        <template v-slot:default-header="prop">
          <div class="row items-center full-width">
            <q-avatar size="40px" class="q-mr-sm">
              <q-img
                v-if="prop.node.pic"
                :src="getImageUrl(prop.node.pic)"
                spinner-color="primary"
                spinner-size="24px"
              />
              <q-icon
                v-else
                name="folder"
                color="primary"
                size="40px"
              />
            </q-avatar>
            <div class="text-weight-medium">{{ getCurrentLanguageName(prop.node) }}</div>
            <q-space />
            <div class="row q-gutter-sm">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="add"
                @click.stop="openCategoryDialog(prop.node)"
              >
                <q-tooltip>{{ $t('增加子类') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click.stop="openCategoryDialog(prop.node, true)"
              >
                <q-tooltip>{{ $t('编辑') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click.stop="handleDelete(prop.node)"
              >
                <q-tooltip>{{ $t('删除') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="positive"
                icon="add_shopping_cart"
                @click.stop="goToCreateProduct(prop.node)"
              >
                <q-tooltip>{{ $t('创建产品') }}</q-tooltip>
              </q-btn>
            </div>
          </div>
        </template>
      </q-tree>
    </q-card>

    <!-- 确认删除对话框 -->
    <q-dialog v-model="deleteConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="text-h6">{{ $t('确认删除') }}</span>
        </q-card-section>

        <q-card-section>
          {{ $t('确定要删除该分类吗?') }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('取消')" color="primary" v-close-popup />
          <q-btn flat :label="$t('确认')" color="negative" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 添加/编辑分类对话框 -->
    <q-dialog v-model="categoryDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ isEditMode ? $t('编辑分类') : $t('增加子类') }}</div>
        </q-card-section>

        <q-card-section>
          <q-tabs
            v-model="activeLanguage"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="zh-CN" label="简体中" />
            <q-tab name="en" label="English" />
            <q-tab name="zh-TW" label="繁體中文" />
            <q-tab name="ja" label="日本語" />
            <q-tab name="ko" label="한국어" />
          </q-tabs>

          <q-tab-panels v-model="activeLanguage" animated>
            <q-tab-panel name="zh-CN">
              <q-input
                v-model="categoryForm.translations.zh"
                :label="$t('分类名称(中文)')"
                outlined
                :rules="[val => !!val || t('请输入中文名称')]"
              />
            </q-tab-panel>

            <q-tab-panel name="en">
              <q-input
                v-model="categoryForm.translations.en"
                :label="$t('分类名称(英文)')"
                outlined
              />
            </q-tab-panel>

            <q-tab-panel name="zh-TW">
              <q-input
                v-model="categoryForm.translations.zhTw"
                :label="$t('分类名称(繁体)')"
                outlined
              />
            </q-tab-panel>

            <q-tab-panel name="ja">
              <q-input
                v-model="categoryForm.translations.ja"
                :label="$t('分类名称(日语)')"
                outlined
              />
            </q-tab-panel>

            <q-tab-panel name="ko">
              <q-input
                v-model="categoryForm.translations.ko"
                :label="$t('分类名称(韩语)')"
                outlined
              />
            </q-tab-panel>
          </q-tab-panels>

          <q-input
            v-model.number="categoryForm.seq"
            type="number"
            :label="$t('排序')"
            outlined
          />
          <q-toggle
            v-model="categoryForm.status"
            :label="$t('启用')"
            :label-color="categoryForm.status === 1 ? 'primary' : 'negative'"
            :false-value="0"
            :true-value="1"
          />
          <q-file
            v-model="categoryForm.pic"
            :label="$t('选择图片')"
            accept=".jpg,.jpeg,.png,.webp"
            outlined
            @update:model-value="uploadImage"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          <q-img
            v-if="picPreview"
            :src="getImageUrl(picPreview)"
            style="width: 100px; height: 100px"
            class="q-ml-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('取消')" color="primary" v-close-popup />
          <q-btn flat :label="$t('保存')" color="primary" @click="saveCategory" />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '@/utils/axios'
import { useI18n } from 'vue-i18n'
import { getImageUrl } from '~/utils/tools.js'
import type {Translations} from "~/utils/constants";

// 定义分类接口


interface Category {
  categoryId: string
  translations: Translations
  parentId: string
  seq: number
  status: number
  pic?: string | null
  children?: Category[]
  categoryName?: string // 用于显示当前语言的名称
}

const router = useRouter()
const $q = useQuasar()
const { t, locale } = useI18n()

// 分类树数据
const categoryTree = ref<Category[]>([])
// 删除确认对话框
const deleteConfirmDialog = ref(false)
// 添加/编辑分类对话框
const categoryDialog = ref(false)
// 当前选中要删除的分类
const currentDeleteCategory = ref<Category | null>(null)
// 当前编辑的分类
const currentCategory = ref<Category | null>(null)
// 是否为编辑模式
const isEditMode = ref(false)
// 分类表单
const categoryForm = ref<Category>({
  categoryId: '',
  translations: {
    zh: '',
    en: '',
    zhTw: '',
    ja: '',
    ko: ''
  },
  parentId: '',
  seq: 0,
  status: 1,
  pic: null
})
// 图片预览
const picPreview = ref<string | null>(null)
// 添加当前激活的语言标签
const activeLanguage = ref('zh-CN')

// 获取分类列表数据
const fetchCategories = async () => {
  try {
    const res = await api.get('/category/list')
    //console.log('原始数据:', res.data.data)
    if (res.data.succ) {
      // 处理返回的数据，解析国际化名称
      const processedData = res.data.data.map((item: any) => ({
        ...item,
        translations: item.translations ? JSON.parse(item.translations) : {
          zh: item.categoryName,
          en: '',
          zhTw: '',
          ja: '',
          ko: ''
        }
      }))

      // 将扁平数据转换成树形结构
      const treeData = buildTree(processedData)
      //console.log('树形结构数据:', treeData)
      categoryTree.value = treeData
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    $q.notify({
      type: 'negative',
      message: t('获取分类列表失败')
    })
  }
}

// 构建树形结构
const buildTree = (flatData: Category[]): Category[] => {
  const tree: Category[] = []
  const map: { [key: string]: Category } = {}

  // 先把所有节点存入map
  flatData.forEach(item => {
    map[item.categoryId] = {
      ...item,
      children: []
    }
  })

  // 构建树形结构
  flatData.forEach(item => {
    const node = map[item.categoryId]
    if (item.parentId === `0`) {
      // 顶级分类
      tree.push(node)
    } else {
      // 子分类,添加到父节点的children中
      const parent = map[item.parentId]
      if (parent) {
        parent.children?.push(node)
      } else {
        console.warn(`未找到父节点: ${item.parentId}，节点: ${item.categoryId}`)
      }
    }
  })

  //console.log('构建的树:', tree)
  return tree
}

// 打开添加/编辑分类对话框
const openCategoryDialog = (parent: Category | null = null, editMode: boolean = false) => {
  isEditMode.value = editMode
  if (editMode && parent) {
    // 编辑模式
    currentCategory.value = parent
    categoryForm.value = {
      ...parent,
      translations: parent.translations || {
        zh: parent.categoryName || '', // 兼容旧数据
        en: '',
        zhTw: '',
        ja: '',
        ko: ''
      }
    }
    picPreview.value = parent.pic || null
  } else {
    // 添加子类模式
    currentCategory.value = null
    categoryForm.value = {
      categoryId: '',
      translations: {
        zh: '',
        en: '',
        zhTw: '',
        ja: '',
        ko: ''
      },
      parentId: parent ? parent.categoryId : '0',
      seq: 0,
      status: 1,
      pic: null
    }
    picPreview.value = null
  }
  categoryDialog.value = true
}

// 修改图片上传处理函数
const uploadImage = async (file: File) => {
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await api.post('/common/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (res.data.code === 200) {
      // 更新表单中的图片URL
      categoryForm.value.pic = res.data.data.sourceUrl
      // 更新预览图
      picPreview.value = res.data.data.sourceUrl

      $q.notify({
        type: 'positive',
        message: t('图片上传成功')
      })
    } else {
      throw new Error(res.data.msg || '上传失败')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    $q.notify({
      type: 'negative',
      message: t('图片上传失败')
    })
    // 清空选择的文件
    categoryForm.value.pic = null
  }
}

// 保存分类
const saveCategory = async () => {
  try {
    // 验证必填项
    if (!categoryForm.value.translations.zh) {
      $q.notify({
        type: 'warning',
        message: t('请至少输入中文名称')
      })
      return
    }

    const data = {
      categoryName: categoryForm.value.translations.zh, // 保持向后兼容
      translations: JSON.stringify(categoryForm.value.translations), // 将国际化名称转换为JSON字符串
      parentId: categoryForm.value.parentId,
      seq: categoryForm.value.seq,
      status: categoryForm.value.status,
      pic: categoryForm.value.pic,
      categoryId: isEditMode.value ? categoryForm.value.categoryId : undefined
    }

    const res = await api.post(
      isEditMode.value ? `/admin/category/edit` : '/admin/category/add',
      data
    )

    if (res.data.succ) {
      $q.notify({
        type: 'positive',
        message: isEditMode.value ? t('分类编辑成功') : t('子类添加成功')
      })
      // 重新获取列表
      fetchCategories()
    } else {
      throw new Error(res.data.msg)
    }
  } catch (error) {
    console.error(isEditMode.value ? '编辑分类失败:' : '添加子类失败:', error)
    $q.notify({
      type: 'negative',
      message: isEditMode.value ? t('分类编辑失败') : t('子类添加失败')
    })
  }
  categoryDialog.value = false
}

// 删除分类
const handleDelete = (node: Category) => {
  currentDeleteCategory.value = node
  deleteConfirmDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!currentDeleteCategory.value) return

  try {
    const res = await api.get(`/category/remove/${currentDeleteCategory.value.categoryId}`)
    if (res.data.succ) {
      $q.notify({
        type: 'positive',
        message: t('删除成功')
      })
      // 重新获取列表
      fetchCategories()
    } else {
      $q.notify({
        type: 'negative',
        message: res.data.msg || t('删除失败')
      })
    }
  } catch (error) {
    console.error('删除分类失败:', error)
    $q.notify({
      type: 'negative',
      message: t('删除失败')
    })
  }
  deleteConfirmDialog.value = false
}

// 跳转到创建产品页面
const goToCreateProduct = (category: Category) => {
  router.push({ path: '/admin/product/create', query: { categoryId: category.categoryId } })
}

// 在树形结构中显示当前语言的名称
const getCurrentLanguageName = (category: Category) => {
  if (!category.translations) return category.categoryName // 兼容旧数据

  const lang = locale.value
  switch (lang) {
    case 'en':
      return category.translations.en || category.translations.zh
    case 'zh-TW':
      return category.translations.zhTw || category.translations.zh
    case 'ja':
      return category.translations.ja || category.translations.zh
    case 'ko':
      return category.translations.ko || category.translations.zh
    default:
      return category.translations.zh
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style lang="scss" scoped>
.category-list {
  padding: 20px;
}

.q-tree_Node-header {
  .q-avatar {
    border-radius: 4px;
    overflow: hidden;
  }
}

.q-tab-panels {
  background: transparent;
}

.q-tab-panel {
  padding: 16px 0;
}
</style>
