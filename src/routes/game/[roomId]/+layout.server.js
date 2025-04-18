import { isRoomCodeValid } from '$lib/RoomCodeUtils.js'
import { redirect } from '@sveltejs/kit'
import { isRoomActive, active, isPlayerInRoom, isPlayerHost } from '$lib/db/active.js'

export async function load({ params, cookies }) {
    const { roomId } = params
    const username = cookies.get("username")

    if(!isRoomCodeValid(roomId) || !(await isRoomActive(roomId)))
        throw redirect(302, "/game")

    if(!username || !(await isPlayerInRoom(username, roomId)))
        throw redirect(302, `/game/join?r=${roomId}`)

    let room = await active.findOne({ roomId: roomId })
    let { players, chat } = room
    let isHost = await isPlayerHost(username, roomId)

    return {
        roomId,
        username,
        players,
        chat,
        isPlayerHost: isHost
    }
}