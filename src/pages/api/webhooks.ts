import { APIRoute } from "astro";

export const get: APIRoute = async (context) => {
    return {
        body: JSON.stringify({
            message: "Hello Astro API"
        })
    }
}

export const post: APIRoute = async (context) => {
    return {
        body: "ok"
    }
}
