<template>
  <div class="comment-list">
    <div v-for="comment in comments" :key="comment.comment_id" class="comment-wrapper">
      <CommentItem
        :comment="comment"
        @like="handleLike"
        @reply="handleReply"
        @view-image="openImageViewer"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import CommentItem from './CommentItem.vue'

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
  comments: Comment[]
}>()

const emit = defineEmits<{
  like: [commentId: number]
  reply: [commentId: number]
  'view-image': [images: string[], index: number]
}>()

const handleLike = (commentId: number) => {
  emit('like', commentId)
}

const handleReply = (commentId: number) => {
  emit('reply', commentId)
}

const openImageViewer = (images: string[], index: number) => {
  emit('view-image', images, index)
}
</script>

<style scoped lang="scss">
.comment-list {
  margin: 20px 0;
}

.comment-wrapper {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
