<script>
    export let data;
    import { globalSocket } from '$lib/socket.js';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';

    const socket = globalSocket
    let { players, username, story, gameSettings } = data
    let input = ""
    let fillValue = ""
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

    socket.on("updateFillValue", (updatedFillValue) => {
        fillValue = updatedFillValue
        console.log("Fill update!", fillValue)
    })

    socket.on("startGameSummary", () => {
        goto(`/game/${data.roomId}/summary`)
    })

    function fillGap() {
        if(!input)
            return
        socket.emit("gapFilled", data.roomId, data.username, input)
        input = ""
    }

    function inputValueChange() {
        socket.emit("fillValueChanged", data.roomId, data.username, input)
    }
</script>

{#if $gameVariables}
    <hr class="my-4">
    <div class="card p-4 grid grid-cols-[1fr_auto]">
        <div class="text-center h-full grid grid-rows-[auto_1fr]">
            <h4>{ story.title }</h4>
            <div class="flex justify-center items-center">
                <div class="card p-6 variant-filled-primary">
                    {#if ($gameVariables.turn == data.playerIndex)}
                    <div class="input-group input-group-divider grid grid-cols-[1fr_auto]">
                        <input type="text" class="input" bind:value={input} on:input={inputValueChange}>
                        <button on:click={fillGap} class="btn variant-filled-surface">Confirm</button>
                    </div>
                    {:else}
                    <p>{ fillValue }</p>
                    {/if}
                </div>
            </div>
        </div>
        <div class="card variant-outline-primary p-4">
            <h3 class="card h3 py-1 px-3 w-max variant-filled-tertiary">Round {$gameVariables.round}</h3>
            <h3>Queue:</h3>
            <ul>
                {#each orderedPlayers as player}
                    {#if player}
                        <li class="player">{player.username} {player.username == username ? "(you)" : ""}</li>
                    {/if}
                {/each}
            </ul>
        </div>
    </div>
    <!-- <div id="words-container">
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
    </div> -->
{/if}

<style>
    .player:nth-last-child(2) {
        opacity: 40%;
    }

    .player:last-child {
        opacity: 15%;
    }

    #words-container {
        display: grid;
        grid-template-columns: 1fr auto;
    }
</style>