<template>
  <div class="terms-page">
    <div class="page-container">
      <h1 class="text-h4 q-mb-lg">{{ $t('terms.title') }}</h1>

      <q-card flat bordered>
        <q-card-section>
          <!-- 最后更新时间 -->
          <div class="text-caption text-grey q-mb-lg">
            {{ $t('terms.lastUpdated') }}: 2024-03-20
          </div>

          <!-- 协议接受 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('terms.acceptance.title') }}</div>
            <p class="text-body1">{{ $t('terms.acceptance.content') }}</p>
          </div>

          <!-- 服务说明 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('terms.services.title') }}</div>
            <p class="text-body1">{{ $t('terms.services.description') }}</p>
            <ul>
              <li v-for="(service, index) in services" :key="index">
                {{ service }}
              </li>
            </ul>
          </div>

          <!-- 用户责任 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('terms.userResponsibilities.title') }}</div>
            <p class="text-body1">{{ $t('terms.userResponsibilities.description') }}</p>
            <ul>
              <li v-for="(responsibility, index) in responsibilities" :key="index">
                {{ responsibility }}
              </li>
            </ul>
          </div>

          <!-- 知识产权 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('terms.intellectualProperty.title') }}</div>
            <p class="text-body1">{{ $t('terms.intellectualProperty.content') }}</p>
          </div>

          <!-- 支付和退款 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('terms.payment.title') }}</div>
            <p class="text-body1">{{ $t('terms.payment.description') }}</p>
            <div class="subsection q-ml-md">
              <div class="text-subtitle1 q-mb-sm">{{ $t('terms.payment.pricing.title') }}</div>
              <p>{{ $t('terms.payment.pricing.content') }}</p>

              <div class="text-subtitle1 q-mb-sm">{{ $t('terms.payment.refunds.title') }}</div>
              <p>{{ $t('terms.payment.refunds.content') }}</p>
            </div>
          </div>

          <!-- 账户管理 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('terms.account.title') }}</div>
            <p class="text-body1">{{ $t('terms.account.description') }}</p>
            <ul>
              <li v-for="(rule, index) in accountRules" :key="index">
                {{ rule }}
              </li>
            </ul>
          </div>

          <!-- 内容政策 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('terms.content.title') }}</div>
            <p class="text-body1">{{ $t('terms.content.description') }}</p>
            <div class="prohibited-content q-pa-md bg-grey-2 rounded-borders">
              <div class="text-subtitle1 q-mb-sm">{{ $t('terms.content.prohibited.title') }}</div>
              <ul class="q-mb-none">
                <li v-for="(item, index) in prohibitedContent" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

          <!-- 免责声明 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('terms.disclaimer.title') }}</div>
            <p class="text-body1">{{ $t('terms.disclaimer.content') }}</p>
          </div>

          <!-- 终止条款 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('terms.termination.title') }}</div>
            <p class="text-body1">{{ $t('terms.termination.content') }}</p>
          </div>

          <!-- 法律管辖 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('terms.governing.title') }}</div>
            <p class="text-body1">{{ $t('terms.governing.content') }}</p>
          </div>

          <!-- 修改条款 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('terms.changes.title') }}</div>
            <p class="text-body1">{{ $t('terms.changes.content') }}</p>
          </div>

          <!-- 联系方式 -->
          <div class="section">
            <div class="text-h6 q-mb-md">{{ $t('terms.contact.title') }}</div>
            <p class="text-body1">{{ $t('terms.contact.content') }}</p>
            <div class="contact-info q-mt-md">
              <div><strong>{{ $t('terms.contact.email') }}:</strong> super@aivrw.com</div>
              <div><strong>{{ $t('terms.contact.phone') }}:</strong> +1 234 567 890</div>
              <div><strong>{{ $t('terms.contact.address') }}:</strong> 123 Terms Street, City, Country</div>
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
              :label="$t('terms.navigation.privacy')"
              to="/privacy"
            />
            <q-btn
              flat
              color="primary"
              :label="$t('terms.navigation.contact')"
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

definePageMeta({
  layout: 'default'
})

const { t } = useI18n()

const services = [
  t('terms.services.items.marketplace'),
  t('terms.services.items.payment'),
  t('terms.services.items.delivery'),
  t('terms.services.items.support')
]

const responsibilities = [
  t('terms.userResponsibilities.items.accurate'),
  t('terms.userResponsibilities.items.security'),
  t('terms.userResponsibilities.items.activity'),
  t('terms.userResponsibilities.items.compliance')
]

const accountRules = [
  t('terms.account.rules.registration'),
  t('terms.account.rules.security'),
  t('terms.account.rules.usage'),
  t('terms.account.rules.termination')
]

const prohibitedContent = [
  t('terms.content.prohibited.items.illegal'),
  t('terms.content.prohibited.items.harmful'),
  t('terms.content.prohibited.items.spam'),
  t('terms.content.prohibited.items.infringement'),
  t('terms.content.prohibited.items.malicious')
]
</script>

<style lang="scss" scoped>
.terms-page {
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

  .subsection {
    margin: 20px 0;
  }

  .prohibited-content {
    ul {
      margin-top: 8px;
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
