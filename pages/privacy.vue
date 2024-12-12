<template>
  <div class="privacy-page">
    <div class="page-container">
      <h1 class="text-h4 q-mb-lg">{{ $t('privacy.title') }}</h1>

      <q-card flat bordered>
        <q-card-section>
          <!-- 最后更新时间 -->
          <div class="text-caption text-grey q-mb-lg">
            {{ $t('privacy.lastUpdated') }}: 2024-03-20
          </div>

          <!-- 导言 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('privacy.introduction.title') }}</div>
            <p class="text-body1">{{ $t('privacy.introduction.content') }}</p>
          </div>

          <!-- 信息收集 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('privacy.collection.title') }}</div>
            <p class="text-body1">{{ $t('privacy.collection.description') }}</p>
            <ul>
              <li v-for="(item, index) in collectionItems" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- 信息使用 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('privacy.usage.title') }}</div>
            <p class="text-body1">{{ $t('privacy.usage.description') }}</p>
            <ul>
              <li v-for="(item, index) in usageItems" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- 信息共享 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('privacy.sharing.title') }}</div>
            <p class="text-body1">{{ $t('privacy.sharing.description') }}</p>
            <ul>
              <li v-for="(item, index) in sharingItems" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- 信息安全 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('privacy.security.title') }}</div>
            <p class="text-body1">{{ $t('privacy.security.description') }}</p>
            <ul>
              <li v-for="(item, index) in securityMeasures" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- Cookie使用 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('privacy.cookies.title') }}</div>
            <p class="text-body1">{{ $t('privacy.cookies.description') }}</p>
            <div class="cookie-types q-mt-md">
              <div v-for="(cookie, index) in cookieTypes" :key="index" class="cookie-type q-mb-md">
                <div class="text-subtitle1 text-weight-medium">{{ cookie.name }}</div>
                <div class="text-body2">{{ cookie.description }}</div>
              </div>
            </div>
          </div>

          <!-- 用户权利 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('privacy.rights.title') }}</div>
            <p class="text-body1">{{ $t('privacy.rights.description') }}</p>
            <ul>
              <li v-for="(right, index) in userRights" :key="index">
                {{ right }}
              </li>
            </ul>
          </div>

          <!-- 政策更新 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('privacy.updates.title') }}</div>
            <p class="text-body1">{{ $t('privacy.updates.description') }}</p>
          </div>

          <!-- 联系方式 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('privacy.contact.title') }}</div>
            <p class="text-body1">{{ $t('privacy.contact.description') }}</p>
            <div class="contact-info q-mt-md">
              <div><strong>{{ $t('privacy.contact.email') }}:</strong> super@aivrw.com</div>
              <div><strong>{{ $t('privacy.contact.phone') }}:</strong> +1 234 567 890</div>
              <div><strong>{{ $t('privacy.contact.address') }}:</strong> 123 Privacy Street, City, Country</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 底部导航 -->
      <div class="footer-nav q-mt-xl">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <q-btn
              flat
              color="primary"
              :label="$t('privacy.navigation.terms')"
              to="/terms"
            />
            <q-btn
              flat
              color="primary"
              :label="$t('privacy.navigation.contact')"
              to="/contact"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 信息收集项目
const collectionItems = [
  t('privacy.collection.items.personal'),
  t('privacy.collection.items.contact'),
  t('privacy.collection.items.payment'),
  t('privacy.collection.items.usage'),
  t('privacy.collection.items.device')
]

// 信息使用项目
const usageItems = [
  t('privacy.usage.items.service'),
  t('privacy.usage.items.communication'),
  t('privacy.usage.items.improvement'),
  t('privacy.usage.items.security'),
  t('privacy.usage.items.legal')
]

// 信息共享项目
const sharingItems = [
  t('privacy.sharing.items.partners'),
  t('privacy.sharing.items.service'),
  t('privacy.sharing.items.legal'),
  t('privacy.sharing.items.business')
]

// 安全措施
const securityMeasures = [
  t('privacy.security.measures.encryption'),
  t('privacy.security.measures.access'),
  t('privacy.security.measures.monitoring'),
  t('privacy.security.measures.training')
]

// Cookie类型
const cookieTypes = [
  {
    name: t('privacy.cookies.types.essential.name'),
    description: t('privacy.cookies.types.essential.description')
  },
  {
    name: t('privacy.cookies.types.functional.name'),
    description: t('privacy.cookies.types.functional.description')
  },
  {
    name: t('privacy.cookies.types.analytics.name'),
    description: t('privacy.cookies.types.analytics.description')
  },
  {
    name: t('privacy.cookies.types.advertising.name'),
    description: t('privacy.cookies.types.advertising.description')
  }
]

// 用户权利
const userRights = [
  t('privacy.rights.items.access'),
  t('privacy.rights.items.rectification'),
  t('privacy.rights.items.erasure'),
  t('privacy.rights.items.restriction'),
  t('privacy.rights.items.portability'),
  t('privacy.rights.items.objection')
]
</script>

<style lang="scss" scoped>
.privacy-page {
  padding: 20px;

  .page-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .section {
    margin-bottom: 40px;

    ul {
      margin-top: 16px;
      padding-left: 20px;

      li {
        margin-bottom: 8px;
        line-height: 1.6;
      }
    }
  }

  .cookie-types {
    .cookie-type {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
  }

  .contact-info {
    div {
      margin-bottom: 8px;
    }
  }

  p {
    line-height: 1.6;
    margin: 0;
  }
}
</style>
