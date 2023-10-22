import { db } from "$lib/db/mongo"

export const active = db.collection("active")

export async function isRoomActive(roomCode) {
    let res = await active.findOne({ roomId: roomCode })
    return Boolean(res)
}