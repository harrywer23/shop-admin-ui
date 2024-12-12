<template>
  <div class="comments-stats">
    <div class="rating">
      <div class="score">{{ averageScore.toFixed(1) }}</div>
      <div class="stars">
        <q-rating
          :model-value="averageScore"
          max="5"
          size="2em"
          color="amber"
          readonly
        />
      </div>
    </div>
    <div class="stats-detail">
      <div class="stat-item" v-for="(count, score) in scoreStats" :key="score">
        <span class="score-label">{{ score }}星</span>
        <q-linear-progress
          :value="count / totalComments"
          class="q-mx-sm"
          color="amber"
        />
        <span class="count">{{ count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  averageScore: number
  scoreStats: Record<string, number>
  totalComments: number
}>()
</script>

<style scoped lang="scss">
.comments-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.rating {
  text-align: center;
}

.score {
  font-size: 36px;
  font-weight: bold;
  color: #ff4081;
}

.stats-detail {
  flex: 1;
}

.stat-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.score-label {
  width: 40px;
}

.count {
  width: 40px;
  text-align: right;
}
</style> 