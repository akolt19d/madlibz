import { Server } from 'socket.io';
import { generateRoomCode } from "./RoomCode"


export default function configureServer(server) {
    const io = new Server(server.httpServer)
    let active = {}

    io.on("connect", (socket) => {
        socket.emit("event", socket.id)

        socket.on("creatingRoom", (callback) => {
            let code = ""
            while(true) {
                code = generateRoomCode()
                const rooms = Object.keys(active)
                if(!rooms.includes(code)) {
                    active[code] = []
                    console.log(active)
                    break;
                }
            }
            callback(code)
        })

        socket.on("joiningRoom", (roomCode) => {
            socket.join(roomCode)
            active[roomCode].push(socket.id)

            console.log(`${socket.id} joined room '${roomCode}'`)
            console.log(active)

            io.to(roomCode).emit("alertRoom", `${socket.id} joined the room!`)
            io.to(roomCode).emit("playerUpdate", active[roomCode])
        })

        socket.on("leavingRoom", (roomCode) => {
            socket.leave(roomCode)
            active[roomCode] = active[roomCode].filter(x => x != socket.id)
            if(active[roomCode].length == 0)
                delete active[roomCode]

            console.log(`${socket.id} left room '${roomCode}'`)
            console.log(active)

            io.to(roomCode).emit("alertRoom", `${socket.id} left the room :(`)
            io.to(roomCode).emit("playerUpdate", active[roomCode])
        })
    })
}