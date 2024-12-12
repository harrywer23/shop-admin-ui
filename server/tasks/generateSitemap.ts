import { writeFile } from 'fs/promises'
import { join } from 'path'
import { generateSitemapRoutes, generateImageSitemap } from '../../utils/sitemap'

async function generateSitemap() {
  try {
    const routes = await generateSitemapRoutes()
    const images = await generateImageSitemap()

    // 生成主网站地图
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes.map(route => `
  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastmod || new Date().toISOString()}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
  `).join('')}
</urlset>`

    // 生成图片网站地图
    const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${images.map(image => `
  <url>
    <loc>${image.loc}</loc>
    ${image.images.map(img => `
    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${img.title}</image:title>
      <image:caption>${img.caption}</image:caption>
    </image:image>
    `).join('')}
  </url>
  `).join('')}
</urlset>`

    // 写入文件
    await writeFile(join(process.cwd(), 'public/sitemap.xml'), sitemap)
    await writeFile(join(process.cwd(), 'public/sitemap-images.xml'), imageSitemap)

    console.log('网站地图生成成功')
  } catch (error) {
    console.error('生成网站地图失败:', error)
  }
}

// 每天凌晨执行一次
setInterval(generateSitemap, 24 * 60 * 60 * 1000)
generateSitemap() // 首次执行

export default generateSitemap 