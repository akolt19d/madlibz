<script>
    export let data;
    import { globalSocket } from '$lib/socket.js';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { ProgressBar } from '@skeletonlabs/skeleton';
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';

    const socket = globalSocket
    let { players, username, story, gameSettings } = data
    let input = ""
    let fillValue = ""
    let gameVariables = writable(undefined)
    let orderedPlayers = []
    $: if($gameVariables) {
        orderedPlayers = $gameVariables.extendedOrder?.map(x => players[x-1]).slice($gameVariables.round-1).slice(0, 5)
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

    function leaveRoom() {
        socket.emit("leavingRoom", data.roomId, () => {
            goto("/game")
        })
    }

    function processKeyPress(event) {
        if(event.key === "Enter")
            document.getElementById("prompt-button").click()
    }
</script>

{#if $gameVariables}
    <div>
        <button on:click={leaveRoom} class="btn-error shadow-[-2px_2px_0_2px_#8b3731] ml-[2px]">Leave room</button>
    </div>
    <div class="card my-4 p-6 bbb bt-shadow-r grid grid-cols-[1fr_auto]">
        <div class="text-center h-full grid grid-rows-[auto_1fr] pr-6">
            <div>
                <h1 class="h1 bt-text-r" data-value={story.title}>{ story.title }</h1>
                <ProgressBar value={(($gameVariables.round-1)/story.gapAmount) * 100} track="bg-secondary-200" meter="bg-primary-500 transition-[width]" height="h-4" class="my-2 border-4 border-black !shadow-[1px_1px_0_1px_black]" />
            </div>
            <div class="flex justify-center flex-row items-center relative">
                {#key $gameVariables.gaps.length}
                    <div in:fly={{ duration: 400, x: -400, opacity: 0 }} out:fly={{ duration: 400, x: 400, opacity: 0 }} class="card w-fit mx-auto p-2 variant-filled-warning border-4 border-warning-700 shadow-[0_2px_0_2px_#b57e40] absolute top-0">Please input: <span>{ $gameVariables.gaps[0] }</span></div>
                {/key}
                <div class="card p-6 variant-filled-tertiary border-4 border-tertiary-700 shadow-[2px_2px_0_2px_#91b16a]">
                    {#if ($gameVariables.turn == data.playerIndex)}
                        <p class="h3 mb-2">It's your turn, <span  class="bt-text-r before:text-secondary-500" data-value={ orderedPlayers[0].username }>{ orderedPlayers[0].username }</span></p>
                        <div class="input-group input-group-divider !bg-primary-300 !border-primary-700 focus-within:!border-dashed focus-within:!border-primary-500 grid-cols-[1fr_auto]">
                            <input type="text" class="!bg-primary-300 focus:!bg-transparent" placeholder={$gameVariables.gaps[0]} bind:value={input} on:keypress={processKeyPress} on:input={inputValueChange}>
                            <button on:click={fillGap} class="btn variant-filled-primary !rounded-r-none" id="prompt-button">Confirm</button>
                        </div>
                    {:else}
                        {#if orderedPlayers[0]}
                            <p class="h3 mb-2">It's <span  class="bt-text-r before:text-secondary-500" data-value={ orderedPlayers[0].username }>{ orderedPlayers[0].username }</span>'s turn</p>
                            <input disabled class="input-primary !bg-primary-300 focus:!bg-transparent" value={ fillValue }>
                        {/if}
                    {/if}
                </div>
            </div>
        </div>
        <div class="h-full border-l-4 border-black border-dashed pl-6 grid grid-rows-[auto_1fr]">
            <div class="text-center">
                <h3 class="h3 bt-text-r before:!text-tertiary-500" data-value={"Round " + $gameVariables.round}>Round {$gameVariables.round}</h3>
                <p>Queue:</p>
            </div>
            <ul class="grid grid-rows-5">
                {#if orderedPlayers.length > 0}
                    {#each orderedPlayers.filter(x => x) as player, i (i+$gameVariables.round)}
                        <li animate:flip={{ duration: 350 }} class="player card p-2 my-2 flex justify-center items-center font-bold variant-filled-secondary border-4 border-secondary-700 shadow-[2px_2px_0_2px_#9e5f8d]">{player.username} {player.username == username ? "(you)" : ""}</li>
                    {/each}
                {/if}
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

    .player:first-child {
        opacity: 100% !important;
    }

    #words-container {
        display: grid;
        grid-template-columns: 1fr auto;
    }
</style>