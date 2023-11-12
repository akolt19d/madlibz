<script>
    import { globalSocket } from "$lib/socket";
    import { flip } from "svelte/animate";
    import { fly } from "svelte/transition";
    import { popup } from '@skeletonlabs/skeleton';
    export let players, roomId;
    const socket = globalSocket

    const copyPopup = {
        event: 'click',
        target: 'copyPopup',
        placement: 'bottom',
    };	

    socket.on("playerUpdate", (updatedPlayers) => {
        console.log("Player update!")
        players = updatedPlayers.map(x => {
            let { id, ...player } = x
            return player
        })
    })
</script>

<div class="p-2 h-full card bbb bt-shadow-l bg-secondary-500">
    <h3 class="h3 mx-2">Room code: <button id="copy-roomcode" class="cursor-pointer bt-text-l before:!content-[attr(value)]" title="Copy room code" value={ roomId } use:popup={copyPopup} on:click={() => { navigator.clipboard.writeText(roomId); }}>{ roomId }</button></h3>
    <button class="btn-primary block w-full my-2" use:popup={copyPopup} on:click={() => { navigator.clipboard.writeText(window.location.href); }}>Invite</button>
    <hr class="my-4 !border-t-4 !border-dashed !border-black">
    <h5 class="h5 mb-2 font-bold">Players ({players.length}/10):</h5>
    <ol>
        {#each players as player (player.username)}
            <li animate:flip={{ delay: 100, duration: 100 }} class="card px-3 py-2 m-3 text-center variant-filled-tertiary border-4 border-tertiary-700 shadow-[-2px_2px_0px_2px_#91b16a]" transition:fly={{ duration: 100, x: -20, opacity: 0 }}>{player.username} {player.isHost ? "👑" : ""}</li>
        {/each}
    </ol>
</div>
<div class="card px-2 py-1 variant-filled-success border-4 border-black shadow-[-2px_2px_0px_2px_black]" data-popup="copyPopup">
    <p class="font-bold text-black">Copied!</p>
</div>
					

<style lang="postcss">
    #copy-roomcode:hover {
        filter: brightness(1.15);
    }
</style>