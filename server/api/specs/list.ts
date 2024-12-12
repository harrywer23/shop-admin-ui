import { defineEventHandler } from 'h3';
import {API_CONSTANTS} from "~/utils/constants"

import { LRUCache } from 'lru-cache';
const cache =new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24,
})
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  // const cacheKey = `listSee:${JSON.stringify(query)}`;

  //console.log('Album info request params:', query);

  // const cachedData = cache.get('album'+cacheKey);
  // if (cachedData) {
  //   //console.log('Using cached data for:'+cacheKey);
  //   return cachedData;
  // }

  try {
    const fullUrl = `${API_CONSTANTS.BASE_URL}/prop/list`;

    // 构建完整的 URL
    // const fullUrl = `${API_CONSTANTS.BASE_URL}/album/list?`+tansParams(query);
    //console.log('Fetching from URL:', fullUrl);

    // 在处理函数内执行 fetch
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 解析响应
    const data = await response.json();

    // if (data.code === 200) {
    //    cache.set('album'+cacheKey, data);
    //   //console.log('Caching successful response for:'+cacheKey);
    // }

    return data;

  } catch (error) {
    console.error('Error fetching album info:', error);
    return {
      code: 500,
      msg: '获取专辑信息失败',
      data: null
    };
  }
});
