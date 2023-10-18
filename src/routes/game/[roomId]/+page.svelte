<script>
    import { beforeNavigate, goto } from "$app/navigation";
    import { io } from "socket.io-client"
    import { onMount } from "svelte";
    import Loader from "$lib/components/Loader.svelte";
    export let data;

    const socket = io()

    let players = []
    let chat = []
    let roomInactive = false
    let loading = true

    let chatInput = ""

    onMount(() => {
        socket.emit("joiningRoom", data.roomId, data.username, (isValid) => {
            if(!isValid) {
                roomInactive = true
                goto("/game")
            }
            loading = false
        })
    })

    socket.on("chatUpdate", (updatedChat) => {
        chat = updatedChat
    })

    socket.on("playerUpdate", (updatedPlayers) => {
        players = updatedPlayers.map(x => {
            let { id, ...player } = x
            return player
        })
    })

    beforeNavigate(() => {
        if(!roomInactive)
            socket.emit("leavingRoom", data.roomId, data.username)
    })

    function sendChatMessage() {
        socket.emit("sendingChatMessage", data.roomId, data.username, chatInput)
        chatInput = ""
    }
</script>

{#if loading}
    <Loader />
{:else}
    <h1>Room code: { data.roomId }</h1>
    <h3>Players:</h3>
    <ol>
        {#each players as player}
            <li>{player.username} {player.isHost ? "👑" : ""}</li>
        {/each}
    </ol>
    <input type="text" bind:value={chatInput}><button on:click={sendChatMessage}>Send</button>
    <div id="chat">
        {#each chat as chatMessage}
            <p class={chatMessage.user ? "chatMessage" : "serverMessage"}>{chatMessage.user ? `${chatMessage.user}: ` : ""}{chatMessage.message}</p>
        {/each}
    </div>
{/if}

<style>
    .serverMessage {
        color: red;
    }
</style>