<script>
    export let data;
    import { globalSocket } from '$lib/socket.js';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    const socket = globalSocket
    let { players, username, story, gameSettings, chat } = data
    let gameVariables = writable(undefined)

    onMount(() => {
        socket.emit("getGameVariables", data.roomId, (vars) => {
            gameVariables.set(vars)
        })
    })

    function leaveRoom() {
        socket.emit("leavingRoom", data.roomId, () => {
            goto("/game")
        })
    }
</script>

{#if $gameVariables}
    <button on:click={leaveRoom}>Leave room</button>
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