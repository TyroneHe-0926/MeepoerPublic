export const SERVER_URL = "http://3.99.16.231:5000"
export const IMAGE_TO_EMBEDDING_URL = SERVER_URL + "/image_to_embedding"
export const GET_PERSON_BBOX = SERVER_URL + "/get_bbox"
export const TEXT_IMG_SEARCH = SERVER_URL + "/text_img_search"
export const GPT3_WRITE_URL = SERVER_URL + "/gpt3_write"
export const GPT3_REWRITE_URL = SERVER_URL + "/gpt3_rewrite"
export const PARSE_IMG_FROM_URL = SERVER_URL + "/parse_img_from_url"
export const URL_TO_EMBEDDING = SERVER_URL + "/url_to_embedding"

export const post = async (url: string, data: any) => {
    let formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key])
    }
    const resp = await fetch(url, {
        method: 'POST',
        body: formData,
    })
    const json = await resp.json()
    console.log('API::POST', url, data, json)
    return json
}