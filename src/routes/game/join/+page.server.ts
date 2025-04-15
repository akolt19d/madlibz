import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = ({ url, cookies }) => {
    const roomId = url.searchParams.get("r")

    if(!roomId)
        throw redirect(302, "/game")

    const username = cookies.get("username")
    return {
        roomId,
        username: username ?? "",
        isUsernameSet: Boolean(username)
    }
}