import {API_CONSTANTS} from "~/utils/constants"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);
    try {
        // 构建完整的 URL
        const fullUrl = `${API_CONSTANTS.BASE_URL}/prod/getInfo/${query.id}`;
        //console.log(fullUrl);
        // 在处理函数内执行 fetch
        const response = await fetch(fullUrl, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // 解析响应
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching album info:', error);
        return {
          code: 500,
          msg: '获取专辑信息失败',
          data: null
        };
      }
})
