import { defineSitemapEventHandler } from '#imports'
import { createError } from 'h3'
import type { SitemapUrl } from '#sitemap/types'
import { serverApi } from '~/utils/server-api'
import type { Product, Category } from '~/types/sitemap'

export default defineSitemapEventHandler(async (event) => {
  try {
    const urls: SitemapUrl[] = []
    
    // 获取所有商品
    const prodResponse = await serverApi.get('/prod/select', {
      params: {
        pageNum: 1,
        pageSize: 1000,
        status: 1
      }
    })
    
    if (prodResponse.data.code === 200) {
      const products: Product[] = prodResponse.data.data.records || []
      
      products.forEach(product => {
        urls.push({
          loc: `/product/detail?prodId=${product.prodId}`,
          lastmod: product.updateTime || new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.8,
          _sitemap: 'posts',
          _i18nTransform: true
        })
      })
    }
    
    // 获取所有分类
    const categoryResponse = await serverApi.get('/category/list')
    if (categoryResponse.data.code === 200) {
      const categories: Category[] = categoryResponse.data.data || []
      
      categories.forEach(category => {
        if (category.status === 1) {
          urls.push({
            loc: `/product/sort?categoryId=${category.categoryId}`,
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date().toISOString(),
            _sitemap: 'posts',
            _i18nTransform: true
          })
        }
      })
    }
    
    // 添加静态页面
    const staticPages = [
      { path: '/', priority: 1.0 },
      { path: '/about', priority: 0.6 },
      { path: '/contact', priority: 0.6 },
      { path: '/help', priority: 0.6 },
      { path: '/terms', priority: 0.5 },
      { path: '/privacy', priority: 0.5 }
    ]
    
    staticPages.forEach(page => {
      urls.push({
        loc: page.path,
        changefreq: 'weekly',
        priority: page.priority,
        lastmod: new Date().toISOString(),
        _sitemap: 'general',
        _i18nTransform: true
      })
    })

    console.log(`Generated ${urls.length} URLs for sitemap`)
    return urls
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate sitemap',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
