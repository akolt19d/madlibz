<script>
    export let data;
    import { globalSocket } from '$lib/socket.js';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { getModalStore } from '@skeletonlabs/skeleton';
    import StoryCard from '$lib/components/StoryCard.svelte';
    import Story from './Story.svelte';
    import { fade } from 'svelte/transition';

    const socket = globalSocket
    const modalStore = getModalStore()

    let { players, username, story, gameSettings, isPlayerHost } = data
    let gameVariables = writable(undefined)
    let canRate = Object.keys(story).length != 3

    function triggerStoryModal() {
        modalStore.trigger({
            type: "component",
            component: { ref: Story },
            title: story.title,
            body: $gameVariables.filledStory
        })
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

    function rateStory(positive) {
        if(Object.keys(story).length != 3) {
            socket.emit("ratingStory", data.roomId, story._id, positive, () => {
                canRate = false
                if(positive)
                    story.likes += 1
                else
                    story.dislikes += 1
            })
        }
    }

    function endSummary() {
        socket.emit("endingSummary", data.roomId)
    }

    function leaveRoom() {
        socket.emit("leavingRoom", data.roomId, () => {
            goto("/game")
        })
    }
</script>

<svelte:head>
    <title>{ story.title }</title>
</svelte:head>

{#if $gameVariables}
    <div>
        <button on:click={leaveRoom} class="btn-error shadow-[-2px_2px_0_2px_#8b3731] ml-[2px]">Leave room</button>
        {#if isPlayerHost}
            <button on:click={endSummary} class="btn-warning shadow-[-2px_2px_0_2px_#b57e40]">End summary</button>
        {/if}
    </div>
    <div class="card my-4 p-6 bbb bt-shadow-r flex justify-center items-center flex-col gap-2">
        <div class="flex justify-center flex-col gap-3 text-center">
            <p>Well done, you've completed:</p>
            <StoryCard {story} />
            {#if canRate}
                <div transition:fade={{ duration: 300, delay: 200 }}>
                    <p class="mt-2">Did you like it?</p>
                    <div class="grid grid-cols-2">
                        <div>
                            <button on:click={() => { rateStory(true) }} class="btn-success">Yes 👍</button>
                        </div>
                        <div>
                            <button on:click={() => { rateStory(false) }} class="btn-error">No 👎</button>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
        <!-- <ol>
            {#each $gameVariables.fills as fill}
                <li>{ fill }</li>
            {/each}
        </ol> -->
        <button class="btn-secondary mt-2" on:click={triggerStoryModal}>View story</button>
        <!-- <div class="card max-h-full max-w-6xl p-6 overflow-y-auto variant-filled-tertiary border-4 border-tertiary-700 shadow-[2px_2px_0_2px_#91b16a]">
        </div> -->
    </div>
{/if}