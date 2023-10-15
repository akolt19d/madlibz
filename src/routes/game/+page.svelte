<script>
    import { goto } from "$app/navigation";
    import { io } from "socket.io-client"

    const socket = io()
    let roomcode = ""
    let code = ""

    function createRoom() {
        socket.emit("creatingRoom", (roomCode = "") => {
            goto(`/game/${roomCode}`)
        })
    }

    function joinRoom() {
        goto(`/game/${roomcode}`)
    }
</script>

<h1>You can</h1>
<button on:click={createRoom}>Create a room</button>
<p>or</p>
<button on:click={joinRoom}>Join a room</button>
<input type="text" placeholder="room code" id="roomcode" bind:value={roomcode}>