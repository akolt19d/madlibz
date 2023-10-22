import { isRoomCodeValid } from '$lib/RoomCodeUtils.js'
import { redirect } from '@sveltejs/kit'
import { isRoomActive } from '$lib/db/active.js'

export async function load({ params, cookies }) {
    const { roomId } = params
    const username = cookies.get("username")

    if(!username || !isRoomCodeValid(roomId) || !(await isRoomActive(roomId)))
        throw redirect(302, "/game")

    return {
        roomId,
        username
    }
}