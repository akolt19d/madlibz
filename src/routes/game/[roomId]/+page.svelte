<script>
    import { beforeNavigate } from "$app/navigation";
    export let data;
    import { io } from "socket.io-client"

    const socket = io()

    let players = []

    socket.emit("joiningRoom", data.roomId)

    socket.on("alertRoom", (message) => {
        alert(message)
    })

    socket.on("playerUpdate", (updatedPlayers) => {
        players = updatedPlayers
    })

    beforeNavigate(() => {
        socket.emit("leavingRoom", data.roomId)
    })
</script>

<h1>Room code: { data.roomId }</h1>
<h3>Players:</h3>
<ol>
    {#each players as player}
        <li>{player}</li>
    {/each}
</ol>