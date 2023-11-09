<script>
    import { globalSocket } from "$lib/socket";
    export let players, roomId;
    const socket = globalSocket

    socket.on("playerUpdate", (updatedPlayers) => {
        console.log("Player update!")
        players = updatedPlayers.map(x => {
            let { id, ...player } = x
            return player
        })
    })
</script>

<div class="p-2 h-screen">
    <h3 class="h3 mx-2">Room code: <button class="cursor-pointer hover:text-primary-500" on:click={() => { navigator.clipboard.writeText(roomId); }}>{ roomId }</button></h3>
    <button class="btn variant-filled-primary block w-full my-2" on:click={() => { navigator.clipboard.writeText(window.location.href); }}>Invite</button>
    <h5 class="h5 mb-2">Players ({players.length}/10):</h5>
    <ol>
        {#each players as player}
            <li class="card px-3 py-2 my-1 variant-ghost-primary">{player.username} {player.isHost ? "👑" : ""}</li>
        {/each}
    </ol>
</div>