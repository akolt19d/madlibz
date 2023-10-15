import { Server } from 'socket.io';
import { generateRoomCode } from "./RoomCode"

let rooms = []

export default function configureServer(server) {
    const io = new Server(server.httpServer)

    io.on("connect", (socket) => {
        socket.emit("event", socket.id)

        socket.on("creatingRoom", (callback) => {
            let code = ""
            while(true) {
                code = generateRoomCode()
                if(!rooms.includes(code)) {
                    rooms.push(code)
                    break;
                }
            }
            callback({
                roomCode: code
            })
        })

        socket.on("joiningRoom", (roomCode) => {
            socket.join(roomCode)
            console.log(`${socket.id} joined room '${roomCode}'`)
            io.to(roomCode).emit("playerJoined", `${socket.id} joined the room!`)
        })
    })
}