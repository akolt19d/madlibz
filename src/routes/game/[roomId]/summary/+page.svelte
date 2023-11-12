<script>
    export let data;
    import { globalSocket } from '$lib/socket.js';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    const socket = globalSocket
    let { players, username, story, gameSettings, isPlayerHost } = data
    let gameVariables = writable(undefined)

    onMount(() => {
        socket.emit("getGameVariables", data.roomId, (vars) => {
            gameVariables.set(vars)
        })
    })

    socket.on("summaryEnded", () => {
        goto(`/game/${data.roomId}`)
    })

    function endSummary() {
        socket.emit("endingSummary", data.roomId)
    }

    function leaveRoom() {
        socket.emit("leavingRoom", data.roomId, () => {
            goto("/game")
        })
    }
</script>

{#if $gameVariables}
    <div>
        <button on:click={leaveRoom} class="btn-error shadow-[-2px_2px_0_2px_#8b3731] ml-[2px]">Leave room</button>
        {#if isPlayerHost}
            <button on:click={endSummary} class="btn-warning shadow-[-2px_2px_0_2px_#b57e40]">End summary</button>
        {/if}
    </div>
    <div class="card my-4 p-6 bbb bt-shadow-r">
        <ol>
            {#each $gameVariables.fills as fill}
                <li>{ fill }</li>
            {/each}
        </ol>
        <div>
            <h3>{ story.title }</h3>
            <p>{ $gameVariables.filledStory }</p>
        </div>
    </div>
{/if}