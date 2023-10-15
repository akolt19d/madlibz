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
            io.to(roomCode).emit("alertRoom", `${socket.id} joined the room!`)
        })

        socket.on("leavingRoom", (roomCode) => {
            socket.leave(roomCode)
            console.log(`${socket.id} left room '${roomCode}'`)
            io.to(roomCode).emit("alertRoom", `${socket.id} left the room :(`)
        })
    })
}