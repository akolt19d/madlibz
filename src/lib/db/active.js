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

export async function isPlayerHost(username, roomCode) {
    let room = await active.findOne({ roomId: roomCode })
    let host = room.players.filter(x => x.isHost)[0]
    return host.username == username
}

export async function hasGameStarted(roomCode) {
    let room = await active.findOne({ roomId: roomCode })
    return room.hasGameStarted
}