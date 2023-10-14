import { Server } from 'socket.io';

export default function configureServer(server) {
    const io = new Server(server.httpServer)

    io.on("connect", (socket) => {
        console.log("Server up.")
        socket.emit("event", socket.id)
    })
}