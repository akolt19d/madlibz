<script>
    import { afterNavigate, goto } from "$app/navigation";
    import { globalSocket } from "$lib/socket.js";
    import { setCookie, getCookie } from 'svelte-cookie'
    export let data;

    const socket = globalSocket
    let roomcode = data.roomCode
    let username = ""
    let processedRoomcode = roomcode
    processRoomcode()

    function processRoomcode() {
        let string = roomcode
        for(let i = string.length; i < 6; i++) {
            string += "_"
        }
        processedRoomcode = string
    }

    try {
        username = getCookie("username") == "" ? generateAnonUsername() : getCookie("username")
    } catch (error) {
        username = generateAnonUsername()
    }

    afterNavigate(() => {
        socket.emit("clearRoom", (room) => {
            socket.emit("leavingRoom", room)
        })
    })

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

<div class="flex-wrapper">
    <main class="card w-96 p-12 text-center variant-outline-primary">
        <h1>You can</h1>
        <button on:click={createRoom} class="btn variant-filled-primary">Create a room</button>
        <p>or</p>
        <input type="text" placeholder="room code" id="roomcode" class=" fixed t-0 r-0 opacity-0" bind:value={roomcode} on:input={processRoomcode} maxlength="6">
        <label for="roomcode">
            <div class="roomcode-input">
                {#each processedRoomcode as char}
                    <div>{ char }</div>
                {/each}
            </div>
        </label>
        <button on:click={joinRoom} class="btn variant-filled-primary">Join a room</button>
        <br><br>
        <label for="username">Enter your username</label>
        <input type="text" id="username" name="username" placeholder="Username" class="input" bind:value={username}>
    </main>
</div>

<style lang="postcss">
    :global(.flex-wrapper) {
      /* background-color: red; */
      @apply container;
      @apply flex;
      @apply justify-center;
      @apply items-center;
      @apply mx-auto;
      @apply h-screen;
    }

    :global(.roomcode-input) {
        @apply py-2 px-4 mx-auto my-2;
        @apply bg-surface-700-200-token border border-surface-500-400-token rounded-full;
        @apply grid grid-cols-6;
        @apply cursor-text;
    }

    #roomcode:focus + label .roomcode-input {
        @apply border-secondary-400-500-token;
    }
</style>