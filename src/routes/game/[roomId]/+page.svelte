<script>
    import { beforeNavigate } from "$app/navigation";
    import { io } from "socket.io-client"
    export let data;

    const socket = io()

    let players = []

    socket.emit("joiningRoom", data.roomId, data.username)

    socket.on("alertRoom", (message) => {
        alert(message)
    })

    socket.on("playerUpdate", (updatedPlayers) => {
        players = updatedPlayers.map(x => x.username)
    })

    beforeNavigate(() => {
        socket.emit("leavingRoom", data.roomId, data.username)
    })
</script>

<h1>Room code: { data.roomId }</h1>
<h3>Players:</h3>
<ol>
    {#each players as player}
        <li>{player}</li>
    {/each}
</ol>