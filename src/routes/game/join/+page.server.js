export function load({ url, cookies }) {
    const roomId = url.searchParams.get("r")
    const username = cookies.get("username")
    return {
        roomId,
        username,
        isUsernameSet: Boolean(username)
    }
}