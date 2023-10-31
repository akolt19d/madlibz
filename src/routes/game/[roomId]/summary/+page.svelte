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
</script>

{#if $gameVariables}
    {#if isPlayerHost}
        <button on:click={endSummary}>End summary</button>
    {/if}
    <ol>
        {#each $gameVariables.fills as fill}
            <li>{ fill }</li>
        {/each}
    </ol>
    <div>
        <h3>{ story.title }</h3>
        <p>{ $gameVariables.filledStory }</p>
    </div>
{/if}