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
                    active[code] = {
                        players: [],
                        chat: []
                    }
                    // console.log(active)
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
                active[roomCode].players.push({
                    id,
                    username,
                    isHost: active[roomCode].players.length == 0
                })
                active[roomCode].chat.push({
                    user: null,
                    message: `${username} joined the room!`
                })
    
                console.log(`${username} (${id}) joined room '${roomCode}'`)
                // console.log(active)
    
                // io.to(roomCode).emit("newChatMessage", false, `${username} joined the room!`)
                io.to(roomCode).emit("chatUpdate", active[roomCode].chat)
                io.to(roomCode).emit("playerUpdate", active[roomCode].players)
                callback(true)
            }
        })

        socket.on("leavingRoom", (roomCode, username) => {
            socket.leave(roomCode)
            active[roomCode].players = active[roomCode].players.filter(x => x.id != socket.id)
            active[roomCode].chat.push({
                user: null,
                message: `${username} left the room :(`
            })
            if(active[roomCode].players.length == 0)
                delete active[roomCode]


            console.log(`${username} (${socket.id}) left room '${roomCode}'`)
            // console.log(active)

            // io.to(roomCode).emit("newChatMessage", false, `${username} left the room :(`)
            if(active[roomCode]) {
                io.to(roomCode).emit("chatUpdate", active[roomCode].chat)
                io.to(roomCode).emit("playerUpdate", active[roomCode].players)
            }
        })

        socket.on("sendingChatMessage", (roomCode, username, message) => {
            // console.log(roomCode, username, message)
            active[roomCode].chat.push({
                user: username,
                message
            })
            io.to(roomCode).emit("chatUpdate", active[roomCode].chat)
        })

    })
}