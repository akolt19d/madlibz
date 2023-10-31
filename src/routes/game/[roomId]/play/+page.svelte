<script>
    export let data;
    import { globalSocket } from '$lib/socket.js';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';

    const socket = globalSocket
    let { players, username, story, gameSettings, chat } = data
    let input = ""
    let chatInput = ""
    let gameVariables = writable(undefined)
    let orderedPlayers = []
    $: if($gameVariables) {
        orderedPlayers = $gameVariables.extendedOrder?.map(x => players[x-1]).slice($gameVariables.round-1).slice(0, 10)
        console.log("Order!", orderedPlayers)
    }
    // $: orderedPlayers = $gameVariables?.extendedOrder?.map(x => players[Number(x)]).slice(0, 10)
    // let filledGaps = writable([])
    // let gaps = writable(story.gaps)

    onMount(() => {
        socket.emit("getGameVariables", data.roomId, (vars) => {
            gameVariables.set(vars)
        })
    })

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

    socket.on("gameVarsUpdate", (vars) => {
        gameVariables.set(vars)
        console.log("Vars update!", $gameVariables)
    })

    function leaveRoom() {
        socket.emit("leavingRoom", data.roomId, () => {
            goto("/game")
        })
    }

    function sendChatMessage() {
        socket.emit("sendingChatMessage", data.roomId, data.username, chatInput)
        chatInput = ""
    }

    function fillGap() {
        socket.emit("gapFilled", data.roomId, data.username, input)
        input = ""
    }
</script>

{#if $gameVariables}
    <button on:click={leaveRoom}>Leave room</button>
    <h3>Round {$gameVariables.round}</h3>
    <h3>Turn: {$gameVariables.turn}</h3>
    <h3>Queue:</h3>
    <ul>
        {#each orderedPlayers as player}
            {#if player}
                <li class="player">{player.username} {player.username == username ? "(you)" : ""}</li>
            {/if}
        {/each}
    </ul>
    <h4>{ story.title }</h4>
    <input type="text" bind:value={chatInput}><button on:click={sendChatMessage}>Send</button>
    <div id="chat">
        {#each chat as chatMessage}
            <p class={chatMessage.user ? "chatMessage" : "serverMessage"}>{chatMessage.user ? `${chatMessage.user}: ` : ""}{chatMessage.message}</p>
        {/each}
    </div>
    {#if ($gameVariables.turn == data.playerIndex)}
        <input type="text" bind:value={input}><button on:click={fillGap}>Confirm</button>
    {/if}
    <div id="words-container">
        <ol>   
            {#each $gameVariables.gaps as gap}
                <li>{ gap }</li>
            {/each}
        </ol> 
        <ol>
            {#each $gameVariables.fills as filledGap}
                <li>{ filledGap }</li>
            {/each}
        </ol>
    </div>
{/if}

<style>
    .player:nth-last-child(2) {
        opacity: 40%;
    }

    .player:last-child {
        opacity: 15%;
    }

    #chat {
        border: 1px solid black;
    }

    .serverMessage {
        color: red;
    }

    #words-container {
        display: grid;
        grid-template-columns: 1fr auto;
    }
</style>