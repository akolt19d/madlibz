export function isRoomCodeValid(roomCode = "") {
    const regex = /([A-Z]|[a-z]|[0-9])\w{5}/

    if(roomCode.length != 6)
        return false

    if(!regex.test(roomCode))
        return false

    return true
}