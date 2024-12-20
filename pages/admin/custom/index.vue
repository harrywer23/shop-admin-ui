<template>
    <div class="custom-page">
      <!-- 顶部横幅 -->
      <div class="banner-section">
        <div class="banner-content">
          <div class="banner-icon">
            <q-img src="/icons/产品海报.svg" width="64px" />
          </div>
          <h1 class="text-h2">二次元周边定制</h1>
          <p class="text-h6 q-mt-md">
            让您的创意成为现实，打造独一无二的收藏品
          </p>
        </div>
      </div>
  
      <!-- 定制方式对比 -->
      <div class="section comparison-section">
        <div class="row q-col-gutter-xl">
          <!-- 个人定制 -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="comparison-card">
              <q-card-section>
                <div class="text-h5 text-primary">
                  <q-img src="/icons/会员用户.svg" width="32px" class="q-mr-sm" />
                  个人专属定制
                </div>
                <div class="text-subtitle1 q-mt-sm">一对一专属服务，打造独一无二的作品</div>
  
                <!-- 价格指示 -->
                <div class="price-indicator q-mt-md">
                  <div class="text-h6">起价：¥3,000</div>
                  <div class="text-caption">定金比例：30%-50%</div>
                </div>
  
                <!-- 适用场景 -->
                <div class="section-block q-mt-lg">
                  <div class="block-title">
                    <q-icon name="target" color="primary" />
                    适用场景
                  </div>
                  <div class="block-content">
                    <ul>
                      <li>追求独特性，想要独一无二的收藏品</li>
                      <li>有明确的创意和定制需求</li>
                      <li>注重品质，愿意为专属服务付费</li>
                      <li>需要较快的制作周期</li>
                    </ul>
                  </div>
                </div>
  
                <!-- 服务流程 -->
                <div class="section-block">
                  <div class="block-title">
                    <q-icon name="timeline" color="primary" />
                    服务流程
                  </div>
                  <q-timeline color="primary">
                    <q-timeline-entry
                      v-for="(step, index) in personalSteps"
                      :key="index"
                      :title="step.title"
                      :subtitle="step.time"
                    >
                      {{ step.content }}
                    </q-timeline-entry>
                  </q-timeline>
                </div>
  
                <!-- 服务特权 -->
                <div class="section-block">
                  <div class="block-title">
                    <q-icon name="stars" color="primary" />
                    专属特权
                  </div>
                  <div class="block-content">
                    <div class="privilege-item" v-for="(item, index) in personalPrivileges" :key="index">
                      <q-icon :name="item.icon" color="positive" />
                      <div class="privilege-content">
                        <div class="privilege-title">{{ item.title }}</div>
                        <div class="privilege-desc">{{ item.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>
  
                <q-btn
                  color="primary"
                  class="full-width q-mt-lg"
                  label="申请个人定制"
                  icon="edit"
                  @click="router.push('/custom/apply?type=1')"
                />
              </q-card-section>
            </q-card>
          </div>
  
          <!-- 众筹定制 -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="comparison-card">
              <q-card-section>
                <div class="text-h5 text-primary">
                  <q-img src="/icons/分类or广场or其他.svg" width="32px" class="q-mr-sm" />
                  众人请愿定制
                </div>
                <div class="text-subtitle1 q-mt-sm">集众人之力，共同实现梦想</div>
  
                <!-- 价格指示 -->
                <div class="price-indicator q-mt-md">
                  <div class="text-h6">预估价：¥299-999</div>
                  <div class="text-caption">最低众筹数量：100份</div>
                </div>
  
                <!-- 适用场景 -->
                <div class="section-block q-mt-lg">
                  <div class="block-title">
                    <q-icon name="target" color="primary" />
                    适用场景
                  </div>
                  <div class="block-content">
                    <ul>
                      <li>热门IP周边的集体需求</li>
                      <li>期待更实惠的定制价格</li>
                      <li>愿意等待较长制作周期</li>
                      <li>想要参与集体众筹活动</li>
                    </ul>
                  </div>
                </div>
  
                <!-- 众筹流程 -->
                <div class="section-block">
                  <div class="block-title">
                    <q-icon name="timeline" color="primary" />
                    众筹流程
                  </div>
                  <q-timeline color="primary">
                    <q-timeline-entry
                      v-for="(step, index) in crowdfundingSteps"
                      :key="index"
                      :title="step.title"
                      :subtitle="step.time"
                    >
                      {{ step.content }}
                    </q-timeline-entry>
                  </q-timeline>
                </div>
  
                <!-- 支持者权益 -->
                <div class="section-block">
                  <div class="block-title">
                    <q-icon name="card_membership" color="primary" />
                    支持者权益
                  </div>
                  <div class="block-content">
                    <div class="privilege-item" v-for="(item, index) in crowdfundingPrivileges" :key="index">
                      <q-icon :name="item.icon" color="positive" />
                      <div class="privilege-content">
                        <div class="privilege-title">{{ item.title }}</div>
                        <div class="privilege-desc">{{ item.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>
  
                <q-btn
                  color="primary"
                  class="full-width q-mt-lg"
                  label="发起众筹定制"
                  icon="groups"
                  @click="router.push('/custom/apply?type=2')"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
  
      <!-- 成功案例 -->
      <div class="section cases-section bg-grey-1">
        <h2 class="text-h4 text-center">成功案例</h2>
        <div class="row q-col-gutter-lg q-mt-lg">
          <div v-for="(item, index) in successCases" :key="index" class="col-12 col-sm-6 col-md-4">
            <q-card class="case-card">
              <q-img :src="getImageUrl(item.image)" :ratio="1">
                <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
                  {{ item.title }}
                </div>
              </q-img>
              <q-card-section>
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-subtitle1">{{ item.name }}</div>
                    <div class="text-caption text-grey">{{ item.type }}</div>
                  </div>
                  <q-chip
                    :color="item.customType === 'personal' ? 'primary' : 'purple'"
                    text-color="white"
                    size="sm"
                  >
                    {{ item.customType === 'personal' ? '个人定制' : '众筹定制' }}
                  </q-chip>
                </div>
                <div class="text-caption q-mt-sm">{{ item.description }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
  
      <!-- 常见问题 -->
      <div class="section faq-section">
        <h2 class="text-h4 text-center">常见问题</h2>
        <div class="row justify-center">
          <div class="col-12 col-md-8">
            <q-list class="q-mt-lg">
              <q-expansion-item
                v-for="(faq, index) in faqs"
                :key="index"
                :label="faq.question"
                header-class="text-primary"
                expand-separator
              >
                <q-card>
                  <q-card-section>
                    {{ faq.answer }}
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  // 个人定制流程
  const personalSteps = [
    {
      title: '提交申请',
      time: 'Day 1',
      content: '填写详细的定制需求，上传参考图片'
    },
    {
      title: '需求沟通',
      time: 'Day 2-3',
      content: '专属客服一对一沟通细节需求'
    },
    {
      title: '方案制定',
      time: 'Day 4-7',
      content: '设计师定制专属方案和效果图'
    },
    {
      title: '支付定金',
      time: 'Day 8',
      content: '确认方案后支付30%-50%定金'
    },
    {
      title: '开始制作',
      time: 'Day 9-38',
      content: '工匠开始制作，定期反馈进度'
    },
    {
      title: '完成发货',
      time: 'Day 39-40',
      content: '确认成品并支付尾款后发货'
    }
  ]
  
  // 众筹定制流程
  const crowdfundingSteps = [
    {
      title: '发起众筹',
      time: 'Day 1',
      content: '提交众筹申请和初步方案'
    },
    {
      title: '方案评估',
      time: 'Day 2-5',
      content: '评估可行性并制定众筹方案'
    },
    {
      title: '开启预订',
      time: 'Day 6-35',
      content: '正式启动众筹，接受支持者预订'
    },
    {
      title: '达成目标',
      time: 'Day 36',
      content: '达到目标份数，确认生产方案'
    },
    {
      title: '批量生产',
      time: 'Day 37-96',
      content: '工厂开始批量生产定制商品'
    },
    {
      title: '分批发货',
      time: 'Day 97-100',
      content: '完成生产后分批发货给支持者'
    }
  ]
  
  // 个人定制特权
  const personalPrivileges = [
    {
      icon: 'design_services',
      title: '专属设计',
      description: '一对一沟通，完全按照您的想法设计'
    },
    {
      icon: 'verified',
      title: '版权保护',
      description: '独家版权，确保作品独一无二'
    },
    {
      icon: 'speed',
      title: '优先制作',
      description: '优先排期，更快的制作周期'
    },
    {
      icon: 'support_agent',
      title: '专人服务',
      description: '专属客服全程跟进服务'
    }
  ]
  
  // 众筹特权
  const crowdfundingPrivileges = [
    {
      icon: 'savings',
      title: '优惠价格',
      description: '批量生产，享受更优惠的价格'
    },
    {
      icon: 'numbers',
      title: '编号版本',
      description: '限量编号，专属收藏价值'
    },
    {
      icon: 'card_giftcard',
      title: '支持者福利',
      description: '专属周边、抽选特典等福利'
    },
    {
      icon: 'forum',
      title: '粉丝社群',
      description: '加入支持者社群，分享快乐'
    }
  ]
  
  // 成功案例
  const successCases = [
    {
      image: '/custom/case1.jpg',
      title: '原神-刻晴手办',
      name: '个人定制版',
      type: '手办模型',
      customType: 'personal',
      description: '完美还原游戏中的细节，独特pose设计'
    },
    {
      image: '/custom/case2.jpg',
      title: '鬼灭之刃系列',
      name: '众筹限定版',
      type: '手办套装',
      customType: 'crowdfunding',
      description: '限量500套编号版本，众筹价格优惠'
    },
    {
      image: '/custom/case3.jpg',
      title: '海贼王-路飞',
      name: '个人定制版',
      type: '场景手办',
      customType: 'personal',
      description: '特殊场景还原，独家收藏版'
    }
  ]
  
  // 常见问题
  const faqs = [
    {
      question: '个人定制和众筹定制的主要区别是什么？',
      answer: '个人定制提供一对一专属服务，完全按照个人需求定制，价格较高但独特性强；众筹定制通过集体购买降低成本，价格更亲民，但需要达到最低众筹数量。'
    },
    {
      question: '定制周期大概需要多久？',
      answer: '个人定制一般需要30-40天，众筹定制因为涉及众筹周期和批量生产，通常需要90-100天。具体时间会在预估方案中说明。'
    },
    {
      question: '定金比例是多少？',
      answer: '个人定制一般需要支付30%-50%的定金，具体比例根据定制难度和材质决定；众筹定制需要支付全款，但众筹失败会全额退款。'
    },
    {
      question: '是否可以修改定制方案？',
      answer: '个人定制在确认方案前可以多次沟通修改；众筹定制因涉及多人，一旦方案确定后较难大幅修改，但可以在众筹前提出建议。'
    }
  ]
  
  // 获取图片URL
  const getImageUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${useRuntimeConfig().public.imageBaseUrl}${url}`
  }
  </script>
  
  <style lang="scss" scoped>
  .custom-page {
    .banner-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 20px;
      text-align: center;
  
      .banner-content {
        max-width: 800px;
        margin: 0 auto;
      }
    }
  
    .section {
      padding: 80px 20px;
      max-width: 1200px;
      margin: 0 auto;
  
      &.bg-grey-1 {
        background: #f5f7fa;
      }
    }
  
    .comparison-card {
      height: 100%;
      transition: all 0.3s ease;
  
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
  
      .section-block {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #eee;
  
        .block-title {
          font-size: 1.1em;
          font-weight: 500;
          color: var(--q-primary);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
  
        .block-content {
          ul {
            margin: 0;
            padding-left: 20px;
  
            li {
              margin-bottom: 8px;
              color: #666;
            }
          }
        }
      }
  
      .privilege-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
  
        .privilege-content {
          flex: 1;
  
          .privilege-title {
            font-weight: 500;
            margin-bottom: 4px;
          }
  
          .privilege-desc {
            font-size: 0.9em;
            color: #666;
          }
        }
      }
    }
  
    .case-card {
      transition: transform 0.3s ease;
  
      &:hover {
        transform: translateY(-5px);
      }
    }
  
    .faq-section {
      .q-expansion-item {
        margin-bottom: 8px;
      }
    }
  }
  
  // 响应式调整
  @media (max-width: 599px) {
    .custom-page {
      .banner-section {
        padding: 40px 20px;
  
        .text-h2 {
          font-size: 2em;
        }
      }
  
      .section {
        padding: 40px 20px;
      }
    }
  }
  </style>