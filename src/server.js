import { Server } from 'socket.io';
import { generateRoomCode } from "./RoomCode"
import { MongoClient } from "mongodb"

const ROOM_CAPACITY = 10

let GAME_VARIABLES = {}

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

async function getRoom(roomId, active) {
    let room = await active.findOne({ roomId: roomId })
    return room
}

async function setRoomCode(active) {
    let code = generateRoomCode()
    let flag = await isRoomActive(code, active)
    if(!flag) {
        await active.insertOne({
            roomId: code,
            players: [],
            chat: [],
            hasGameStarted: false,
            story: null,
            gameSettings: {}
        })
        GAME_VARIABLES[code] = {}
        return code
    }
    else {
        setRoomCode(active)
    }
}

function extendOrder(order, length) {
    let extendedOrder = [...order]
    for(let i = order.length; i < length; i++) {
        extendedOrder.push(order[i % order.length])
    }
    return extendedOrder
}

function processStory(text) {
    let regex = /_([^_]+)_/g
    return text.match(regex).map(x => x.slice(1, x.length - 1))
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

        socket.on("clearRoom", (callback) => {
            let rooms = Array.from(socket.rooms).filter(x => x != socket.id)
            if(rooms.length > 0)
                callback(rooms[0])
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
                            isHost: room.players.length == 0,
                            roomIndex: room.players.length + 1
                        },
                        chat: {
                            user: null,
                            message: `${username} joined the room!`
                        }
                    }
                })
    
                console.log(`${username} (${id}) joined room '${roomCode}'`)
                // console.log(GAME_VARIABLES)
    
                let updatedRoom = await getRoom(roomCode, active)
                io.to(roomCode).emit("chatUpdate", updatedRoom.chat)
                io.to(roomCode).emit("playerUpdate", updatedRoom.players)
                callback(true)
            }
        })

        async function handleLeave(roomCode, callback) {
            socket.leave(roomCode)
            let room = await active.findOne({ roomId: roomCode })
            if(room) {
                let playerAmount = room.players.length
                if(playerAmount == 1) {
                    delete GAME_VARIABLES[roomCode]
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
                                message: `${socket.data.username} left the room :(`
                            }
                        }
                    })
                    if(room.hasGameStarted) {
                        let updatedRoom = await getRoom(roomCode, active)
                        let updatedIndexes = updatedRoom.players.map(x => x.roomIndex)
                        Array.from(GAME_VARIABLES[roomCode].order).forEach(i => {
                            if(!updatedIndexes.includes(i)) {
                                GAME_VARIABLES[roomCode].order.delete(i)
                                GAME_VARIABLES[roomCode].extendedOrder = extendOrder(GAME_VARIABLES[roomCode].extendedOrder.filter(x => x != i), GAME_VARIABLES[roomCode].gaps.length)
                            }
                        })
                    }
                }
    
    
                console.log(`${socket.data.username} (${socket.id}) left room '${roomCode}'`)
                // console.log(GAME_VARIABLES)
    
                if(playerAmount > 1) {
                    let updatedRoom = await getRoom(roomCode, active)
                    io.to(roomCode).emit("chatUpdate", updatedRoom.chat)
                    io.to(roomCode).emit("playerUpdate", updatedRoom.players)
                    if(room.hasGameStarted)
                        io.to(roomCode).emit("gameVarsUpdate", GAME_VARIABLES[roomCode])
                }
    
                if(callback)
                    callback()
            }
        }

        socket.on("leavingRoom", async (roomCode, callback) => {
            await handleLeave(roomCode, callback)
        })

        socket.on("disconnecting", async (reason) => {
            let rooms = Array.from(socket.rooms).filter(x => x != socket.id)
            await handleLeave(rooms[0])
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
            let room = await getRoom(roomCode, active)
            io.to(roomCode).emit("chatUpdate", room.chat)
        })

        socket.on("startingGame", async (roomCode, story) => {
            let room = await active.findOne({ roomId: roomCode })
            let host = room.players.filter(x => x.isHost)[0]
            if(host.id == socket.id && story) {
                let order = room.players.map(x => Number(x.roomIndex)).sort(() => (Math.random() > .5) ? 1 : -1)
                let gaps = processStory(story.story)
                await active.updateOne({ roomId: roomCode }, {
                    $set: {
                        hasGameStarted: true,
                        story: story
                    },
                })
                GAME_VARIABLES[roomCode] = {
                    gaps: gaps,
                    fills: [],
                    order: new Set(order),
                    extendedOrder: extendOrder(order, gaps.length),
                    turn: order[0]
                }
                // console.log(GAME_VARIABLES)
                io.to(roomCode).emit("startGame")
            }
        })

        socket.on("getGameVariables", (roomCode, callback) => {
            callback(GAME_VARIABLES[roomCode])
        })
    })
}