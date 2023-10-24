import { db } from "$lib/db/mongo"

export const active = db.collection("active")

export async function isRoomActive(roomCode) {
    let res = await active.findOne({ roomId: roomCode })
    return Boolean(res)
}

export async function isPlayerInRoom(username, roomCode) {
    let room = await active.findOne({ roomId: roomCode })
    let players = room.players.map(x => x.username)
    return players.includes(username)
}