<script>
    import { afterNavigate, goto } from "$app/navigation";
    import Loader from "$lib/components/Loader.svelte";
    import { globalSocket } from "$lib/socket.js";
    import { onMount } from "svelte";
    import { setCookie, getCookie } from 'svelte-cookie'
    export let data;

    const socket = globalSocket
    let roomcode = data.roomCode
    let username = ""
    let processedRoomcode = roomcode ? roomcode : "______"
    let selectionLength = 0
    let loading = false;

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
        loading = true
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

{#if loading}
    <Loader />
{:else}
    <div class="flex-wrapper">
        <main class="card w-96 p-12 text-center relative bbb bt-shadow-r">
            <label for="username" class="h3 mb-2">Enter your username</label>
            <input type="text" id="username" name="username" placeholder="Username" class="input-primary" bind:value={username}>
            <hr class="mt-8 mb-4 !border-t-4 !border-dashed !border-black/25">
            <h1>You can</h1>
            <button on:click={createRoom} class="btn-secondary">Create a room</button>
            <p>or</p>
            <input type="text" placeholder="room code" id="roomcode" class="fixed t-0 r-0 opacity-0" bind:value={roomcode} on:input={processRoomcode} on:select={processSelect} on:focusout={ () => { selectionLength = 0 } } maxlength="6">
            <label for="roomcode">
                <div class="roomcode-input">
                    {#each processedRoomcode as char, i}
                        <div class={ i < selectionLength ? "relative selected" : "relative" } data-value={ char }>{ char }</div>
                    {/each}
                </div>
            </label>
            <button on:click={joinRoom} class="btn-tertiary">Join a room</button>
        </main>
    </div>
{/if}

<style lang="postcss">
    #roomcode {
        pointer-events: none;
    }

    #roomcode:focus + label .roomcode-input {
        @apply border-primary-500 bg-transparent border-dashed;
    }

    .roomcode-input div:not(:last-child)::after {
        content: '';
        width: 4px;
        height: 100%;
        position: absolute;
        top: 0;
        right: -2px;
        @apply bg-primary-700;
    }

    #roomcode:focus + label .roomcode-input div:not(:last-child)::after {
        @apply bg-primary-500;
    }

    .selected::before {
        content: attr(data-value);
        height: 100%;
        width: min-content;
        position: absolute;
        top: 0;
        opacity: 50%;
        @apply bg-primary-500-400-token
    }
</style>