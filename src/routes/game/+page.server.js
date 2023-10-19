export function load({ request, url }) {
    const { headers } = request
    const referer = headers.get("referer")
    let roomCode = ""
    // console.log(referer, url.href, referer.slice(0, referer.length - 7))
    if(url.href == referer.slice(0, referer.length - 7))
        roomCode = referer.slice(referer.length - 6, referer.length)

    return {
        roomCode
    }
}