<script>
    import { goto } from "$app/navigation";
    import { io } from "socket.io-client"

    const socket = io()
    let roomcode = ""
    let code = ""

    function log() {
        socket.emit("creatingRoom", (response) => {
            goto(`/game/${response.roomCode}`)
        })
    }

    function joinRoom() {
        goto(`/game/${roomcode}`)
    }
</script>

<h1>You can</h1>
<button on:click={log}>Create a room</button>
<p>or</p>
<button on:click={joinRoom}>Join a room</button>
<input type="text" placeholder="room code" id="roomcode" bind:value={roomcode}>