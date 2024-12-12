<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '次元集市',
  description: '这里是所有动漫迷、游戏玩家、影视爱好者以及小说粉丝的终极购物目的地！',
  keywords: '动漫,手办,周边,游戏,影视,小说',
  ogImage: '/og-image.jpg',
  ogTitle: '',
  ogDescription: ''
})

useHead({
  title: props.title,
  meta: [
    { name: 'description', content: props.description },
    { name: 'keywords', content: props.keywords },
    // Open Graph
    { property: 'og:title', content: props.ogTitle || props.title },
    { property: 'og:description', content: props.ogDescription || props.description },
    { property: 'og:image', content: props.ogImage },
    { property: 'og:type', content: 'website' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: props.ogTitle || props.title },
    { name: 'twitter:description', content: props.ogDescription || props.description },
    { name: 'twitter:image', content: props.ogImage }
  ],
  link: [
    { rel: 'canonical', href: `https://www.51x.uk${useRoute().fullPath}` }
  ]
})
</script>

<template>
  <slot />
</template>
