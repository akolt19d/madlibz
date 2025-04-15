import { io, Socket } from "socket.io-client"

// You might want to define strict types for your client-server events
// interface ServerToClientEvents { ... }
// interface ClientToServerEvents { ... }

// Use <ServerToClientEvents, ClientToServerEvents> if defined, otherwise use default any
export const globalSocket: Socket<any, any> = io()