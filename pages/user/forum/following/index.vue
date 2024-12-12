<template>
  <div class="following-page">
    <div class="page-header">
      <h1 class="text-h5">{{ $t('user.forum.following') }}</h1>
    </div>

    <!-- 标签页 -->
    <q-tabs
      v-model="activeTab"
      class="text-primary q-mb-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
      narrow-indicator
    >
      <q-tab name="topics" :label="$t('forum.following.topics')" />
      <q-tab name="users" :label="$t('forum.following.users')" />
    </q-tabs>

    <!-- 主题列表 -->
    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel name="topics">
        <q-list separator>
          <q-item
            v-for="topic in followingTopics"
            :key="topic.id"
            clickable
            v-ripple
            @click="router.push(`/forum/topic/${topic.id}`)"
          >
            <!-- 分类标签 -->
            <q-item-section side>
              <q-chip
                :label="topic.categoryName"
                color="primary"
                text-color="white"
                dense
              />
            </q-item-section>

            <!-- 主题内容 -->
            <q-item-section>
              <q-item-label class="topic-title">
                {{ topic.title }}
              </q-item-label>
              <q-item-label caption lines="2">
                {{ topic.content }}
              </q-item-label>
              <q-item-label caption>
                <div class="row items-center text-grey">
                  <span>{{ topic.userName }}</span>
                  <q-space />
                  <q-icon name="visibility" size="16px" />
                  <span class="q-ml-xs">{{ topic.views }}</span>
                  <q-icon name="thumb_up" size="16px" class="q-ml-md" />
                  <span class="q-ml-xs">{{ topic.likes }}</span>
                  <q-icon name="comment" size="16px" class="q-ml-md" />
                  <span class="q-ml-xs">{{ topic.comments }}</span>
                  <span class="q-ml-md">{{ formatDateTime(topic.createdAt) }}</span>
                </div>
              </q-item-label>
            </q-item-section>

            <!-- 取消关注按钮 -->
            <q-item-section side>
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="favorite"
                @click.stop="unfollowTopic(topic)"
              >
                <q-tooltip>{{ $t('forum.following.unfollow') }}</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- 主题分页器 -->
        <div class="pagination-section q-pa-md flex justify-center">
          <q-pagination
            v-model="topicsPage"
            :max="topicsTotalPages"
            :max-pages="6"
            boundary-numbers
            direction-links
            @update:model-value="loadFollowingTopics"
          />
        </div>
      </q-tab-panel>

      <!-- 用户列表 -->
      <q-tab-panel name="users">
        <div class="row q-col-gutter-md">
          <div
            v-for="user in followingUsers"
            :key="user.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card flat bordered class="user-card">
              <q-item>
                <q-item-section avatar>
                  <q-avatar size="48px">
                    <img :src="user.avatar">
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ user.nickname }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ user.signature || $t('forum.following.noSignature') }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    color="primary"
                    icon="favorite"
                    @click="unfollowUser(user)"
                  >
                    <q-tooltip>{{ $t('forum.following.unfollow') }}</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>

              <q-card-section horizontal class="q-pt-none">
                <q-card-section class="text-center">
                  <div class="text-h6">{{ user.topicCount }}</div>
                  <div class="text-caption">{{ $t('forum.following.topics') }}</div>
                </q-card-section>
                <q-separator vertical />
                <q-card-section class="text-center">
                  <div class="text-h6">{{ user.followerCount }}</div>
                  <div class="text-caption">{{ $t('forum.following.followers') }}</div>
                </q-card-section>
                <q-separator vertical />
                <q-card-section class="text-center">
                  <div class="text-h6">{{ user.followingCount }}</div>
                  <div class="text-caption">{{ $t('forum.following.following') }}</div>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- 用户分页器 -->
        <div class="pagination-section q-pa-md flex justify-center">
          <q-pagination
            v-model="usersPage"
            :max="usersTotalPages"
            :max-pages="6"
            boundary-numbers
            direction-links
            @update:model-value="loadFollowingUsers"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'users',
  middleware: 'auth'
})

import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { api } from '~/utils/axios'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

// 状态变量
const activeTab = ref('topics')
const followingTopics = ref([])
const followingUsers = ref([])
const topicsPage = ref(1)
const usersPage = ref(1)
const topicsTotalPages = ref(1)
const usersTotalPages = ref(1)

// 加载关注的主题
const loadFollowingTopics = async () => {
  try {
    const response = await api.get('/user/forum/following/topics', {
      params: {
        page: topicsPage.value,
        limit: 10
      }
    })
    const { code, data, total } = response.data
    if (code === 200) {
      followingTopics.value = data
      topicsTotalPages.value = Math.ceil(total / 10)
    }
  } catch (error) {
    console.error('加载关注主题失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.following.loadTopicsFailed')
    })
  }
}

// 加载关注的用户
const loadFollowingUsers = async () => {
  try {
    const response = await api.get('/user/forum/following/users', {
      params: {
        page: usersPage.value,
        limit: 12
      }
    })
    const { code, data, total } = response.data
    if (code === 200) {
      followingUsers.value = data
      usersTotalPages.value = Math.ceil(total / 12)
    }
  } catch (error) {
    console.error('加载关注用户失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.following.loadUsersFailed')
    })
  }
}

// 取消关注主题
const unfollowTopic = async (topic) => {
  try {
    const response = await api.post(`/user/forum/topic/${topic.id}/unfollow`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('forum.following.unfollowSuccess')
      })
      loadFollowingTopics()
    }
  } catch (error) {
    console.error('取消关注主题失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.following.unfollowFailed')
    })
  }
}

// 取消关注用户
const unfollowUser = async (user) => {
  try {
    const response = await api.post(`/user/forum/user/${user.id}/unfollow`)
    if (response.data.code === 200) {
      $q.notify({
        type: 'positive',
        message: t('forum.following.unfollowSuccess')
      })
      loadFollowingUsers()
    }
  } catch (error) {
    console.error('取消关注用户失败:', error)
    $q.notify({
      type: 'negative',
      message: t('forum.following.unfollowFailed')
    })
  }
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'YYYY-MM-DD HH:mm:ss')
}

// 监听标签页变化
watch(activeTab, (newTab) => {
  if (newTab === 'topics') {
    loadFollowingTopics()
  } else {
    loadFollowingUsers()
  }
})

// 初始化
onMounted(() => {
  loadFollowingTopics()
})
</script>

<style lang="scss" scoped>
.following-page {
  padding: 20px;
}

.topic-title {
  font-size: 1.1em;
  font-weight: 500;
}

.user-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
</style> 