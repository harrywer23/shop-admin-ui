import {API_CONSTANTS} from "~/utils/constants"
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);
    try {
        // 获取语言参数，默认为中文
        const lang = query.lang || 'zh-CN';

        // 构建完整的 URL，添加语言参数
        const fullUrl = `${API_CONSTANTS.BASE_URL}/prod/detail/${query.id}`;

        // 在处理函数内执行 fetch
        const response = await fetch(fullUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': lang // 添加语言请求头
          }
        });
        // 解析响应
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching product detail:', error);
        return {
          code: 500,
          msg: '获取商品详情失败',
          data: null
        };
      }
})
