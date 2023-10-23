<script>
    import { beforeNavigate, goto } from "$app/navigation";
    import { onMount } from "svelte";
    import Loader from "$lib/components/Loader.svelte";
    import { globalSocket } from "$lib/socket.js";
    export let data;

    const socket = globalSocket

    let players = data.players
    let chat = data.chat
    let loading = false

    let chatInput = ""
    let gameOption = false

    // onMount(() => {
    //     socket.emit("joinedRoom", data.roomId)
    // })

    socket.on("chatUpdate", (updatedChat) => {
        console.log("Chat update!")
        chat = updatedChat
    })

    socket.on("playerUpdate", (updatedPlayers) => {
        console.log("Player update!")
        players = updatedPlayers.map(x => {
            let { id, ...player } = x
            return player
        })
    })

    beforeNavigate(() => {
        leaveRoom()
    })

    function leaveRoom() {
        socket.emit("leavingRoom", data.roomId, data.username, () => {
            goto("/game")
        })
    }

    function sendChatMessage() {
        socket.emit("sendingChatMessage", data.roomId, data.username, chatInput)
        chatInput = ""
    }
</script>

{#if loading}
    <Loader />
{:else}
    <h1>Room code: <span class="roomcode" on:click={() => { navigator.clipboard.writeText(data.roomId); }}>{ data.roomId }</span></h1>
    <button on:click={leaveRoom}>Leave room</button>
    <h3>Players ({players.length}/8):</h3>
    <ol>
        {#each players as player}
            <li>{player.username} {player.isHost ? "👑" : ""}</li>
        {/each}
    </ol>
    <input type="checkbox" bind:checked={gameOption}>
    {#if gameOption}
        <p>essa</p>
    {:else}
        <p>Podaj własny tekst</p>
        <input type="text" name="title" placeholder="Tytuł"><br>
        <textarea cols="30" rows="10" placeholder="Historyjka..." /><br>
    {/if}
    <input type="text" bind:value={chatInput}><button on:click={sendChatMessage}>Send</button>
    <div id="chat">
        {#each chat as chatMessage}
            <p class={chatMessage.user ? "chatMessage" : "serverMessage"}>{chatMessage.user ? `${chatMessage.user}: ` : ""}{chatMessage.message}</p>
        {/each}
    </div>

{/if}

<style>
    #chat {
        border: 1px solid black;
    }
    .serverMessage {
        color: red;
    }

    .roomcode {
        cursor: pointer;
    }
</style>