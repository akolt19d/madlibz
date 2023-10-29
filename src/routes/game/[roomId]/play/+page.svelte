<script>
    export let data;
    import { globalSocket } from '$lib/socket.js';
    import { goto } from '$app/navigation';

    const socket = globalSocket
    let { players, username, story, gameSettings, chat } = data
    $: orderedPlayers = gameSettings.order.map(x => players[Number(x)]).slice(0, 10)

    socket.on("chatUpdate", (updatedChat) => {
        console.log("Chat update!")
        chat = updatedChat
    })

    socket.on("playerUpdate", (updatedPlayers) => {
        console.log("Player update!")
        let indexes = []
        for(let i = 0; i < players.length; i++) {
            if(!updatedPlayers.map(x => x.username).includes(players[i].username))
                indexes.push(i)
        }
        gameSettings.order = gameSettings.order.filter(x => !indexes.includes(x))
        console.log(indexes, gameSettings.order)
        players = updatedPlayers.map(x => {
            let { id, ...player } = x
            return player
        })
    })

    function leaveRoom() {
        socket.emit("leavingRoom", data.roomId, () => {
            goto("/game")
        })
    }
</script>

<button on:click={leaveRoom}>Leave room</button>
<h3>Queue:</h3>
<ul>
    {#each orderedPlayers as player}
        <li class="player">{player.username} {player.username == username ? "(you)" : ""}</li>
    {/each}
</ul>
<h4>{ story.title }</h4>
<div id="chat">
    {#each chat as chatMessage}
        <p class={chatMessage.user ? "chatMessage" : "serverMessage"}>{chatMessage.user ? `${chatMessage.user}: ` : ""}{chatMessage.message}</p>
    {/each}
</div>

<style>
    .player:nth-child(9) {
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
</style>