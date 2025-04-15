import { isRoomCodeValid } from '$lib/RoomCodeUtils'
import { redirect } from '@sveltejs/kit'
import { active } from '$lib/db/active'
import type { LayoutServerLoad, LayoutServerLoadEvent } from './$types'
import type { Player, ChatMessage } from '$lib/db/active'

export const load: LayoutServerLoad = async ({ params, cookies }: LayoutServerLoadEvent) => {
    const { roomId } = params
    const username = cookies.get("username")

    if (!isRoomCodeValid(roomId)) {
        console.warn(`Invalid room code format attempt: ${roomId}`)
        throw redirect(302, "/game")
    }

    const room = await active.findOne({ roomId: roomId })

    if (!room) {
        console.warn(`Attempt to access non-existent room: ${roomId}`)
        throw redirect(302, "/game")
    }

    if (!username) {
        throw redirect(302, `/game/join?r=${roomId}`)
    }

    const playerInRoom = room.players.find(p => p.username === username)

    if (!playerInRoom) {
        console.warn(`User ${username} attempted to access room ${roomId} without being a member.`)
        throw redirect(302, `/game/join?r=${roomId}`)
    }

    const isHost: boolean = playerInRoom.isHost

    const players: Player[] = room.players
    const chat: ChatMessage[] = room.chat

    return {
        roomId,
        username,
        players,
        chat,
        isPlayerHost: isHost
    }
}