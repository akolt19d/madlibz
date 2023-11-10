import { redirect } from '@sveltejs/kit'

export function load({ url, cookies }) {
    const roomId = url.searchParams.get("r")

    if(!roomId)
        throw redirect(302, "/game")

    const username = cookies.get("username")
    return {
        roomId,
        username,
        isUsernameSet: Boolean(username)
    }
}