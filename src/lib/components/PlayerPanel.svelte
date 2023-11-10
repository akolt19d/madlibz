<script>
    import { globalSocket } from "$lib/socket";
  import { fly } from "svelte/transition";
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

<div class="p-2 h-full card bbb bt-shadow-l bg-secondary-500">
    <h3 class="h3 mx-2">Room code: <button id="copy-roomcode" class="cursor-pointer text-black relative z-10 font-bold right-[2px] top-[2px]" title="Copy room code" value={ roomId } on:click={() => { navigator.clipboard.writeText(roomId); }}>{ roomId }</button></h3>
    <button class="btn-primary block w-full my-2" on:click={() => { navigator.clipboard.writeText(window.location.href); }}>Invite</button>
    <hr class="my-4 !border-t-4 !border-dashed !border-black">
    <h5 class="h5 mb-2 font-bold">Players ({players.length}/10):</h5>
    <ol>
        {#each players as player}
            <li class="card px-3 py-2 m-3 variant-filled-tertiary border-4 border-white shadow-[-2px_2px_0px_2px_white]" transition:fly={{ duration: 100, x: -20, opacity: 0 }}>{player.username} {player.isHost ? "👑" : ""}</li>
        {/each}
    </ol>
</div>

<style lang="postcss">
    #copy-roomcode {
        -webkit-text-stroke-width: 1px;
        -webkit-text-stroke-color: black;
    }

    #copy-roomcode:hover {
        filter: brightness(1.15);
    }

    #copy-roomcode::before {
        content: attr(value);
        @apply text-primary-500;
        position: absolute;
        z-index: 1;
        @apply bottom-[2px] left-[2px];
    }
</style>