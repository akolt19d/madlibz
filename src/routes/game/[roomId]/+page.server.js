// import { isRoomCodeValid } from '$lib/RoomCode.js'
import { error } from '@sveltejs/kit'

export function load({ params }) {
    const { roomId } = params

    // if(!isRoomCodeValid(roomId))
    //     throw error(404)

    return {
        roomId
    }
}