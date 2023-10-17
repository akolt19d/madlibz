import { Server } from 'socket.io';
import { generateRoomCode } from "./RoomCode"

let active = {}

function isRoomActive(roomId) {
    const rooms = Object.keys(active)
    return rooms.includes(roomId)
}

export default function configureServer(server) {
    const io = new Server(server.httpServer)

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

        socket.on("joiningRoom", (roomCode, username, callback) => {           
            if(!isRoomActive(roomCode)) {
                callback(false)
            }
            else {
                let { id } = socket
                socket.join(roomCode)
                socket.data.username = username
                active[roomCode].push({
                    id,
                    username
                })
    
                console.log(`${username} (${id}) joined room '${roomCode}'`)
                console.log(active)
    
                io.to(roomCode).emit("alertRoom", `${username} joined the room!`)
                io.to(roomCode).emit("playerUpdate", active[roomCode])
                callback(true)
            }
        })

        socket.on("leavingRoom", (roomCode, username) => {
            socket.leave(roomCode)
            active[roomCode] = active[roomCode].filter(x => x.id != socket.id)
            if(active[roomCode].length == 0)
                delete active[roomCode]

            console.log(`${username} (${socket.id}) left room '${roomCode}'`)
            console.log(active)

            io.to(roomCode).emit("alertRoom", `${username} left the room :(`)
            io.to(roomCode).emit("playerUpdate", active[roomCode])
        })

    })
}