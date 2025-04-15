import express from 'express'
import { createServer, Server } from 'http'
import configureServer from './configureServer.ts'
import { handler } from "./build/handler.js"

const port: number = 80
const app = express()
const server: Server = createServer(app)
configureServer(server)

app.use(handler)

server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})
