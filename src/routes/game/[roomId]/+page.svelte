<script>
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import Loader from "$lib/components/Loader.svelte";
    import { globalSocket } from "$lib/socket.js";
    import { TabGroup, Tab } from '@skeletonlabs/skeleton';
    export let data;

    const socket = globalSocket

    let { players, isPlayerHost } = data
    let loading = false

    let gameOption = false
    let story
    let selectedStory = null

    onMount(() => {
        story = getStory()
    })

    socket.on("startGame", () => {
        goto(`/game/${data.roomId}/play`)
    })

    async function getStory() {
        const res = await fetch('/api/story?id=65381226d28bcf3c21673659')
        const story = await res.json()
        return story
    }

    async function startGame() {
        if(story)
            socket.emit("startingGame", data.roomId, await getStory())
        else 
            alert("You must choose a story!")
    }
</script>

{#if loading}
    <Loader />
{:else}
    {#if isPlayerHost}
        <button on:click={startGame}  class="btn variant-filled-success">Start game</button>
    {/if}
    <hr class="mt-4">
    <div class="card my-2 p-6 bbb bt-shadow-r">
        <TabGroup>
            <Tab bind:group={gameOption} value={true}>Select existing story</Tab>
            <Tab bind:group={gameOption} value={false}>Upload custom story</Tab>
            <svelte:fragment slot="panel">
                {#if gameOption}
                    {#await story}
                        <p>waiting...</p>
                    {:then fetchedStory}
                    <div class="card variant-filled-surface p-2">
                        <h3>{fetchedStory.title}</h3>
                        <h6>{ fetchedStory.gapAmount } gaps</h6>
                        {#if fetchedStory.gapAmount > players.length}
                            <p class="warning">Warning! There aren't enough gaps for the amount of players in the lobby. Someone won't get to play.</p>
                        {/if}
                        <button on:click={() => { selectedStory = fetchedStory }}>Select</button>
                    </div>
                    {/await}
                {:else}
                    <input type="text" name="title" placeholder="Title" class="input mb-1"><br>
                    <textarea cols="30" rows="10" placeholder="Story..." class="input" /><br>
                {/if}
            </svelte:fragment>
        </TabGroup>
    </div>
{/if}

<style>    
    .warning {
        color: var(--color-error-500);
    }
</style>