<template>
  <div class="about-page">
    <div class="page-container">
      <h1 class="text-h4 q-mb-lg">{{ t('about.title') }}</h1>

      <!-- 公司简介 -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('about.introduction.title') }}</div>
          <p class="text-body1">{{ t('about.introduction.content') }}</p>
        </q-card-section>
      </q-card>

      <!-- 使命愿景 -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('about.mission.title') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat class="mission-card">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-sm">{{ t('about.mission.vision.title') }}</div>
                  <p>{{ t('about.mission.vision.content') }}</p>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat class="mission-card">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-sm">{{ t('about.mission.values.title') }}</div>
                  <p>{{ t('about.mission.values.content') }}</p>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 发展历程 -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('about.history.title') }}</div>
          <q-timeline color="primary">
            <q-timeline-entry
              v-for="(milestone, index) in milestones"
              :key="index"
              :title="milestone.year"
              :subtitle="milestone.title"
            >
              <div>{{ milestone.description }}</div>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>
      </q-card>

      <!-- 联系方式 -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('about.contact.title') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="contact-info">
                <q-icon name="place" size="sm" class="q-mr-sm" />
                <span>{{ t('about.contact.address') }}</span>
              </div>
              <div class="contact-info">
                <q-icon name="email" size="sm" class="q-mr-sm" />
                <span>super@aivrw.com</span>
              </div>
              <div class="contact-info">
                <q-icon name="phone" size="sm" class="q-mr-sm" />
                <span>{{ t('about.contact.phone') }}</span>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 q-mb-sm">{{ t('about.contact.hours.title') }}</div>
              <div class="business-hours">
                <div>{{ t('about.contact.hours.weekdays') }}</div>
                <div>{{ t('about.contact.hours.weekend') }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";

const { t } = useI18n()
const milestones = [
  {
    year: '2024',
    title: t('about.history.milestones.2024.title'),
    description: t('about.history.milestones.2024.description')
  },
  {
    year: '2023',
    title: t('about.history.milestones.2023.title'),
    description: t('about.history.milestones.2023.description')
  },
  {
    year: '2022',
    title: t('about.history.milestones.2022.title'),
    description: t('about.history.milestones.2022.description')
  }
]
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.mission-card {
  height: 100%;
  background-color: #f5f5f5;
}

.contact-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.business-hours {
  color: #666;
}

.business-hours > div {
  margin-bottom: 0.5rem;
}
</style>
