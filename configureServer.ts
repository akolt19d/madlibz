import { Server as SocketIOServer, Socket } from 'socket.io';
import { generateRoomCode } from "./RoomCode.ts"
import { MongoClient, ObjectId, Db, Collection, Document, WithId } from "mongodb"
import { Server as HttpServer } from 'http';

// Type definitions
interface Player {
    id: string;
    username: string;
    isHost: boolean;
    roomIndex: number;
}

interface ChatMessage {
    user: string | null;
    message: string;
}

// Assuming Story structure from usage and DB schema
interface Story extends Document {
    _id: ObjectId;
    title: string;
    story: string;
    likes?: number;
    dislikes?: number;
    // Add other fields if necessary
}

// Structure for active rooms in the database
interface Room extends Document {
    roomId: string;
    players: Player[];
    chat: ChatMessage[];
    hasGameStarted: boolean;
    hasSummaryStarted: boolean;
    story: WithId<Story> | null;
    gameSettings: Record<string, any>; // Define further if structure is known
}

// Structure for game state associated with a room
interface RoomGameVariables {
    gaps: string[];
    fills: string[];
    order: Set<number>;
    extendedOrder: number[];
    turn: number;
    round: number;
    filledStory?: string;
    selectedStory?: WithId<Story>;
}

// Type for the global game variables store
type GameVariables = Record<string, RoomGameVariables>;

// Type for socket.data
interface SocketData {
    username: string;
}

const ROOM_CAPACITY = 10

let GAME_VARIABLES: GameVariables = {}

async function isRoomActive(roomId: string, active: Collection<Room>): Promise<boolean> {
    let res = await active.findOne({ roomId: roomId })
    return Boolean(res)
}

async function cannotJoin(username: string, roomCode: string, active: Collection<Room>): Promise<{ flag: boolean; message: string }> {
    const room: WithId<Room> | null = await active.findOne({ roomId: roomCode })
    let message = "There has been an error."
    if(!room)
        return { flag: true, message: "The room you tried to join is not active." }

    let isNameAvailable = isUsernameAvailable(username, room!)
    let isFull = isRoomFull(room!)

    if(!isNameAvailable)
        message = "The username is already taken for this lobby."
    if(isFull)
        message = "The room is already full."
    if(room.hasGameStarted || room.hasSummaryStarted)
        message = "The game has already started. Wait for the players to finish and try again."

    return {
        flag: (isFull || !isNameAvailable || room.hasGameStarted || room.hasSummaryStarted),
        message
    }
}

function isUsernameAvailable(username: string, room: WithId<Room>): boolean {
    if(room.players.length == 0)
        return true
    let players = room.players.map(x => x.username)
    return !players.includes(username)
}

function isRoomFull(room: WithId<Room> | null): boolean {
    if(!room)
        return false

    const { length } = room.players
    if(length >= ROOM_CAPACITY)
        return true

    return false
}

async function getRoom(roomId: string, active: Collection<Room>): Promise<WithId<Room> | null> {
    let room = await active.findOne({ roomId: roomId })
    return room
}

async function setRoomCode(active: Collection<Room>): Promise<string> {
    let code = generateRoomCode()
    let flag = await isRoomActive(code, active)
    if(!flag) {
        const newRoom: Room = {
            roomId: code,
            players: [],
            chat: [],
            hasGameStarted: false,
            hasSummaryStarted: false,
            story: null,
            gameSettings: {}
        }
        await active.insertOne(newRoom)
        GAME_VARIABLES[code] = {} as RoomGameVariables
        return code
    }
    else {
        return await setRoomCode(active)
    }
}

function extendOrder(order: number[], length: number): number[] {
    let extendedOrder = [...order]
    for(let i = order.length; i < length; i++) {
        extendedOrder.push(order[i % order.length])
    }
    return extendedOrder
}

function processStory(text: string): string[] {
    let regex = /_([^_]+)_/g
    let matches = text.match(regex)
    if (!matches) return []
    return matches.map(x => x.slice(1, x.length - 1))
}

function fillStory(text: string, fills: string[]): string {
    let regex = /_([^_]+)_/g
    let gaps = text.match(regex)
    
    let fillIndex = 0
    return text.replace(regex, (match) => {
        let replacement = fills[fillIndex] !== undefined ? fills[fillIndex] : match
        fillIndex++
        return `<span class="filled-gap text-error-500 underline">${replacement}</span>`
    })
}

export default function configureServer(server: HttpServer | any) {
    const io = new SocketIOServer(server)
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb+srv://akolt19d:NCneG47DWKaiDDmX@adamkolt.dkjdzaa.mongodb.net/?retryWrites=true&w=majority")
    const db: Db = client.db("madlibz")
    const active: Collection<Room> = db.collection<Room>("active")
    const stories: Collection<Story> = db.collection<Story>("stories")

    io.on("connect", (socket: Socket<any, any, any, SocketData>) => {
        console.log(`User connected: ${socket.id}`)
        socket.emit("event", socket.id)

        socket.on("creatingRoom", async (callback: (roomCode: string) => void) => {
            if (typeof callback === 'function') {
                callback(await setRoomCode(active))
            }
        })

        socket.on("clearRoom", (callback: (roomCode: string | null) => void) => {
            if (typeof callback === 'function') {
                let rooms = Array.from(socket.rooms).filter(x => x !== socket.id)
                callback(rooms.length > 0 ? rooms[0] : null)
            }
        })

        socket.on("joiningRoom", async (roomCode: string, username: string, callback: (result: { canJoin: boolean; message?: string }) => void) => {
            if (!roomCode || !username || typeof callback !== 'function') {
                return callback?.({ canJoin: false, message: "Invalid request parameters." })
            }

            const cantJoin = await cannotJoin(username, roomCode, active)
            if (cantJoin.flag || !username || !roomCode) {
                callback({
                    canJoin: false,
                    message: cantJoin.message
                })
            }
            else {
                let { id } = socket
                socket.join(roomCode)
                socket.data.username = username
                let room = await active.findOne({ roomId: roomCode })
                if (!room) {
                    return callback({ canJoin: false, message: "Room not found." })
                }

                let newPlayer: Player = {
                    id,
                    username,
                    isHost: room.players.length === 0,
                    roomIndex: room.players.length + 1
                }
                let joinMessage: ChatMessage = {
                    user: null,
                    message: `${username} joined the room!`
                }

                await active.updateOne(
                    { roomId: roomCode },
                    {
                        $push: {
                            players: newPlayer,
                            chat: joinMessage
                        }
                    }
                )

                console.log(`${username} (${id}) joined room '${roomCode}'`)

                let updatedRoom = await getRoom(roomCode, active)
                if (updatedRoom) {
                    io.to(roomCode).emit("chatUpdate", updatedRoom.chat)
                    io.to(roomCode).emit("playerUpdate", updatedRoom.players)
                }
                callback({
                    canJoin: true
                })
            }
        })

        async function handleLeave(roomCode: string, callback?: () => void) {
            if (!roomCode || !socket.data.username) {
                console.warn(`handleLeave called with invalid parameters: roomCode=${roomCode}, username=${socket.data.username}`)
                return
            }

            console.log(`Attempting to leave: ${socket.data.username} (${socket.id}) from room '${roomCode}'`)
            socket.leave(roomCode)
            let room = await active.findOne({ roomId: roomCode })

            if (room) {
                let playerAmount = room.players.length
                if (playerAmount === 1 && room.players[0].id === socket.id) {
                    delete GAME_VARIABLES[roomCode]
                    await active.deleteOne({ roomId: roomCode })
                    console.log(`Room '${roomCode}' deleted as last player left.`)
                }
                else {
                    let leavingPlayer = room.players.find(p => p.id === socket.id)
                    if (!leavingPlayer) {
                        console.warn(`Player ${socket.id} not found in room ${roomCode} during leave.`)
                    }

                    let leaveMessage: ChatMessage = {
                        user: null,
                        message: `${socket.data.username} left the room :(`
                    }

                    await active.updateOne(
                        { roomId: roomCode },
                        {
                            $pull: { players: { id: socket.id } },
                            $push: { chat: leaveMessage }
                        }
                    )

                    let updatedRoom = await getRoom(roomCode, active)
                    if (updatedRoom && updatedRoom.players.length > 0) {
                        let hostExists = updatedRoom.players.some(p => p.isHost)
                        if (!hostExists) {
                            await active.updateOne(
                                { roomId: roomCode, "players.0": { $exists: true } },
                                { $set: { "players.0.isHost": true } }
                            )
                            updatedRoom = await getRoom(roomCode, active)
                            console.log(`Host changed in room '${roomCode}'`)
                        }

                        if (room.hasGameStarted && GAME_VARIABLES[roomCode] && leavingPlayer) {
                            let gameVars = GAME_VARIABLES[roomCode]
                            let leftPlayerIndex = leavingPlayer.roomIndex

                            if (gameVars.order.has(leftPlayerIndex)) {
                                gameVars.order.delete(leftPlayerIndex)
                                let currentOrder = Array.from(gameVars.order)
                                if (currentOrder.length > 0) {
                                    gameVars.extendedOrder = extendOrder(currentOrder, gameVars.gaps.length + gameVars.fills.length)
                                    if (gameVars.turn === leftPlayerIndex) {
                                        if (gameVars.round - 1 < gameVars.extendedOrder.length) {
                                            gameVars.turn = gameVars.extendedOrder[gameVars.round - 1]
                                        } else {
                                            gameVars.turn = updatedRoom?.players[0]?.roomIndex ?? -1
                                        }
                                    }
                                } else {
                                    console.warn(`Game order became empty in room ${roomCode}`)
                                    gameVars.turn = -1
                                    gameVars.extendedOrder = []
                                }
                                GAME_VARIABLES[roomCode] = gameVars
                            }
                        }
                    } else if (updatedRoom && updatedRoom.players.length === 0) {
                        delete GAME_VARIABLES[roomCode]
                        await active.deleteOne({ roomId: roomCode })
                        console.log(`Room '${roomCode}' deleted as it became empty after player left.`)
                        updatedRoom = null
                    }

                    if (updatedRoom) {
                        io.to(roomCode).emit("chatUpdate", updatedRoom.chat)
                        io.to(roomCode).emit("playerUpdate", updatedRoom.players)
                        if (room.hasGameStarted && GAME_VARIABLES[roomCode]) {
                            io.to(roomCode).emit("gameVarsUpdate", GAME_VARIABLES[roomCode])
                        }
                    }
                }
                console.log(`${socket.data.username} (${socket.id}) successfully left room '${roomCode}'`)
            } else {
                console.log(`Room '${roomCode}' not found during leave attempt by ${socket.data.username}.`)
            }

            if (typeof callback === 'function') {
                callback()
            }
        }

        socket.on("leavingRoom", async (roomCode: string, callback?: () => void) => {
            await handleLeave(roomCode, callback)
        })

        socket.on("disconnecting", async (reason: string) => {
            console.log(`User ${socket.id} disconnecting, reason: ${reason}`)
            let rooms = Array.from(socket.rooms).filter(r => r !== socket.id)
            for (let roomCode of rooms) {
                await handleLeave(roomCode)
            }
        })

        socket.on("sendingChatMessage", async (roomCode: string, username: string, message: string) => {
            if (!message || !roomCode || !username) return

            let chatMessage: ChatMessage = { user: username, message }
            await active.updateOne(
                { roomId: roomCode },
                { $push: { chat: chatMessage } }
            )
            let room = await getRoom(roomCode, active)
            if (room) {
                io.to(roomCode).emit("chatUpdate", room.chat)
            }
        })

        socket.on("startingGame", async (roomCode: string, story: WithId<Story> | null) => {
            if (!roomCode || !story) return

            let room = await getRoom(roomCode, active)
            if (!room) return

            let host = room.players.find(p => p.isHost)
            if (!host || host.id !== socket.id) return

            if (room.hasGameStarted || room.hasSummaryStarted) {
                console.warn(`Attempt to start game in room ${roomCode} which has already started/in summary.`)
                return
            }

            let order = room.players.map(p => p.roomIndex).sort(() => Math.random() - 0.5)
            let gaps = processStory(story.story)
            if (gaps.length === 0) {
                console.warn(`Attempt to start game in room ${roomCode} with story "${story.title}" which has no gaps.`)
                return
            }

            await active.updateOne(
                { roomId: roomCode },
                { $set: { hasGameStarted: true, hasSummaryStarted: false, story: story } }
            )

            GAME_VARIABLES[roomCode] = {
                gaps: gaps,
                fills: [],
                order: new Set(order),
                extendedOrder: extendOrder(order, gaps.length),
                turn: order[0],
                round: 1
            }

            console.log(`Game started in room '${roomCode}' with story '${story.title}'`)
            io.to(roomCode).emit("startGame")
            io.to(roomCode).emit("gameVarsUpdate", GAME_VARIABLES[roomCode])
        })

        socket.on("getGameVariables", (roomCode: string, callback: (vars: RoomGameVariables | null) => void) => {
            if (typeof callback === 'function') {
                callback(GAME_VARIABLES[roomCode] || null)
            }
        })

        socket.on("gapFilled", async (roomCode: string, username: string, fill: string) => {
            if (!fill || !roomCode || !username) return

            let room = await getRoom(roomCode, active)
            let gameVars = GAME_VARIABLES[roomCode]
            if (!room || !gameVars || !room.hasGameStarted) return

            let player = room.players.find(p => p.username === username)
            if (!player || gameVars.turn !== player.roomIndex) return

            gameVars.gaps.shift()
            gameVars.fills.push(fill)
            gameVars.round += 1

            if (gameVars.gaps.length === 0) {
                gameVars.filledStory = fillStory(room.story!.story, gameVars.fills)
                gameVars.turn = -1
                GAME_VARIABLES[roomCode] = gameVars

                await active.updateOne(
                    { roomId: roomCode },
                    { $set: { hasGameStarted: false, hasSummaryStarted: true } }
                )
                console.log(`Game summary starting in room '${roomCode}'`)
                io.to(roomCode).emit("startGameSummary", gameVars.filledStory)
                io.to(roomCode).emit("gameVarsUpdate", gameVars)
            } else {
                gameVars.turn = gameVars.extendedOrder[gameVars.round - 1]
                GAME_VARIABLES[roomCode] = gameVars

                console.log(`Gap filled in room ${roomCode} by ${username}. Next turn: Player ${gameVars.turn}`)
                io.to(roomCode).emit("gameVarsUpdate", gameVars)
                io.to(roomCode).emit("updateFillValue", "")
            }
        })

        socket.on("fillValueChanged", async (roomCode: string, username: string, fillValue: string) => {
            let room = await getRoom(roomCode, active)
            let gameVars = GAME_VARIABLES[roomCode]
            if (!room || !gameVars || !room.hasGameStarted) return

            let player = room.players.find(p => p.username === username)
            if (player && gameVars.turn === player.roomIndex) {
                socket.broadcast.to(roomCode).emit("updateFillValue", fillValue)
            }
        })

        socket.on("endingSummary", async (roomCode: string) => {
            if (!roomCode) return
            let room = await getRoom(roomCode, active)
            if (!room) return

            let host = room.players.find(p => p.isHost)
            if (host && host.id === socket.id && room.hasSummaryStarted) {
                await active.updateOne(
                    { roomId: roomCode },
                    { $set: { hasSummaryStarted: false, story: null } }
                )
                delete GAME_VARIABLES[roomCode]

                console.log(`Summary ended in room '${roomCode}'`)
                io.to(roomCode).emit("summaryEnded")
            }
        })

        socket.on("selectingStory", async (roomCode: string, story: WithId<Story> | null) => {
            if (!roomCode) return
            let room = await getRoom(roomCode, active)
            if (!room) return

            let host = room.players.find(p => p.isHost)
            if (host && host.id === socket.id && !room.hasGameStarted && !room.hasSummaryStarted) {
                if (!GAME_VARIABLES[roomCode]) {
                    GAME_VARIABLES[roomCode] = {} as RoomGameVariables
                }

                GAME_VARIABLES[roomCode].selectedStory = story || undefined

                console.log(`Host selected story '${story?.title ?? 'None'}' in room '${roomCode}'`)
                socket.broadcast.to(roomCode).emit("gameVarsUpdate", GAME_VARIABLES[roomCode])
            }
        })

        socket.on("ratingStory", async (roomCode: string, storyId: string, positive: boolean, callback?: () => void) => {
            if (!roomCode || !storyId) return

            let room = await getRoom(roomCode, active)
            if (room?.story?._id.toString() === storyId) {
                try {
                    let updateField = positive ? { likes: 1 } : { dislikes: 1 }
                    let result = await stories.updateOne(
                        { _id: new ObjectId(storyId) },
                        { $inc: updateField }
                    )

                    if (result.modifiedCount > 0) {
                        console.log(`Story ${storyId} rating updated (positive: ${positive})`)
                        callback?.()
                    } else {
                        console.warn(`Story ${storyId} not found or rating not updated.`)
                    }
                } catch (error) {
                    console.error(`Error rating story ${storyId}:`, error)
                }
            } else {
                console.warn(`Rating attempt in room ${roomCode} for story ${storyId} which doesn't match current/last story ${room?.story?._id}`)
            }
        })
    })

    process.on('SIGINT', async () => {
        console.log('Shutting down server...')
        await client.close()
        console.log('MongoDB connection closed.')
        io.close(() => {
            console.log('Socket.IO server closed.')
            process.exit(0)
        })
    })

    client.connect().then(() => {
        console.log("MongoDB connected successfully.")
    }).catch(err => {
        console.error("MongoDB connection error:", err)
        process.exit(1)
    })
}