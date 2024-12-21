// https://nuxt.com/docs/api/configuration/nuxt-config
import { VitePWA } from 'vite-plugin-pwa'

export default defineNuxtConfig({
  devtools: { enabled: true },

  dir: {
    static: 'static', // 新的静态文件夹名称
  },

  modules: [
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    'nuxt-quasar-ui',
    '@pinia/nuxt',
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore', 'acceptHMRUpdate'],
      }
    ]
  ],
  imports: {
    dirs: ['stores']
  },
  pinia: {
    autoImports: ['defineStore', 'storeToRefs'],
    storesDirs: ['./stores/**'],
  },
  pwa: {
    manifest: {
      name: '次元集市',
      description: 'asts, and Novel Readers!\nWe offer officially licensed figurines and merchandise from the world\'s most beloved anime series, video games, classic and best-selling novels',
      lang: 'zh-CN',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      categories: ['photography', 'art', 'social'],
      screenshots: [
        {
          src: '/favicon.ico',
          sizes: '1280x720',
          type: 'image/jpeg',
          label: '首页展示'
        }
      ]
    },
    workbox: {
      runtimeCaching: [
        {
          urlPattern: 'https://image.51x.uk/.*\\.(?:png|jpg|jpeg|svg|gif)', // 替换为你的图片路径
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 1000, // 你希望缓存的图片数量
              maxAgeSeconds: 30 * 24 * 60 * 60 // 缓存时间，例如 30 天
            }
          }
        }
      ]
    }
  },

  i18n: {
    strategy: 'no_prefix',
    locales: [
      // 定义地区对象，包括 code, file 和 name
      { code: 'en', name: 'English' },
      { code: 'zh-CN',  name: '简体中文' },
      { code: 'zh-TW', name: '繁體中文' },
      { code: 'ja', name: '日本語' },
      { code: 'ko', name: '한국어' }
    ],
    defaultLocale: 'zh-CN',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'user-language',
      fallbackLocale: 'zh-CN',
      redirectOn: 'root'  // 只在根路径进行重定向
    },
    vueI18n: './i18n.config.ts'
  },

  runtimeConfig: {
    // Public keys that are exposed to the client
    public: {
      // baseUrl:  process.env.BASE_URL || 'https://admin.aiavr.uk'
      baseUrl:"https://admin.aiavr.uk"
      // baseUrl:"http://127.0.0.1:8098"
    }
  },

  quasar: {
    plugins: ['Notify', 'Dialog','Cookies','Loading'], // 确保插件列表是一个字符串数组
    config: {
      brand: {
        primary: '#FF69B4',
        secondary: '#9370DB',
        accent: '#87CEEB',
        dark: '#1d1d1d',
        'dark-page': '#121212',
        positive: '#21BA45',
        negative: '#C10015',
        info: '#31CCEC',
        warning: '#F2C037'
      }
    },
    extras: {
      animations: 'all'
    }
  },

  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate', // 自动更新 PWA
        manifest: {
          name: 'Dimension Bazaar',
          theme_color: '#ffffff',
        },
        workbox: {
          runtimeCaching: [
            {
              // 正则表达式匹配所有图片格式
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst', // 优先从缓存加载，如果没有再从网络加载
              options: {
                cacheName: 'image-cache', // 缓存名称
                expiration: {
                  maxEntries: 2000, // 最大缓存条目数
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 缓存 30 天
                },
                cacheableResponse: {
                  statuses: [0, 200], // 仅缓存成功请求
                },
              },
            },
          ],
        },
      }),
    ],
  },

  nitro: {
    hooks: {
      'render:html': (html: { head: string[] }) => {
        html.head.push(`
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "次元集市",
              "url": "https://www.cmall.uk",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.aiavr.uk/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          </script>
        `)
      }
    }
  },
  compatibilityDate: '2024-11-07',
  css: [
    '~/assets/styles/vue3-treeselect.min.css'
  ],
})
