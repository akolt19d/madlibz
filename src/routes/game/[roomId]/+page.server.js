import { isRoomCodeValid } from '$lib/RoomCodeUtils.js'
import { redirect } from '@sveltejs/kit'

export function load({ params, cookies }) {
    const { roomId } = params
    const username = cookies.get("username")

    // console.log(roomId, username)

    // console.log(isRoomActive(roomId))

    if(!username || !isRoomCodeValid(roomId))
        throw redirect(302, "/game")

    return {
        roomId,
        username
    }
}