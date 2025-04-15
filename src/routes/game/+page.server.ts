import type { PageServerLoad, PageServerLoadEvent } from "./$types";

export const load: PageServerLoad = ({ request, url }: PageServerLoadEvent) => {
    const { headers } = request
    const referer = headers.get("referer")
    let roomCode: string = ""
    // console.log(referer, url.href, referer.slice(0, referer.length - 7))
    if(referer && url.href === referer.slice(0, referer.length - 7))
        roomCode = referer.slice(-6)

    return {
        roomCode
    }
}