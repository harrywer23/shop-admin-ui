<template>
  <div class="comments-section">
    <!-- 评价统计 -->
    <CommentStats
      :average-score="averageScore"
      :score-stats="scoreStats"
      :total-comments="totalComments"
    />

    <!-- 评价列表 -->
    <CommentList
      :comments="comments"
      @like="handleLike"
      @reply="handleReply"
      @view-image="openImageViewer"
    />

    <!-- 分页 -->
    <div class="pagination">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="5"
        boundary-numbers
        @update:model-value="loadComments"
      />
    </div>

    <!-- 图片查看器 -->
    <q-dialog v-model="imageViewer">
      <q-carousel
        v-model="currentImageIndex"
        animated
        arrows
        navigation
        infinite
        height="80vh"
      >
        <q-carousel-slide
          v-for="(img, index) in currentImages"
          :key="index"
          :name="index"
          :img-src="img"
        />
      </q-carousel>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import CommentStats from './CommentStats.vue'
import CommentList from './CommentList.vue'
import {tansParams} from "~/utils/tools";

interface Reply {
  id: number
  userName: string
  content: string
  create_time: string
}

interface Comment {
  comment_id: number
  user_id: string
  userName: string
  user_avatar?: string
  content: string
  score: number
  images?: string[]
  likes: number
  reply_count: number
  create_time: string
  is_anonymous: boolean
  replies?: Reply[]
}

const props = defineProps<{
  prodId: string | number
}>()

const emit = defineEmits(['update:comments'])

const $q = useQuasar()

// 状态
const comments = ref<Comment[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const totalComments = ref(0)
const scoreStats = ref({
  5: 0,
  4: 0,
  3: 0,
  2: 0,
  1: 0
})

// 图片查看器状态
const imageViewer = ref(false)
const currentImageIndex = ref(0)
const currentImages = ref<string[]>([])

// 计算属性
const averageScore = computed(() => {
  if (totalComments.value === 0) return 0
  const totalScore = Object.entries(scoreStats.value)
    .reduce((sum, [score, count]) => sum + Number(score) * count, 0)
  return totalScore / totalComments.value
})

// 方法
const loadComments = async (page = 1) => {
  try {
    const params = {
      prodId: props.prodId,
      page,
      pageSize: 10
    };
    const response = await api.get(`/prodComm/list?`+tansParams(params))
    const data = response.data;
    if (data.code === 200) {
      comments.value = data.data
      totalComments.value = data.total
      totalPages.value = Math.ceil(data.total / 10)

      // 计算评分统计
      scoreStats.value = comments.value.reduce((stats, comment) => {
        stats[comment.score] = (stats[comment.score] || 0) + 1
        return stats
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

      emit('update:comments', comments.value)
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载评论失败'
    })
  }
}

const openImageViewer = (images: string[], index: number) => {
  currentImages.value = images
  currentImageIndex.value = index
  imageViewer.value = true
}

const handleLike = async (commentId: number) => {
  try {
    await api.get(`/admin/prodComm/like?commentId=${commentId}`)
    await loadComments(currentPage.value)
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const handleReply = (commentId: number) => {
  // 实现回复功能
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped lang="scss">
.comments-section {
  padding: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
