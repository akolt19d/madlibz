import { isRoomCodeValid } from '$lib/RoomCodeUtils.js'
import { redirect } from '@sveltejs/kit'

export function load({ params, cookies }) {
    const { roomId } = params
    const username = cookies.get("username")

    if(!username || !isRoomCodeValid(roomId))
        throw redirect(302, "/game")

    return {
        roomId,
        username
    }
}