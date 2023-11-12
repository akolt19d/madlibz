<script>
    export let data;
    import { globalSocket } from '$lib/socket.js';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    const socket = globalSocket
    let { players, username, story, gameSettings, isPlayerHost } = data
    let gameVariables = writable(undefined)
    let pForStory;
    $: if(pForStory) {
        pForStory.innerHTML = $gameVariables.filledStory
    }			

    onMount(() => {
        socket.emit("getGameVariables", data.roomId, (vars) => {
            gameVariables.set(vars)
            console.log($gameVariables, story)
        })
    })

    socket.on("summaryEnded", () => {
        goto(`/game/${data.roomId}`)
    })

    socket.on("playerUpdate", (updatedPlayers) => {
        console.log("Player update!")
        players = updatedPlayers.map(x => {
            let { id, ...player } = x
            return player
        })

        let host = players.filter(x => x.isHost)[0]
        isPlayerHost = host.username == data.username
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
    <div class="card my-4 p-6 bbb bt-shadow-r flex justify-center items-center flex-col gap-2">
        <h1 class="h1 bt-text-r" data-value={story.title}>{ story.title }</h1>
        <!-- <ol>
            {#each $gameVariables.fills as fill}
                <li>{ fill }</li>
            {/each}
        </ol> -->
        <div class="card max-h-full max-w-6xl p-6 overflow-y-auto variant-filled-tertiary border-4 border-tertiary-700 shadow-[2px_2px_0_2px_#91b16a]">
            <p bind:this={pForStory}></p>
        </div>
    </div>
{/if}