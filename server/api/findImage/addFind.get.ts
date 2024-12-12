import {API_CONSTANTS} from "~/utils/constants"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event)

    // Use the GET parameters to make a GET request to `/album/list`
    const response = await fetch(API_CONSTANTS.BASE_URL+`/findImage/addFind?id=`+query.id);
    const dataJson = await response.json();
    //console.log(dataJson.data)
    return {
        code:dataJson.code,
        message: dataJson.message,
        data: dataJson.data,
    };
});
