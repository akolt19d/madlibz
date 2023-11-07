<script>
    import { afterNavigate, goto } from "$app/navigation";
    import { globalSocket } from "$lib/socket.js";
    import { onMount } from "svelte";
    import { setCookie, getCookie } from 'svelte-cookie'
    export let data;

    const socket = globalSocket
    let roomcode = data.roomCode
    let username = ""
    let processedRoomcode = roomcode ? roomcode : "______"
    let selectionLength = 0

    onMount(() => {
        processRoomcode()
    })

    function processRoomcode() {
        processSelect()
        let string = roomcode
        for(let i = string.length; i < 6; i++) {
            string += "_"
        }
        processedRoomcode = string
    }

    function processSelect() {
        let selection = window.getSelection().toString()
        let { length } = selection
        selectionLength = length
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
    <main class="card w-96 p-12 text-center">
        <label for="username">Enter your username</label>
        <input type="text" id="username" name="username" placeholder="Username" class="input" bind:value={username}>
        <br><br>
        <h1>You can</h1>
        <button on:click={createRoom} class="btn variant-filled-primary">Create a room</button>
        <p>or</p>
        <input type="text" placeholder="room code" id="roomcode" class="fixed t-0 r-0 opacity-0" bind:value={roomcode} on:input={processRoomcode} on:select={processSelect} on:focusout={ () => { selectionLength = 0 } } maxlength="6">
        <label for="roomcode">
            <div class="roomcode-input">
                {#each processedRoomcode as char, i}
                    <div class={ i < selectionLength ? "relative selected" : "relative" } value={ char }>{ char }</div>
                {/each}
            </div>
        </label>
        <button on:click={joinRoom} class="btn variant-filled-primary">Join a room</button>
    </main>
</div>

<style lang="postcss">
    #roomcode {
        pointer-events: none;
    }

    #roomcode:focus + label .roomcode-input {
        @apply border-primary-400-500-token;
    }

    .roomcode-input div:not(:last-child)::after {
        content: '';
        width: 1px;
        height: 100%;
        position: absolute;
        top: 0;
        right: 0;
        @apply bg-surface-400-500-token;
    }

    .selected::before {
        content: attr(value);
        height: 100%;
        width: min-content;
        position: absolute;
        top: 0;
        opacity: 50%;
        @apply bg-primary-500-400-token
    }
</style>