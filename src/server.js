import { Server } from 'socket.io';
import { generateRoomCode } from "./RoomCode"
import { MongoClient } from "mongodb"

const ROOM_CAPACITY = 8

async function isRoomActive(roomId, active) {
    let res = await active.findOne({ roomId: roomId })
    return Boolean(res)
}

async function isUsernameAvailable(username, roomCode, active) {
    let room = await active.findOne({ roomId: roomCode })
    if(room.players.length == 0)
        return true
    let players = room.players.map(x => x.username)
    return !players.includes(username)
}

async function isRoomFull(roomId, active) {
    const room = await active.findOne({ roomId: roomId })
    if(!room)
        return false

    const { length } = room.players
    if(length >= ROOM_CAPACITY)
        return true

    return false
}

async function getChat(roomId, active) {
    let room = await active.findOne({ roomId: roomId })
    return room.chat
}

async function getPlayers(roomId, active) {
    let room = await active.findOne({ roomId: roomId })
    return room.players
}

async function setRoomCode(active) {
    let code = generateRoomCode()
    let flag = await isRoomActive(code, active)
    if(!flag) {
        await active.insertOne({
            roomId: code,
            players: [],
            chat: [],
            hasGameStarted: false
        })
        return code
    }
    else {
        setRoomCode(active)
    }
}

export default function configureServer(server) {
    const io = new Server(server.httpServer)
    const client = new MongoClient("mongodb+srv://akolt19d:NCneG47DWKaiDDmX@adamkolt.dkjdzaa.mongodb.net/?retryWrites=true&w=majority")
    const db = client.db("madlibz")
    const active = db.collection("active")

    io.on("connect", (socket) => {
        socket.emit("event", socket.id)

        socket.on("creatingRoom", async (callback) => {
            callback(await setRoomCode(active))
        })

        socket.on("getId", () => {
            console.log(socket.id)
        })

        socket.on("joiningRoom", async (roomCode, username, callback) => {           
            if(!(await isRoomActive(roomCode, active)) || (await isRoomFull(roomCode, active)) || !(await isUsernameAvailable(username, roomCode, active))) {
                callback(false)
            }
            else {
                let { id } = socket
                socket.join(roomCode)
                socket.data.username = username
                let room = await active.findOne({ roomId: roomCode })
                await active.updateOne({ roomId: roomCode }, {
                    $push: {
                        players: {
                            id,
                            username,
                            isHost: room.players.length == 0
                        },
                        chat: {
                            user: null,
                            message: `${username} joined the room!`
                        }
                    }
                })
    
                console.log(`${username} (${id}) joined room '${roomCode}'`)
                // console.log(active)
    
                let chat = await getChat(roomCode, active)
                let players = await getPlayers(roomCode, active)
                io.to(roomCode).emit("chatUpdate", chat)
                io.to(roomCode).emit("playerUpdate", players)
                callback(true)
            }
        })

        socket.on("leavingRoom", async (roomCode, username, callback) => {
            socket.leave(roomCode)
            let room = await active.findOne({ roomId: roomCode })
            if(room) {
                let playerAmount = room.players.length
                if(playerAmount == 1) {
                    await active.deleteOne({ roomId: roomCode })
                }
                else {
                    await active.updateOne({ roomId: roomCode }, {
                        $pull: {
                            "players": {
                                id: socket.id
                            }
                        },
                        $push: {
                            chat: {
                                user: null,
                                message: `${username} left the room :(`
                            }
                        }
                    })
                }
    
    
                console.log(`${username} (${socket.id}) left room '${roomCode}'`)
                // console.log(active)
    
                if(playerAmount > 1) {
                    let chat = await getChat(roomCode, active)
                    let players = await getPlayers(roomCode, active)
                    io.to(roomCode).emit("chatUpdate", chat)
                    io.to(roomCode).emit("playerUpdate", players)
                }
    
                callback()
            }
        })

        socket.on("sendingChatMessage", async (roomCode, username, message) => {
            await active.updateOne({ roomId: roomCode }, {
                $push: {
                    chat: {
                        user: username,
                        message: message
                    }
                }
            })
            let chat = await getChat(roomCode, active)
            io.to(roomCode).emit("chatUpdate", chat)
        })

        socket.on("startingGame", async (roomCode) => {
            let room = await active.findOne({ roomId: roomCode })
            let host = room.players.filter(x => x.isHost)[0]
            if(host.id == socket.id) {
                await active.updateOne({ roomId: roomCode }, {
                    $set: {
                        hasGameStarted: true
                    }
                })
                io.to(roomCode).emit("startGame")
            }
        })
    })
}