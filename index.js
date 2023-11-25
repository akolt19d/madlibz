import express from 'express'
import { createServer } from 'http'
import configureServer from './configureServer.js'
import { handler } from "./build/handler.js"

const port = 80
const app = express()
const server = createServer(app)
configureServer(server)

app.use(handler)

server.listen(port)
