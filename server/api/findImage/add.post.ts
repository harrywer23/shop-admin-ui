import {API_CONSTANTS} from "~/utils/constants"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event)
    //console.log(body)

    // Use the GET parameters to make a GET request to `/album/list`
    const response = await fetch(API_CONSTANTS.BASE_URL+`/findImage/add`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
           body: JSON.stringify(body)
    }
    );
    const dataJson = await response.json();
    return {
        code:dataJson.code,
        message: dataJson.message,
        data: dataJson.data,
    };
});
