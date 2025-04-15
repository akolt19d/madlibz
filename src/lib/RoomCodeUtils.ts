export function isRoomCodeValid(roomCode: string = ""): boolean {
    const regex = /([A-Z]|[a-z]|[0-9]){6}/;

    if(!regex.test(roomCode))
        return false

    return true
}