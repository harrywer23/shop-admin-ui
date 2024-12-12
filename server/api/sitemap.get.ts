import {API_CONSTANTS} from "~/utils/constants"

export default defineSitemapEventHandler(async (e) => {
    const posts = await Promise.all([
        {
            _path: '/see',
            modifiedAt: new Date(),
        }
    ]);
    try {
        const config = useRuntimeConfig();
        //console.log("--------start----defineSitemapEventHandler--------------------")
        for (let i = 1; i < 2; i++) {
            const response = await fetch(API_CONSTANTS.BASE_URL + `/userAlbum/list?pageNum=` + i.toString());
            const dataJson = await response.json();
            //console.log(dataJson.data)
            if (dataJson.code == 200) {
                // 假设API返回的是URL数组
                posts.push(...dataJson.data.map(item => ({
                    _path: `/userAlbumDetail?aid=${item.id}`,
                    modifiedAt: new Date(),
                })));
            } else {
                console.error('API Error:', dataJson.message);
            }
        }
        for (let i = 1; i < 2; i++) {
            const response = await fetch(API_CONSTANTS.BASE_URL + `/systemUser/list?pageNum=` + i.toString());
            const dataJson = await response.json();
            //console.log(dataJson.data)
            if (dataJson.code == 200) {
                // 假设API返回的是URL数组
                posts.push(...dataJson.data.map(item => ({
                    _path: `/users/detail?userId=${item.id}`,
                    modifiedAt: new Date(),
                })));
            } else {
                console.error('API Error:', dataJson.message);
            }
        }
        for (let i = 1; i < 20; i++) {
            try {
                const response = await fetch(API_CONSTANTS.BASE_URL+`/album/list?pageNum=${i}`);
                const dataJson = await response.json();
                //console.log(dataJson.data)
                if (dataJson.code == 200) {
                    // 假设API返回的是URL数组
                    posts.push(...dataJson.data.map(item => ({
                        _path: `/detail?aid=${item.id}`,
                        modifiedAt: new Date(),
                    })));
                } else {
                    console.error('API Error:', dataJson.message);
                }
            }catch (error){
                return posts.map((p) => {
                    return {
                        loc: p._path,
                        lastmod: p.modifiedAt,
                        message:  `${error}`,
                        url:API_CONSTANTS.BASE_URL + `/album/list?pageNum=` + i.toString()
                    };
                });
            }
        }

        for (let i = 1; i < 10; i++) {
            try {
                const response = await fetch(API_CONSTANTS.BASE_URL+`/album/listSee?pageNum=${i}`);
                const dataJson = await response.json();
                //console.log(dataJson.data)
                if (dataJson.code == 200) {
                    // 假设API返回的是URL数组
                    posts.push(...dataJson.data.map(item => ({
                        _path: `/detail?aid=${item.id}`,
                        modifiedAt: new Date(),
                    })));
                } else {
                    console.error('API Error:', dataJson.message);
                }
            }catch (error){
                return posts.map((p) => {
                    return {
                        loc: p._path,
                        lastmod: p.modifiedAt,
                        message:  `${error}`,
                    };
                });
            }
        }
        for (let i = 1; i < 10; i++) {
            try {
                const response = await fetch(API_CONSTANTS.BASE_URL + `/album/list?pageNum=${i}&title=秀人网,JVID`);
                if (!response.ok) {
                    return posts.map((p) => {
                        return {
                            loc: p._path,
                            lastmod: p.modifiedAt,
                            message:  `${response}`,
                        };
                    });
                }
                const dataJson = await response.json();
                if (dataJson.code == 200) {
                    // 假设API返回的是URL数组
                    posts.push(...dataJson.data.map(item => ({
                        _path: `/detail?aid=${item.id}`,
                        modifiedAt: new Date(),
                    })));
                } else {
                    console.error('API Error:', dataJson.message);
                }
            }catch (error){
                return posts.map((p) => {
                    return {
                        loc: p._path,
                        lastmod: p.modifiedAt,
                        message:  `${error}`,
                        url:API_CONSTANTS.BASE_URL + `/album/list?pageNum=` + i.toString() + `&title=秀人网,JVID`
                    };
                });
            }
        }
        //console.log("--------stop----defineSitemapEventHandler--------------------")

        return posts.map((p) => {
            return {
                loc: p._path,
                lastmod: p.modifiedAt,
            };
        });
    }catch (error) {
        return posts.map((p) => {
            return {
                loc: p._path,
                lastmod: p.modifiedAt,
                message:  `${error}`,
            };
        });

    }
});
