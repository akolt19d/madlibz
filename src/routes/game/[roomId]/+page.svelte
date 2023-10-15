<script>
    export let data;
    import { io } from "socket.io-client"

    const socket = io()

    socket.emit("joiningRoom", data.roomId)

    socket.on("playerJoined", (message) => {
        alert(message)
    })
</script>

<h1>{ data.roomId }</h1>