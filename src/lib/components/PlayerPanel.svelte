<script>
    import { globalSocket } from "$lib/socket";
    import { flip } from "svelte/animate";
    import { fly } from "svelte/transition";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { showCopyToast } from "$lib/ToastUtils";
    export let players, roomId;
    const socket = globalSocket
    const toastStore = getToastStore()
    
    function copy(text, message) {
        navigator.clipboard.writeText(text);
        showCopyToast(toastStore, message)
    }

    socket.on("playerUpdate", (updatedPlayers) => {
        console.log("Player update!")
        players = updatedPlayers.map(x => {
            let { id, ...player } = x
            return player
        })
    })
</script>

<div class="p-2 h-full card bbb bt-shadow-l bg-secondary-500">
    <h3 class="h3 mx-2">Room code: <button id="copy-roomcode" class="cursor-pointer bt-text-l before:!content-[attr(value)]" title="Copy room code" value={ roomId } on:click={() => { copy(roomId, "room code") }}>{ roomId }</button></h3>
    <button class="btn-primary block w-full my-2" on:click={() => { copy(window.location.href, "link to game") }}>Invite</button>
    <hr class="my-4 !border-t-4 !border-dashed !border-black">
    <h5 class="h5 mb-2 font-bold">Players ({players.length}/10):</h5>
    <ol>
        {#each players as player (player.username)}
            <li animate:flip={{ delay: 100, duration: 100 }} class="card px-3 py-2 m-3 text-center variant-filled-tertiary border-4 border-tertiary-700 shadow-[-2px_2px_0px_2px_#91b16a]" transition:fly={{ duration: 100, x: -20, opacity: 0 }}>{player.username} {player.isHost ? "👑" : ""}</li>
        {/each}
    </ol>
</div>
					

<style lang="postcss">
    #copy-roomcode:hover {
        filter: brightness(1.15);
    }
</style>