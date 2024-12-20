<template>
  <div class="tags-edit">
    <q-card class="edit-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">标签管理</div>
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

      <q-card-section>
        <div class="selected-tags q-mb-lg">
          <div class="section-title q-mb-sm">已选标签</div>
          <div class="tags-container">
            <q-chip
              v-for="tag in selectedTags"
              :key="tag.id"
              removable
              @remove="removeTag(tag)"
              color="primary"
              text-color="white"
            >
              {{ tag.title }}
            </q-chip>
          </div>
        </div>

        <div class="available-tags">
          <div class="section-title q-mb-sm">可选标签</div>
          <div class="tags-container">
            <q-chip
              v-for="tag in availableTags"
              :key="tag.id"
              clickable
              @click="addTag(tag)"
              :disable="isTagSelected(tag)"
              outline
              color="primary"
            >
              {{ tag.title }}
            </q-chip>
          </div>
        </div>

        <div class="row justify-end q-mt-xl">
          <q-btn
            label="取消"
            flat
            color="grey-7"
            class="q-mr-sm"
            @click="router.back()"
          />
          <q-btn
            label="保存"
            color="primary"
            :loading="submitting"
            @click="handleSubmit"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

interface Tag {
  id: number
  tagId: number
  title: string
  status: number
}

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const prodId = ref(route.query.prodId)
const submitting = ref(false)

// 标签数据
const allTags = ref<Tag[]>([])
const selectedTags = ref<Tag[]>([])

// 计算可选标签
const availableTags = computed(() => {
  return allTags.value.filter(tag => !isTagSelected(tag))
})

// 检查标签是否已选中
function isTagSelected(tag: Tag): boolean {
  return selectedTags.value.some(selected => selected.id === tag.id)
}

// 加载标签数据
async function loadTagData() {
  try {
    //console.log('=== 开始加载标签数据 ===')

    // 获取商品标签
    const response = await api.post('/sys/prod/prod/tags/list', JSON.stringify({ prodId: prodId.value }))

    const result = await response.data
    //console.log('已选标签数据:', result)

    if (result.code === 200) {
      selectedTags.value = result.data || []
    }

    // 获取所有可用标签
    const allTagsResponse = await api.get('/sys/prod/prodTag/list')
    const allTagsResult = await allTagsResponse.data
    //console.log('所有标签数据:', allTagsResult)

    if (allTagsResult.code === 200) {
      allTags.value = allTagsResult.data || []
    }
  } catch (error) {
    console.error('加载标签数据失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载标签数据失败'
    })
  }
  //console.log('=== 标签数据加载完成 ===')
}

// 添加标签
function addTag(tag: Tag) {
  //console.log('添加标签:', tag)
  if (!isTagSelected(tag)) {
    selectedTags.value.push({
      ...tag,
      tagId: tag.id
    })
  }
}

// 移除标签
function removeTag(tagToRemove: Tag) {
  //console.log('移除标签:', tagToRemove)
  selectedTags.value = selectedTags.value.filter(tag => tag.id !== tagToRemove.id)
}

// 提交表单
async function handleSubmit() {
  //console.log('=== 开始提交标签更新 ===')
  try {
    submitting.value = true

    const tagIdList = selectedTags.value.map(tag =>
       tag.id)


    const response = await api.post('/prodTagReference/update/prodTags',  JSON.stringify({
        "prodId": prodId.value,
        "tagIds": tagIdList

    })
  );

    const result = await response.data
    //console.log('提交结果:', result)

    if (result.code === 200) {
      $q.notify({
        type: 'positive',
        message: '保存成功'
      })
      router.back()
    } else {
      throw new Error(result.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : '保存失败'
    })
  } finally {
    submitting.value = false
    //console.log('=== 标签更新完成 ===')
  }
}

onMounted(() => {
  if (prodId.value) {
    loadTagData()
  }
})
</script>

<style lang="scss" scoped>
.tags-edit {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;

  .edit-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: #606266;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;
    min-height: 100px;

    .q-chip {
      &[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}
</style>
