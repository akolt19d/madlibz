<script>
    import { goto } from "$app/navigation";
    import { globalSocket } from "$lib/socket.js";
    import { setCookie, getCookie } from 'svelte-cookie'
    export let data;

    const socket = globalSocket
    let roomcode = data.roomCode
    let username = ""

    try {
        username = getCookie("username") == "" ? generateAnonUsername() : getCookie("username")
    } catch (error) {
        username = generateAnonUsername()
    }

    function generateAnonUsername() {
        let randomUsername = "User#"
        for(let i = 0; i < 4; i++) {
            randomUsername += String(Math.floor(Math.random() * 9))
        }
        
        return randomUsername
    }

    async function redirectToRoom(roomId) {
        setCookie("username", username, 30)
        goto(`/game/${roomId}`)
    }

    function createRoom() {
        socket.emit("creatingRoom", (code) => {
            socket.emit("joiningRoom", code, username, (isActive) => {
                if(isActive)
                    redirectToRoom(code)
                else 
                    console.log("Room inactive.")
            })
        })
    }

    function joinRoom() {
        socket.emit("joiningRoom", roomcode, username, (isActive) => {
            if(isActive)
                redirectToRoom(roomcode)
            else 
                console.log("Room inactive.")
        })
    }
</script>

<h1>You can</h1>
<button on:click={createRoom}>Create a room</button>
<p>or</p>
<button on:click={joinRoom}>Join a room</button>
<input type="text" placeholder="room code" id="roomcode" bind:value={roomcode}>
<br><br>
<label for="username">Enter your username</label>
<input type="text" id="username" name="username" placeholder="Username" bind:value={username}>